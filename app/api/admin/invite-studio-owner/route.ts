import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function POST(request: Request) {
  try {
    /*
     * 1. Get the caller's access token.
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

    /*
     * 2. Ask Supabase which user owns this token.
     */
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken,
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Your login could not be verified.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * 3. Check that this user is the owner
     *    of the Nebari administration Studio.
     */
    const {
      data: membership,
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
      !membership
    ) {
      console.error(
        "Nebari admin check failed:",
        membershipError,
      );

      return NextResponse.json(
        {
          error:
            "You do not have permission to invite Studio owners.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 4. Read and validate the invitation.
     */
    let body: {
      email?: unknown;
      ownerName?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "The invitation details are missing.",
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

    const ownerName =
      typeof body.ownerName === "string"
        ? body.ownerName.trim()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error: "An email address is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Send the invitation.
     */
    const {
      data,
      error: inviteError,
    } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            owner_name: ownerName,
          },

          redirectTo:
            "https://www.nebari.com.au/update-password",
        },
      );

    if (inviteError) {
      console.error(
        "Could not invite Studio owner:",
        inviteError,
      );

      return NextResponse.json(
        {
          error: inviteError.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id ?? null,
      email: data.user?.email ?? email,
    });
  } catch (error) {
    console.error(
      "Unexpected invitation error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the invitation.",
      },
      {
        status: 500,
      },
    );
  }
}