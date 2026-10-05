import { apiBase } from "@/lib/api";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Streams one file of a public form answer to plc-form (through the
 * gateway). Server actions cap bodies at 1 MB, so uploads come here.
 */
export async function PUT(request: Request, { params }: RouteContext<"/api/form-files/[id]">) {
  const { id } = await params;
  const length = request.headers.get("content-length");
  if (!UUID.test(id) || !length || !request.body) return Response.json({ message: "Bad request" }, { status: 400 });
  const forwarded = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const res = await fetch(`${apiBase()}/api/form/public/attachments/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/octet-stream",
      "content-length": length,
      ...(forwarded && { "x-forwarded-for": forwarded }),
    },
    body: request.body,
    duplex: "half",
    cache: "no-store",
  } as RequestInit & { duplex: "half" });
  return new Response(res.body, { status: res.status, headers: { "content-type": res.headers.get("content-type") ?? "application/json" } });
}
