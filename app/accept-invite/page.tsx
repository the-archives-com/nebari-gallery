import { Suspense } from "react";

import AcceptInviteClient from "./AcceptInviteClient";

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center px-6">
            <p className="italic text-nebari-muted">
              Opening your invitation...
            </p>
          </div>
        }
      >
        <AcceptInviteClient />
      </Suspense>
    </main>
  );
}