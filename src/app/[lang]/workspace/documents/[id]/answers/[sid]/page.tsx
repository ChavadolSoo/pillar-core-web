import { AnswerDetail } from "@/components/workspace/forms/answer-detail";

export default async function Page({ params }: PageProps<"/[lang]/workspace/documents/[id]/answers/[sid]">) {
  const { id, sid } = await params;
  return <AnswerDetail app="documents" id={id} sid={sid} />;
}
