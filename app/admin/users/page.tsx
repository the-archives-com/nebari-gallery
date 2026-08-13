"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../../lib/supabase";

type Membership = {
  studioSlug: string;
  role: string;
};

type NebariUser = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  memberships: Membership[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<NebariUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersMessage, setUsersMessage] = useState("");

  const [search, setSearch] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const [selectedUser, setSelectedUser] =
    useState<NebariUser | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioSlug, setStudioSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌿");
  const [colour, setColour] = useState("");

  const [creatingStudio, setCreatingStudio] =
    useState(false);

  const [studioMessage, setStudioMessage] =
    useState("");

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error(
        "Your login could not be verified. Please sign in again.",
      );
    }

    return session.access_token;
  }

  async function loadUsers() {
    setLoadingUsers(true);
    setUsersMessage("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/admin/users",
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setUsersMessage(
          result.error ??
            "Nebari could not load the users.",
        );

        setLoadingUsers(false);
        return;
      }

      setUsers(result.users ?? []);
    } catch (error) {
      setUsersMessage(
        error instanceof Error
          ? error.message
          : "Nebari could not load the users.",
      );
    }

    setLoadingUsers(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      user.email.toLowerCase().includes(query),
    );
  }, [search, users]);

  async function handleInvite() {
    const cleanEmail =
      inviteEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setInviteMessage(
        "Enter an email address.",
      );
      return;
    }

    setSendingInvite(true);
    setInviteMessage("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/admin/invite-user",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setInviteMessage(
          result.error ??
            "The invitation could not be sent.",
        );

        setSendingInvite(false);
        return;
      }

      setInviteMessage(
        `Invitation sent to ${result.email}.`,
      );

      setInviteEmail("");

      await loadUsers();
    } catch (error) {
      setInviteMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the invitation.",
      );
    }

    setSendingInvite(false);
  }

  function selectUser(user: NebariUser) {
    setSelectedUser(user);

    setOwnerName("");
    setStudioName("");
    setStudioSlug("");
    setDescription("");
    setIcon("🌿");
    setColour("");
    setStudioMessage("");
  }

  function handleStudioNameChange(
    value: string,
  ) {
    setStudioName(value);

    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setStudioSlug(generatedSlug);
  }

  async function handleCreateStudio() {
    if (!selectedUser) {
      return;
    }

    if (!ownerName.trim()) {
      setStudioMessage(
        "Enter the owner's name.",
      );
      return;
    }

    if (!studioName.trim()) {
      setStudioMessage(
        "Enter a Studio name.",
      );
      return;
    }

    if (!studioSlug.trim()) {
      setStudioMessage(
        "Enter a Studio address.",
      );
      return;
    }

    setCreatingStudio(true);
    setStudioMessage("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/admin/create-studio-for-user",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: selectedUser.email,
            ownerName:
              ownerName.trim(),
            studioName:
              studioName.trim(),
            studioSlug:
              studioSlug.trim(),
            description:
              description.trim(),
            icon:
              icon.trim() || "🌿",
            colour:
              colour.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setStudioMessage(
          result.error ??
            "The Studio could not be created.",
        );

        setCreatingStudio(false);
        return;
      }

      setStudioMessage(
        `${result.studioName} has been created for ${result.email}.`,
      );

      await loadUsers();

      setSelectedUser(null);
    } catch (error) {
      setStudioMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the Studio.",
      );
    }

    setCreatingStudio(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink outline-none transition-all placeholder:text-nebari-muted/60 focus:border-nebari-sage focus:ring-2 focus:ring-nebari-sage/20";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-nebari-border bg-nebari-surface/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="nebari-brand text-sm font-medium text-nebari-ink"
          >
            Studio Nebari
          </Link>

          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nebari-muted">
            Administration
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
            Nebari Access
          </p>

          <h1 className="nebari-serif mt-5 text-5xl font-medium tracking-tight text-nebari-ink">
            Users.
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-nebari-muted">
            Invite people to Nebari and assign
            Studios when they are ready.
          </p>
        </header>

        {/* INVITE USER */}

        <section className="mt-12 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">
          <h2 className="nebari-serif text-2xl text-nebari-ink">
            Invite a new user
          </h2>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) =>
                setInviteEmail(
                  event.target.value,
                )
              }
              placeholder="email@example.com"
              className="flex-1 rounded-xl border border-nebari-border bg-background px-4 py-3 text-nebari-ink outline-none"
            />

            <button
              type="button"
              onClick={handleInvite}
              disabled={sendingInvite}
              className="rounded-full bg-nebari-green px-7 py-3 text-sm text-white disabled:opacity-60"
            >
              {sendingInvite
                ? "Sending..."
                : "Send Invitation"}
            </button>
          </div>

          {inviteMessage && (
            <p className="mt-4 text-sm text-nebari-muted">
              {inviteMessage}
            </p>
          )}
        </section>

        {/* USER DIRECTORY */}

        <section className="mt-8 rounded-2xl border border-nebari-border bg-nebari-surface p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-muted">
                Existing accounts
              </p>

              <h2 className="nebari-serif mt-2 text-2xl text-nebari-ink">
                Nebari users
              </h2>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search email"
              className="rounded-xl border border-nebari-border bg-background px-4 py-2.5 text-sm text-nebari-ink outline-none"
            />
          </div>

          {loadingUsers ? (
            <p className="mt-8 text-sm text-nebari-muted">
              Loading users...
            </p>
          ) : usersMessage ? (
            <p className="mt-8 text-sm text-nebari-muted">
              {usersMessage}
            </p>
          ) : (
            <div className="mt-6 divide-y divide-nebari-border">
              {filteredUsers.map((user) => {
                const ownedStudios =
                  user.memberships.filter(
                    (membership) =>
                      membership.role ===
                      "owner",
                  );

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-nebari-ink">
                        {user.email}
                      </p>

                      {user.memberships.length >
                      0 ? (
                        <div className="mt-2 space-y-1">
                          {user.memberships.map(
                            (membership) => (
                              <p
                                key={`${membership.studioSlug}-${membership.role}`}
                                className="text-xs text-nebari-muted"
                              >
                                Studio:{" "}
                                {
                                  membership.studioSlug
                                }{" "}
                                ·{" "}
                                {
                                  membership.role
                                }
                              </p>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-nebari-muted">
                          No Studio linked
                        </p>
                      )}
                    </div>

                    {ownedStudios.length ===
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          selectUser(user)
                        }
                        className="rounded-full border border-nebari-green px-5 py-2 text-sm text-nebari-green transition-colors hover:bg-nebari-green hover:text-white"
                      >
                        Create Studio
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CREATE STUDIO */}

        {selectedUser && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-nebari-border bg-nebari-surface shadow-sm">
            <div className="p-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nebari-maple">
                Create Studio
              </p>

              <h2 className="nebari-serif mt-2 text-3xl text-nebari-ink">
                New Studio owner
              </h2>

              <p className="mt-3 text-sm text-nebari-muted">
                {selectedUser.email}
              </p>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="text-sm font-medium text-nebari-ink">
                    Owner name
                  </label>

                  <input
                    value={ownerName}
                    onChange={(event) =>
                      setOwnerName(
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-nebari-ink">
                    Studio name
                  </label>

                  <input
                    value={studioName}
                    onChange={(event) =>
                      handleStudioNameChange(
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-nebari-ink">
                    Studio address
                  </label>

                  <input
                    value={studioSlug}
                    onChange={(event) =>
                      setStudioSlug(
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-nebari-muted">
                    nebari.com.au/studios/
                    {studioSlug || "studio-name"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-nebari-ink">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    rows={4}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-nebari-ink">
                    Icon
                  </label>

                  <input
                    value={icon}
                    onChange={(event) =>
                      setIcon(
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-nebari-ink">
                    Colour
                  </label>

                  <input
                    value={colour}
                    onChange={(event) =>
                      setColour(
                        event.target.value,
                      )
                    }
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    handleCreateStudio
                  }
                  disabled={
                    creatingStudio
                  }
                  className="rounded-full bg-nebari-green px-7 py-3 text-sm text-white disabled:opacity-60"
                >
                  {creatingStudio
                    ? "Creating Studio..."
                    : "Create Studio"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedUser(null)
                  }
                  disabled={
                    creatingStudio
                  }
                  className="rounded-full border border-nebari-border px-7 py-3 text-sm text-nebari-muted"
                >
                  Cancel
                </button>
              </div>

              {studioMessage && (
                <p className="mt-5 rounded-xl bg-nebari-paper/40 p-4 text-sm text-nebari-muted">
                  {studioMessage}
                </p>
              )}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/admin/studios"
            className="text-sm text-nebari-muted hover:text-nebari-green"
          >
            ← Studio administration
          </Link>
        </div>
      </div>
    </main>
  );
}