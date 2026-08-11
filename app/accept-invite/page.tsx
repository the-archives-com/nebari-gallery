import { Suspense } from "react";

import AcceptInviteClient from "./AcceptInviteClient";

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <Suspense
        fallback={
          <p className="text-center italic text-stone-500">
            🌿 Opening your invitation...
          </p>
        }
      >
        <AcceptInviteClient />
      </Suspense>
    </main>
  );
}