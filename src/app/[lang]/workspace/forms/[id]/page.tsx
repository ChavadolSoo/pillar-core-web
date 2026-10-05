import { FormDetail } from "@/components/workspace/forms/form-detail";

export default async function Page({ params, searchParams }: PageProps<"/[lang]/workspace/forms/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <FormDetail app="forms" id={id} view={typeof sp.view === "string" ? sp.view : undefined} page={Math.max(1, Number(sp.page) || 1)} />;
}
