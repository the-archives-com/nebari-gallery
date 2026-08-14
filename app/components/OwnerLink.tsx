"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type OwnerLinkProps = {
  variant?: "header" | "footer";
};

export default function OwnerLink({
  variant = "footer",
}: OwnerLinkProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(Boolean(session));
      setReady(true);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(Boolean(session));
        setReady(true);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return null;
  }

  const isHeader = variant === "header";

  return (
    <Link
      href={loggedIn ? "/account" : "/login"}
      className={
        isHeader
          ? "rounded-full bg-nebari-green px-4 py-2 text-white transition-all hover:opacity-90"
          : "transition-colors hover:text-stone-700"
      }
    >
      {isHeader
        ? loggedIn
          ? "Account"
          : "Login"
        : loggedIn
          ? "My Account"
          : "Studio Login"}
    </Link>
  );
}