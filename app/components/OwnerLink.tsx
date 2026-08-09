"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

export default function OwnerLink() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoggedIn(Boolean(session));
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(Boolean(session));
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Link
      href={loggedIn ? "/account" : "/login"}
      className="transition-colors hover:text-stone-700"
    >
      {loggedIn ? "My Account" : "Studio Login"}
    </Link>
  );
}