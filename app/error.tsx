"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <h1 className="mb-5 text-xl font-semibold">טעינת נתוני הלימוד נכשלה</h1>
        <Button onClick={reset}>נסה שוב</Button>
      </div>
    </main>
  );
}
