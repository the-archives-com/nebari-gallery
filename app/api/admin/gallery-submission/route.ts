import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

export async function POST(
  request: Request,
) {
  try {
    /*
     * 1. Verify signed-in user.
     */
    const authHeader =
      request.headers.get(
        "authorization",
      );

    if (
      !authHeader?.startsWith(
        "Bearer ",
      )
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
     * 2. Verify Nebari administrator.
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
        "Gallery curator check failed:",
        membershipError,
      );

      return NextResponse.json(
        {
          error:
            "You do not have permission to curate the Gallery.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * 3. Read decision.
     */
    let body: {
      artworkId?: unknown;
      action?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "The Gallery decision is missing.",
        },
        {
          status: 400,
        },
      );
    }

    const artworkId =
      typeof body.artworkId ===
        "number"
        ? body.artworkId
        : Number(
            body.artworkId,
          );

    const action =
      body.action === "approve" ||
      body.action === "decline"
        ? body.action
        : null;

    if (
      !Number.isFinite(
        artworkId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A valid artwork ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!action) {
      return NextResponse.json(
        {
          error:
            "A valid Gallery decision is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. Only pending work can be reviewed.
     */
    const newStatus =
      action === "approve"
        ? "featured"
        : "declined";

    const {
      data: artwork,
      error: updateError,
    } = await supabaseAdmin
      .from("studio_artworks")
      .update({
        gallery_status:
          newStatus,
      })
      .eq("id", artworkId)
      .eq(
        "gallery_status",
        "pending",
      )
      .select(
        "id, studio_slug, gallery_status",
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Could not review Gallery submission:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            `The Gallery submission could not be updated: ${updateError.message}`,
        },
        {
          status: 500,
        },
      );
    }

    if (!artwork) {
      return NextResponse.json(
        {
          error:
            "This submission is no longer awaiting review.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json({
      success: true,
      artworkId:
        artwork.id,
      galleryStatus:
        artwork.gallery_status,
    });
  } catch (error) {
    console.error(
      "Unexpected Gallery curation error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something unexpected went wrong while reviewing the Gallery submission.",
      },
      {
        status: 500,
      },
    );
  }
}