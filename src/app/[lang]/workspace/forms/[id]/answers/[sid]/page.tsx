import { AnswerDetail } from "@/components/workspace/forms/answer-detail";

export default async function Page({ params }: PageProps<"/[lang]/workspace/forms/[id]/answers/[sid]">) {
  const { id, sid } = await params;
  return <AnswerDetail app="forms" id={id} sid={sid} />;
}
