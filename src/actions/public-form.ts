"use server";

import { z } from "zod";
import { ApiError, formPublicSend, visitorHeaders } from "@/lib/api";
import type { FieldErrors } from "@/lib/types";

const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

const fileSchema = z.object({
  id: z.uuid(),
  field_key: z.string().regex(/^[a-z][a-z0-9_]{0,63}$/),
  mime: z.string().max(120),
  size: z.number().int().positive(),
  checksum: z.string().regex(/^[0-9a-f]{64}$/i),
  name: z.string().trim().min(1).max(200),
});

export type PublicFile = z.infer<typeof fileSchema>;

export type PublicSubmitResult =
  | { ok: true; uploads: string[] }
  | { ok: false; error: "invalid" | "closed" | "rateLimited" | "failed"; message?: string; errors?: FieldErrors };

/**
 * Sends the answers of a shared form. Files are only announced here (id,
 * size, sha256); the browser then streams each one to /api/form-files/:id.
 */
export async function submitPublicForm(token: string, data: Record<string, unknown>, files: PublicFile[]): Promise<PublicSubmitResult> {
  const parsed = z.array(fileSchema).max(20).safeParse(files);
  if (!TOKEN.test(token) || !parsed.success || typeof data !== "object" || data === null) return { ok: false, error: "invalid" };
  try {
    const res = await formPublicSend<{ id: string; uploads: { id: string }[] }>(
      "POST",
      `/forms/${token}/submissions`,
      { data, files: parsed.data },
      await visitorHeaders(),
    );
    return { ok: true, uploads: res.uploads.map((u) => u.id) };
  } catch (e) {
    if (!(e instanceof ApiError)) return { ok: false, error: "failed" };
    if (e.status === 422 && e.body.errors) return { ok: false, error: "invalid", errors: e.body.errors as FieldErrors };
    if (e.status === 429) return { ok: false, error: "rateLimited" };
    if (e.status === 404 || e.status === 403) return { ok: false, error: "closed" };
    return { ok: false, error: "failed", message: e.message };
  }
}
