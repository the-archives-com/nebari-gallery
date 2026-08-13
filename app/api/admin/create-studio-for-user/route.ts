import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function POST(request: Request) {
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
     * 2. Only the owner of the Nebari
     *    administration Studio may do this.
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
            "You do not have permission to create Studios.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 3. Read Studio and user details.
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
      body = await request.json();
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

    if (!email) {
      return NextResponse.json(
        {
          error:
            "An existing user email is required.",
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
     * 4. Find the existing Nebari user.
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
      return NextResponse.json(
        {
          error:
            "Nebari could not look up that user.",
        },
        {
          status: 500,
        },
      );
    }

    const existingUser =
      usersData.users.find(
        (candidate) =>
          candidate.email?.toLowerCase() === email,
      );

    if (!existingUser) {
      return NextResponse.json(
        {
          error:
            "No Nebari account exists for that email address.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * 5. Make sure the Studio slug
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
      return NextResponse.json(
        {
          error:
            "Nebari could not check that Studio address.",
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
     * 7. Link the existing user as owner.
     */
    const {
      error: linkError,
    } = await supabaseAdmin
      .from("studio_members")
      .insert({
        user_id:
          existingUser.id,
        studio_slug:
          studioSlug,
        role:
          "owner",
      });

    if (linkError) {
      /*
       * Remove the Studio again so we
       * don't leave an orphan behind.
       */
      await supabaseAdmin
        .from("studios")
        .delete()
        .eq("slug", studioSlug);

      return NextResponse.json(
        {
          error:
            `The Studio was created, but ownership could not be assigned: ${linkError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * 8. Success.
     */
    return NextResponse.json({
      success: true,
      studioSlug,
      studioName,
      userId:
        existingUser.id,
      email:
        existingUser.email ?? email,
    });
  } catch (error) {
    console.error(
      "Unexpected Studio conversion error:",
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