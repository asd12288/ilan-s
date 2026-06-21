import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/features/auth/session";
import { readStudyData } from "@/features/study/repository";
import { StudyProvider } from "@/features/study/study-store";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  const data = await readStudyData();

  return (
    <StudyProvider initialData={data}>
      <AppShell>{children}</AppShell>
    </StudyProvider>
  );
}
