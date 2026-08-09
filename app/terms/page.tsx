import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto max-w-lg space-y-10">

        <header className="space-y-4 text-center">
          <p className="text-4xl">🍁</p>

          <h1 className="text-4xl font-light tracking-wide">
            Studio Terms
          </h1>

          <p className="leading-7 text-stone-600">
            A few simple expectations for sharing work at Edabari.
          </p>
        </header>

        <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-8 leading-8 text-stone-700 shadow-sm">
          <p>
            Studio owners keep ownership of the work they upload.
          </p>

          <p>
            By uploading work, a Studio owner gives Edabari permission
            to display that work within their Studio.
          </p>

          <p>
            Work may appear in the shared Edabari Gallery only when it
            has been selected or approved for display.
          </p>

          <p>
            Studio owners should upload only work they created or have
            permission to share.
          </p>

          <p>
            Content may be removed where necessary to protect the
            community, comply with the law or respect the rights of
            others.
          </p>

          <p>
            Studio access is by invitation. Edabari may decline or
            withdraw a Studio invitation where appropriate.
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