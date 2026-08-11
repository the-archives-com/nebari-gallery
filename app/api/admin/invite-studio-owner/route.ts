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
          error:
            "Your login could not be verified.",
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
      studioSlug?: unknown;
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

    const ownerName =
      typeof body.ownerName === "string"
        ? body.ownerName.trim()
        : "";

    const studioSlug =
      typeof body.studioSlug === "string"
        ? body.studioSlug.trim().toLowerCase()
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

    if (!studioSlug) {
      return NextResponse.json(
        {
          error:
            "A Studio address is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Confirm the Studio actually exists.
     */
    const {
      data: studio,
      error: studioError,
    } = await supabaseAdmin
      .from("studios")
      .select("slug")
      .eq("slug", studioSlug)
      .maybeSingle();

    if (studioError || !studio) {
      console.error(
        "Could not verify Studio:",
        studioError,
      );

      return NextResponse.json(
        {
          error:
            "The Studio could not be found.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 6. Send the invitation.
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
            studio_slug: studioSlug,
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

    const invitedUserId =
      data.user?.id;

    if (!invitedUserId) {
      return NextResponse.json(
        {
          error:
            "The invitation was sent, but the new user ID could not be found.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 7. Link the invited user to their Studio.
     */
    const {
      error: linkError,
    } = await supabaseAdmin
      .from("studio_members")
      .insert({
        user_id: invitedUserId,
        studio_slug: studioSlug,
        role: "owner",
      });

    if (linkError) {
      console.error(
        "Could not link Studio owner:",
        linkError,
      );

      return NextResponse.json(
        {
          error:
            "The invitation was sent, but the Studio could not be linked to the new owner.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      userId: invitedUserId,
      email:
        data.user?.email ?? email,
      studioSlug,
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