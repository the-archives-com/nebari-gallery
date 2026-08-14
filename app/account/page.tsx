"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type Membership = {
  studio_slug: string;
  role: string;
};

type Studio = {
  slug: string;
  name: string;
  owner: string | null;
  icon: string | null;
};

export default function AccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [memberships, setMemberships] =
    useState<Membership[]>([]);

  const [studios, setStudios] =
    useState<Studio[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      setMessage("");

      /*
       * 1. FIND THE SIGNED-IN USER
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        router.replace("/login");
        return;
      }

      setEmail(
        user.email ?? "",
      );

      /*
       * 2. LOAD EVERY STUDIO MEMBERSHIP
       *    BELONGING TO THIS USER
       */

      const {
        data: membershipData,
        error: membershipError,
      } = await supabase
        .from("studio_members")
        .select(
          "studio_slug, role",
        )
        .eq(
          "user_id",
          user.id,
        );

      if (membershipError) {
        console.error(
          "Could not load Studio memberships:",
          membershipError,
        );

        setMessage(
          "Your Studio access could not be loaded.",
        );

        setLoading(false);
        return;
      }

      const loadedMemberships =
        membershipData ?? [];

      setMemberships(
        loadedMemberships,
      );

      /*
       * 3. LOAD THE STUDIOS ASSOCIATED
       *    WITH THOSE MEMBERSHIPS
       */

      const studioSlugs =
        loadedMemberships.map(
          (membership) =>
            membership.studio_slug,
        );

      if (
        studioSlugs.length === 0
      ) {
        setStudios([]);
        setLoading(false);
        return;
      }

      const {
        data: studioData,
        error: studioError,
      } = await supabase
        .from("studios")
        .select(
          "slug, name, owner, icon",
        )
        .in(
          "slug",
          studioSlugs,
        );

      if (studioError) {
        console.error(
          "Could not load Studios:",
          studioError,
        );

        setMessage(
          "Your Studio details could not be loaded.",
        );

        setLoading(false);
        return;
      }

      setStudios(
        studioData ?? [],
      );

      setLoading(false);
    }

    loadAccount();
  }, [router]);

  /*
   * NEBARI ADMIN ACCESS
   *
   * Administration remains restricted to
   * somebody who owns the special "nebari"
   * Studio.
   */

  const isNebariAdmin =
    memberships.some(
      (membership) =>
        membership.studio_slug ===
          "nebari" &&
        membership.role ===
          "owner",
    );

  /*
   * DON'T DISPLAY THE ADMINISTRATION
   * STUDIO AS A NORMAL CREATIVE STUDIO
   */

  const personalMemberships =
    memberships.filter(
      (membership) =>
        membership.studio_slug !==
        "nebari",
    );

  function findStudio(
    slug: string,
  ) {
    return studios.find(
      (studio) =>
        studio.slug === slug,
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.replace(
      "/login",
    );

    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">

        <p className="text-center italic text-nebari-muted">
          Opening your account...
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

      <div className="mx-auto max-w-xl px-6 py-16">

        {/* HEADER */}

        <header className="text-center">

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Studio Access
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Your account.
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-nebari-maple/40" />

            <span className="text-sm text-nebari-maple">
              ◆
            </span>

            <span className="h-px w-12 bg-nebari-maple/40" />

          </div>

        </header>

        {/* ACCOUNT CARD */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

          <div className="p-8">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
              Signed in as
            </p>

            <p className="mt-2 text-sm font-medium text-nebari-ink">
              {email}
            </p>

          </div>

          {/* STUDIO ACCESS */}

          <div className="border-t border-nebari-border bg-nebari-paper/30 px-8 py-7">

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
              Studio Access
            </p>

            {personalMemberships.length ===
            0 ? (
              <>
                <p className="nebari-serif mt-3 text-2xl text-nebari-ink">
                  No Studio linked yet.
                </p>

                <p className="mt-3 text-sm leading-6 text-nebari-muted">
                  Your login is active, but no
                  Studio is linked to this
                  account yet.
                </p>
              </>
            ) : (
              <div className="mt-4 space-y-4">

                {personalMemberships.map(
                  (membership) => {
                    const studio =
                      findStudio(
                        membership.studio_slug,
                      );

                    return (
                      <div
                        key={
                          membership.studio_slug
                        }
                        className="rounded-xl border border-nebari-border bg-nebari-surface p-5"
                      >

                        <div className="flex items-start gap-4">

                          <span className="text-2xl">
                            {studio?.icon ||
                              "🌿"}
                          </span>

                          <div className="min-w-0 flex-1">

                            <p className="nebari-serif text-xl text-nebari-ink">
                              {studio?.name ??
                                membership.studio_slug}
                            </p>

                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-nebari-muted">
                              {
                                membership.role
                              }
                            </p>

                            <Link
                              href={`/studios/${membership.studio_slug}`}
                              className="mt-4 inline-block text-sm text-nebari-green transition-colors hover:text-nebari-sage"
                            >
                              Open Studio →
                            </Link>

                          </div>

                        </div>

                      </div>
                    );
                  },
                )}

              </div>
            )}

          </div>

        </section>

        {/* ADMINISTRATION */}

        {isNebariAdmin && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">

            <div className="p-8">

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
                Behind the Gallery
              </p>

              <h2 className="nebari-serif mt-3 text-2xl text-nebari-ink">
                Nebari Administration
              </h2>

              <p className="mt-3 text-sm leading-6 text-nebari-muted">
                Review Gallery submissions,
                set up artists and manage
                their Studios.
              </p>

              <div className="mt-6 divide-y divide-nebari-border">

                {/* GALLERY SUBMISSIONS */}

                <Link
                  href="/admin/gallery"
                  className="group flex items-center justify-between py-5 text-nebari-ink transition-colors hover:text-nebari-green"
                >

                  <div>

                    <p className="text-sm font-medium">
                      Gallery Submissions
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nebari-muted">
                      Review work submitted
                      for the shared Gallery.
                    </p>

                  </div>

                  <span className="ml-4 text-sm transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </Link>

                {/* SETUP ARTISTS */}

                <Link
                  href="/admin/users"
                  className="group flex items-center justify-between py-5 text-nebari-ink transition-colors hover:text-nebari-green"
                >

                  <div>

                    <p className="text-sm font-medium">
                      Setup Artists
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nebari-muted">
                      Invite artists, find
                      existing accounts and
                      connect Studio access.
                    </p>

                  </div>

                  <span className="ml-4 text-sm transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </Link>

                {/* SETUP STUDIOS */}

                <Link
                  href="/admin/studios"
                  className="group flex items-center justify-between py-5 text-nebari-ink transition-colors hover:text-nebari-green"
                >

                  <div>

                    <p className="text-sm font-medium">
                      Setup Studios
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nebari-muted">
                      Create and manage
                      existing Studio spaces.
                    </p>

                  </div>

                  <span className="ml-4 text-sm transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </Link>

              </div>

            </div>

          </section>
        )}

        {/* ACCOUNT ACTIONS */}

        <section className="mt-8 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">

          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
            Account
          </p>

          <div className="mt-5 space-y-3">

            <Link
              href="/update-password"
              className="flex w-full items-center justify-center rounded-full border border-nebari-green px-7 py-3 text-sm text-nebari-green transition-colors hover:bg-nebari-green hover:text-white"
            >
              Change Password
            </Link>

            <button
              type="button"
              onClick={
                handleSignOut
              }
              className="w-full rounded-full border border-nebari-border px-7 py-3 text-sm text-nebari-muted transition-colors hover:border-nebari-maple hover:text-nebari-maple"
            >
              Sign Out
            </button>

          </div>

        </section>

        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl bg-nebari-paper/40 p-4 text-center text-sm leading-6 text-nebari-muted"
          >
            {message}
          </p>
        )}

        <div className="mt-10 text-center">

          <Link
            href="/"
            className="text-sm text-nebari-muted transition-colors hover:text-nebari-green"
          >
            ← Return to Studio Nebari
          </Link>

        </div>

      </div>

      {/* TIMBER FOOTER */}

      <footer className="mt-12 border-t border-[#2b211c] bg-[#3b2f2a]">

        <div className="mx-auto max-w-6xl px-6 py-8 text-center">

          <div className="mx-auto mb-4 flex items-center justify-center gap-3">

            <span className="h-px w-12 bg-[#6b1d1d]" />

            <span className="text-[#6b1d1d]">
              ◆
            </span>

            <span className="h-px w-12 bg-[#6b1d1d]" />

          </div>

          <p className="nebari-brand text-xs text-[#e8e1d5]">
            Roots first. Growth second.
          </p>

        </div>

      </footer>

    </main>
  );
}