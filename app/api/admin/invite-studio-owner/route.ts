import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function POST(request: Request) {
  try {
    /*
     * 1. Verify that the request contains
     *    an authenticated Nebari user.
     */
    const authHeader =
      request.headers.get("authorization");

    if (
      !authHeader?.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken =
      authHeader.slice(
        "Bearer ".length,
      );

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
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
     * 2. Only the owner of the Nebari
     *    administration Studio may create
     *    new Studios.
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
            "You do not have permission to create Studios.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 3. Read the Studio and owner details.
     */
    let body: {
      email?: unknown;
      ownerName?: unknown;
      studioSlug?: unknown;
      studioName?: unknown;
      description?: unknown;
      icon?: unknown;
      colour?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "The Studio details are missing.",
        },
        {
          status: 400,
        },
      );
    }

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const ownerName =
      typeof body.ownerName === "string"
        ? body.ownerName.trim()
        : "";

    const studioSlug =
      typeof body.studioSlug === "string"
        ? body.studioSlug
            .trim()
            .toLowerCase()
        : "";

    const studioName =
      typeof body.studioName === "string"
        ? body.studioName.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const icon =
      typeof body.icon === "string"
        ? body.icon.trim()
        : "🌿";

    const colour =
      typeof body.colour === "string"
        ? body.colour.trim()
        : "";

    /*
     * 4. Validate the required fields.
     */
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

    if (!ownerName) {
      return NextResponse.json(
        {
          error:
            "An owner name is required.",
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

    if (!studioName) {
      return NextResponse.json(
        {
          error:
            "A Studio name is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 5. Make sure this Studio address
     *    isn't already being used.
     */
    const {
      data: existingStudio,
      error: existingStudioError,
    } = await supabaseAdmin
      .from("studios")
      .select("slug")
      .eq("slug", studioSlug)
      .maybeSingle();

    if (existingStudioError) {
      console.error(
        "Could not check Studio address:",
        existingStudioError,
      );

      return NextResponse.json(
        {
          error:
            "Nebari could not check whether that Studio address is available.",
        },
        {
          status: 500,
        },
      );
    }

    if (existingStudio) {
      return NextResponse.json(
        {
          error:
            "That Studio address is already being used.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * 6. Create the Studio.
     */
    const {
      error: studioError,
    } = await supabaseAdmin
      .from("studios")
      .insert({
        slug: studioSlug,
        name: studioName,
        owner: ownerName,
        description:
          description || null,
        icon:
          icon || "🌿",
        colour:
          colour || null,
      });

    if (studioError) {
      console.error(
        "Could not create Studio:",
        studioError,
      );

      return NextResponse.json(
        {
          error:
            `Could not create the Studio: ${studioError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 7. Invite the owner.
     *
     * Supabase returns the invited user's
     * UUID, which we need for studio_members.
     */
    const {
      data: inviteData,
      error: inviteError,
    } =
      await supabaseAdmin.auth.admin
        .inviteUserByEmail(
          email,
          {
            data: {
              owner_name:
                ownerName,

              studio_slug:
                studioSlug,
            },

            redirectTo:
              "https://www.nebari.com.au/update-password",
          },
        );

    if (inviteError) {
      console.error(
        "Studio created but invitation failed:",
        inviteError,
      );

      /*
       * Remove the Studio again so a failed
       * invitation doesn't leave an orphaned
       * Studio behind.
       */
      const {
        error: cleanupError,
      } = await supabaseAdmin
        .from("studios")
        .delete()
        .eq(
          "slug",
          studioSlug,
        );

      if (cleanupError) {
        console.error(
          "Could not clean up Studio after invitation failure:",
          cleanupError,
        );
      }

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

    const invitedUserId =
      inviteData.user?.id;

    if (!invitedUserId) {
      console.error(
        "Invitation succeeded but Supabase returned no user ID.",
      );

      return NextResponse.json(
        {
          error:
            "The invitation was sent, but Nebari could not identify the new owner.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 8. Link the invited user to
     *    their new Studio.
     */
    const {
      error: linkError,
    } = await supabaseAdmin
      .from("studio_members")
      .insert({
        user_id:
          invitedUserId,

        studio_slug:
          studioSlug,

        role:
          "owner",
      });

    if (linkError) {
      console.error(
        "Could not create Studio membership:",
        linkError,
      );

      return NextResponse.json(
        {
          error:
            `The invitation was sent and the Studio was created, but the owner could not be linked: ${linkError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 9. Everything worked.
     */
    return NextResponse.json({
      success: true,

      studioSlug,

      studioName,

      userId:
        invitedUserId,

      email:
        inviteData.user?.email ??
        email,
    });
  } catch (error) {
    console.error(
      "Unexpected Studio creation error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something unexpected went wrong while creating the Studio.",
      },
      {
        status: 500,
      },
    );
  }
}