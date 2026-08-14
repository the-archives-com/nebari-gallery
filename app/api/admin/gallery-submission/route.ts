import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabase-admin";

type GalleryAction =
  | "approve"
  | "decline"
  | "feature"
  | "remove";

export async function POST(
  request: Request,
) {
  try {
    /*
     * 1. VERIFY SIGNED-IN USER
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
     * 2. VERIFY NEBARI ADMINISTRATOR
     */

    const {
      data: membership,
      error: membershipError,
    } = await supabaseAdmin
      .from("studio_members")
      .select(
        "studio_slug, role",
      )
      .eq(
        "user_id",
        user.id,
      )
      .eq(
        "studio_slug",
        "nebari",
      )
      .eq(
        "role",
        "owner",
      )
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
     * 3. READ CURATION ACTION
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

    const validActions:
      GalleryAction[] = [
        "approve",
        "decline",
        "feature",
        "remove",
      ];

    const action =
      typeof body.action ===
        "string" &&
      validActions.includes(
        body.action as GalleryAction,
      )
        ? (body.action as GalleryAction)
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
            "A valid Gallery action is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * 4. DETERMINE ALLOWED STATUS CHANGE
     *
     * approve:
     *   pending → featured
     *
     * decline:
     *   pending → declined
     *
     * feature:
     *   ordinary Studio work → featured
     *
     * remove:
     *   featured → not_featured
     */

    let newStatus:
      | "featured"
      | "declined"
      | "not_featured";

    let allowedCurrentStatuses:
      string[];

    switch (action) {
      case "approve":
        newStatus =
          "featured";

        allowedCurrentStatuses = [
          "pending",
        ];

        break;

      case "decline":
        newStatus =
          "declined";

        allowedCurrentStatuses = [
          "pending",
        ];

        break;

      case "feature":
        newStatus =
          "featured";

        allowedCurrentStatuses = [
          "not_featured",
          "declined",
        ];

        break;

      case "remove":
        newStatus =
          "not_featured";

        allowedCurrentStatuses = [
          "featured",
        ];

        break;
    }

    /*
     * 5. UPDATE ARTWORK
     */

    const {
      data: artwork,
      error: updateError,
    } = await supabaseAdmin
      .from("studio_artworks")
      .update({
        gallery_status:
          newStatus,
      })
      .eq(
        "id",
        artworkId,
      )
      .in(
        "gallery_status",
        allowedCurrentStatuses,
      )
      .select(
        "id, studio_slug, gallery_status",
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Could not update Gallery status:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            `The Gallery selection could not be updated: ${updateError.message}`,
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
            "This artwork has already changed status. Refresh the page and try again.",
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
          "Something unexpected went wrong while updating the Gallery.",
      },
      {
        status: 500,
      },
    );
  }
}