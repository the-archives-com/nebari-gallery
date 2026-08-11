"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type Membership = {
  studio_slug: string;
  role: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [membership, setMembership] =
    useState<Membership | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Could not load signed-in user:",
          userError,
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("studio_members")
        .select("studio_slug, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Could not load Studio membership:",
          error,
        );

        setMessage(
          "Your account is active, but we could not load your Studio.",
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setMessage(
          "Your login is active, but no Studio is linked to this account yet.",
        );

        setLoading(false);
        return;
      }

      setMembership(data);
      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  const isNebariAdmin =
    membership?.studio_slug === "nebari" &&
    membership?.role === "owner";

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <p className="text-center italic text-nebari-muted">
          Opening your Studio account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* TOP BRAND BAR */}

      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.14em]">

            <Link
              href="/"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Home
            </Link>

            <Link
              href="/gallery"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Gallery
            </Link>

            <Link
              href="/studios"
              className="text-nebari-muted transition-colors hover:text-nebari-green"
            >
              Studios
            </Link>

          </nav>

        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-10 px-6 py-16">

        {/* ACCOUNT HEADER */}

        <header className="text-center">

          <p className="nebari-brand text-xs text-nebari-maple">
            Studio Nebari
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium text-nebari-ink">
            My Account
          </h1>

          <div className="mx-auto mt-5 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

        </header>

        {/* ACCOUNT CARD */}

        <section className="space-y-6 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
              Signed in as
            </p>

            <p className="mt-2 break-words text-nebari-ink">
              {email}
            </p>
          </div>

          {membership && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
                Studio
              </p>

              <p className="mt-2 capitalize text-nebari-ink">
                {membership.studio_slug}
              </p>
            </div>
          )}

          {message && (
            <p className="rounded-xl bg-nebari-paper/50 p-4 text-sm leading-6 text-nebari-muted">
              {message}
            </p>
          )}

          {membership && (
            <Link
              href={`/studios/${membership.studio_slug}`}
              className="flex w-full items-center justify-center rounded-full bg-nebari-green px-8 py-3 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Open My Studio
            </Link>
          )}

          <Link
            href="/update-password"
            className="flex w-full items-center justify-center rounded-full border border-nebari-border px-8 py-3 text-sm text-nebari-ink transition-all hover:bg-nebari-paper/40 active:scale-[0.98]"
          >
            Change Password
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-full border border-nebari-border px-8 py-3 text-sm text-nebari-muted transition-all hover:bg-nebari-paper/40 hover:text-nebari-ink active:scale-[0.98]"
          >
            Sign Out
          </button>

        </section>

        {/* NEBARI ADMINISTRATION */}

        {isNebariAdmin && (
          <section className="space-y-6 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">

            <div className="text-center">

              <p className="text-3xl">
                🍁
              </p>

              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
                Nebari Administration
              </p>

              <h2 className="nebari-serif mt-3 text-3xl font-medium text-nebari-ink">
                Behind the Gallery
              </h2>

              <p className="mt-3 text-sm leading-6 text-nebari-muted">
                Create Studios, look after people,
                and curate the shared Gallery.
              </p>

            </div>

            <Link
              href="/admin/studios"
              className="flex w-full items-center justify-between rounded-xl border border-nebari-border px-5 py-4 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/40"
            >
              <span>
                Manage Studios
              </span>

              <span>
                →
              </span>
            </Link>

            <Link
              href="/admin/gallery"
              className="flex w-full items-center justify-between rounded-xl border border-nebari-border px-5 py-4 text-sm text-nebari-ink transition-all hover:border-nebari-sage hover:bg-nebari-paper/40"
            >
              <span>
                Gallery Submissions
              </span>

              <span>
                →
              </span>
            </Link>

          </section>
        )}

        {/* FOOTER */}

        <footer className="flex justify-center gap-4 text-xs text-nebari-muted">

          <Link
            href="/privacy"
            className="transition-colors hover:text-nebari-green"
          >
            Privacy
          </Link>

          <span aria-hidden="true">
            ·
          </span>

          <Link
            href="/terms"
            className="transition-colors hover:text-nebari-green"
          >
            Terms
          </Link>

          <span aria-hidden="true">
            ·
          </span>

          <Link
            href="/"
            className="transition-colors hover:text-nebari-green"
          >
            Studio Nebari
          </Link>

        </footer>

      </div>

    </main>
  );
}