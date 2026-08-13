import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function GET(request: Request) {
  try {
    /*
     * 1. Verify the signed-in Nebari administrator.
     */
    const authHeader =
      request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken =
      authHeader.slice("Bearer ".length);

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your login could not be verified.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * 2. Only the Nebari owner may
     *    view the user directory.
     */
    const {
      data: adminMembership,
      error: membershipError,
    } = await supabaseAdmin
      .from("studio_members")
      .select("studio_slug, role")
      .eq("user_id", user.id)
      .eq("studio_slug", "nebari")
      .eq("role", "owner")
      .maybeSingle();

    if (
      membershipError ||
      !adminMembership
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to view users.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 3. Read the Nebari Auth users.
     */
    const {
      data: usersData,
      error: usersError,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error(
        "Could not list Nebari users:",
        usersError,
      );

      return NextResponse.json(
        {
          error:
            "Nebari could not load the user list.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 4. Read Studio memberships.
     */
    const {
      data: memberships,
      error: membershipsError,
    } = await supabaseAdmin
      .from("studio_members")
      .select(
        "user_id, studio_slug, role",
      );

    if (membershipsError) {
      console.error(
        "Could not load Studio memberships:",
        membershipsError,
      );

      return NextResponse.json(
        {
          error:
            "Nebari could not load Studio memberships.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 5. Combine each account with
     *    its Studio memberships.
     */
    const users = usersData.users.map(
      (nebariUser) => {
        const userMemberships =
          memberships?.filter(
            (membership) =>
              membership.user_id ===
              nebariUser.id,
          ) ?? [];

        return {
          id: nebariUser.id,
          email:
            nebariUser.email ?? "",
          createdAt:
            nebariUser.created_at,
          lastSignInAt:
            nebariUser.last_sign_in_at ??
            null,
          memberships:
            userMemberships.map(
              (membership) => ({
                studioSlug:
                  membership.studio_slug,
                role:
                  membership.role,
              }),
            ),
        };
      },
    );

    /*
     * 6. Send the safe user directory
     *    back to the admin page.
     */
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Unexpected user-list error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something unexpected went wrong while loading users.",
      },
      {
        status: 500,
      },
    );
  }
}