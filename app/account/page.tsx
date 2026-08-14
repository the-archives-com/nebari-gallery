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
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [ownedStudios, setOwnedStudios] = useState<Studio[]>([]);
  const [favouriteStudios, setFavouriteStudios] = useState<Studio[]>([]);
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

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const [membershipResult, favouriteResult] = await Promise.all([
        supabase
          .from("studio_members")
          .select("studio_slug, role")
          .eq("user_id", user.id),
        supabase
          .from("studio_favourites")
          .select("studio_slug")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (membershipResult.error) {
        console.error(
          "Could not load Studio memberships:",
          membershipResult.error,
        );
        setMessage("Your Studio access could not be loaded.");
      }

      if (favouriteResult.error) {
        console.error(
          "Could not load favourite Studios:",
          favouriteResult.error,
        );
        setMessage("Your favourite artists could not be loaded.");
      }

      const loadedMemberships = membershipResult.data ?? [];
      setMemberships(loadedMemberships);

      const personalSlugs = loadedMemberships
        .filter((membership) => membership.studio_slug !== "nebari")
        .map((membership) => membership.studio_slug);

      const favouriteSlugs = (favouriteResult.data ?? []).map(
        (favourite) => favourite.studio_slug,
      );

      const allSlugs = Array.from(
        new Set([...personalSlugs, ...favouriteSlugs]),
      );

      if (allSlugs.length === 0) {
        setOwnedStudios([]);
        setFavouriteStudios([]);
        setLoading(false);
        return;
      }

      const { data: studioData, error: studioError } = await supabase
        .from("studios")
        .select("slug, name, owner, icon")
        .in("slug", allSlugs);

      if (studioError) {
        console.error("Could not load Studios:", studioError);
        setMessage("Your Studio details could not be loaded.");
        setLoading(false);
        return;
      }

      const studios = studioData ?? [];

      setOwnedStudios(
        personalSlugs
          .map((slug) => studios.find((studio) => studio.slug === slug))
          .filter((studio): studio is Studio => Boolean(studio)),
      );

      setFavouriteStudios(
        favouriteSlugs
          .filter((slug) => !personalSlugs.includes(slug))
          .map((slug) => studios.find((studio) => studio.slug === slug))
          .filter((studio): studio is Studio => Boolean(studio)),
      );

      setLoading(false);
    }

    loadAccount();
  }, [router]);

  const isNebariAdmin = memberships.some(
    (membership) =>
      membership.studio_slug === "nebari" && membership.role === "owner",
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function StudioCard({ studio }: { studio: Studio }) {
    return (
      <Link
        href={`/studios/${studio.slug}`}
        className="group flex items-start gap-4 rounded-xl border border-nebari-border bg-nebari-surface p-5 transition-all hover:-translate-y-0.5 hover:border-nebari-sage hover:shadow-md"
      >
        <span className="text-2xl">{studio.icon || "🌿"}</span>
        <div className="min-w-0 flex-1">
          <p className="nebari-serif text-xl text-nebari-ink">
            {studio.name}
          </p>
          {studio.owner && (
            <p className="mt-1 text-sm text-nebari-muted">{studio.owner}</p>
          )}
          <p className="mt-4 text-sm text-nebari-green">
            Open Studio <span className="transition-transform group-hover:translate-x-1">→</span>
          </p>
        </div>
      </Link>
    );
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
      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="nebari-brand text-sm font-medium text-nebari-ink">
            Studio Nebari
          </Link>
          <nav className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.14em]">
            <Link href="/gallery" className="text-nebari-muted transition-colors hover:text-nebari-green">
              Gallery
            </Link>
            <Link href="/studios" className="text-nebari-muted transition-colors hover:text-nebari-green">
              Studios
            </Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-6 py-16">
        <header className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Nebari Gallery
          </p>
          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Your account.
          </h1>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-nebari-maple/40" />
            <span className="text-sm text-nebari-maple">◆</span>
            <span className="h-px w-12 bg-nebari-maple/40" />
          </div>
        </header>

        {ownedStudios.length > 0 && (
          <section className="mt-10 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
              Your Studio
            </p>
            <div className="mt-5 space-y-4">
              {ownedStudios.map((studio) => (
                <StudioCard key={studio.slug} studio={studio} />
              ))}
            </div>
          </section>
        )}

        <section className={`${ownedStudios.length > 0 ? "mt-8" : "mt-10"} rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm`}>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Favourite Artists
          </p>
          {favouriteStudios.length > 0 ? (
            <div className="mt-5 space-y-4">
              {favouriteStudios.map((studio) => (
                <StudioCard key={studio.slug} studio={studio} />
              ))}
            </div>
          ) : (
            <>
              <p className="nebari-serif mt-4 text-2xl text-nebari-ink">
                No favourites yet.
              </p>
              <p className="mt-3 text-sm leading-6 text-nebari-muted">
                Visit an artist&apos;s Studio and choose Add to Favourites to keep it here.
              </p>
              <Link href="/studios" className="mt-5 inline-block text-sm text-nebari-green hover:text-nebari-maple">
                Explore Studios →
              </Link>
            </>
          )}
        </section>

        {isNebariAdmin && (
          <section className="mt-8 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
              Behind the Gallery
            </p>
            <h2 className="nebari-serif mt-3 text-2xl text-nebari-ink">
              Nebari Administration
            </h2>
            <div className="mt-6 divide-y divide-nebari-border">
              <Link href="/admin/gallery" className="group flex items-center justify-between py-5 text-sm text-nebari-ink hover:text-nebari-green">
                Gallery Submissions <span>→</span>
              </Link>
              <Link href="/admin/users" className="group flex items-center justify-between py-5 text-sm text-nebari-ink hover:text-nebari-green">
                Setup Artists <span>→</span>
              </Link>
              <Link href="/admin/studios" className="group flex items-center justify-between py-5 text-sm text-nebari-ink hover:text-nebari-green">
                Setup Studios <span>→</span>
              </Link>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
            Account Settings
          </p>
          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
            Signed in as
          </p>
          <p className="mt-2 text-sm font-medium text-nebari-ink">{email}</p>
          <div className="mt-6 space-y-3">
            <Link href="/update-password" className="flex w-full items-center justify-center rounded-full border border-nebari-green px-7 py-3 text-sm text-nebari-green transition-colors hover:bg-nebari-green hover:text-white">
              Change Password
            </Link>
            <button type="button" onClick={handleSignOut} className="w-full rounded-full border border-nebari-border px-7 py-3 text-sm text-nebari-muted transition-colors hover:border-nebari-maple hover:text-nebari-maple">
              Sign Out
            </button>
          </div>
        </section>

        {message && (
          <p role="status" className="mt-6 rounded-xl bg-nebari-paper/40 p-4 text-center text-sm leading-6 text-nebari-muted">
            {message}
          </p>
        )}

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-nebari-muted transition-colors hover:text-nebari-green">
            ← Return to Studio Nebari
          </Link>
        </div>
      </div>

      <footer className="mt-12 border-t border-[#2b211c] bg-[#3b2f2a]">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#6b1d1d]" />
            <span className="text-[#6b1d1d]">◆</span>
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
