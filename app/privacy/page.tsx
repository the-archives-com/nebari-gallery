import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-lg space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🍁</p>

          <h1 className="text-4xl font-light tracking-wide">
            Privacy
          </h1>

          <p className="leading-7 text-stone-600">
            Simple information about what Edabari stores and why.
          </p>
        </header>

        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-8 leading-8 text-stone-700 shadow-sm">
          <p>
            Edabari Studio stores the information needed to operate
            personal Studios, including account email addresses,
            artwork details and uploaded images.
          </p>

          <p>
            Artwork displayed in Studios or the shared Gallery is
            publicly viewable. Account details such as email addresses
            are not displayed publicly.
          </p>

          <p>
            Edabari does not sell personal information or use personal
            data for advertising.
          </p>

          <p>
            Studio owners may request removal of their Studio, account
            or uploaded content.
          </p>

          <p>
            Edabari is currently an invite-only creative space. New
            Studio accounts are created only after approval.
          </p>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-stone-500 transition-colors hover:text-stone-800"
          >
            ← Edabari Studio
          </Link>
        </div>

      </div>
    </main>
  );
}