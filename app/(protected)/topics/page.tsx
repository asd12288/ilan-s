"use client";

import { PageHeader } from "@/components/page-header";
import { useStudy } from "@/features/study/study-store";
import { TopicList } from "@/features/study/topic-list";

export default function TopicsPage() {
  const { data } = useStudy();

  return (
    <>
      <PageHeader title="נושאים" />
      <TopicList
        topics={data.topics.toSorted((a, b) => a.name.localeCompare(b.name, "he"))}
        courses={data.courses.toSorted((a, b) => a.position - b.position)}
      />
    </>
  );
}
