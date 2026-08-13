import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function POST(request: Request) {
  try {
    /*
     * 1. Verify the signed-in Nebari administrator.
     */
    const authHeader = request.headers.get("authorization");

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

    const accessToken = authHeader.slice(
      "Bearer ".length,
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (userError || !user) {
      console.error(
        "Could not verify administrator:",
        userError,
      );

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
     * 2. Only the Nebari Studio owner
     *    may invite new users.
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
      console.error(
        "Nebari administrator check failed:",
        membershipError,
      );

      return NextResponse.json(
        {
          error:
            "You do not have permission to invite users.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 3. Read and validate the email address.
     */
    let body: {
      email?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "The invitation details are missing.",
        },
        {
          status: 400,
        },
      );
    }

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error:
            "An email address is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. Invite the user.
     *
     * This creates the Nebari account only.
     * It does NOT create a Studio or
     * studio_members record.
     */
    const {
      data: inviteData,
      error: inviteError,
    } =
      await supabaseAdmin.auth.admin
        .inviteUserByEmail(
          email,
          {
            redirectTo:
              "https://www.nebari.com.au/update-password",
          },
        );

    if (inviteError) {
      console.error(
        "Could not invite user:",
        inviteError,
      );

      return NextResponse.json(
        {
          error:
            `The invitation could not be sent: ${inviteError.message}`,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Invitation sent.
     */
    return NextResponse.json({
      success: true,
      userId: inviteData.user?.id ?? null,
      email:
        inviteData.user?.email ?? email,
    });
  } catch (error) {
    console.error(
      "Unexpected user invitation error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something unexpected went wrong while sending the invitation.",
      },
      {
        status: 500,
      },
    );
  }
}