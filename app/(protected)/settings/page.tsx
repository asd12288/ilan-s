import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

export default function SettingsPage() {
  const storage = process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "JSON מקומי";
  return (
    <>
      <PageHeader title="הגדרות" />
      <div className="max-w-xl rounded-xl border bg-card px-5 shadow-sm">
        <div className="flex items-center justify-between border-b py-4 text-sm">
          <span className="text-muted-foreground">אחסון</span>
          <span className="font-medium">{storage}</span>
        </div>
        <form action={logoutAction} className="py-4">
          <Button type="submit" variant="outline">התנתקות</Button>
        </form>
      </div>
    </>
  );
}
