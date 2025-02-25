import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  },
);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify JWT token and get user_id
    const token = authHeader.replace("Bearer ", "");
    let user_id: string;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        token,
      );

      if (authError || !user) throw new Error("Invalid token");
      user_id = user.id;
    } catch (_) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { comment_id, resolved } = await req.json();

    if (!comment_id || resolved === undefined) {
      return new Response(
        JSON.stringify({
          error: "Comment ID and resolved status are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the comment exists
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, parent_id, project_id")
      .eq("id", comment_id)
      .is("deleted_at", null)
      .single();

    if (commentError || !comment) {
      return new Response(
        JSON.stringify({ error: "Comment not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", comment.project_id)
      .eq("owner_id", user_id)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to resolve this comment" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if this is a parent comment
    const isParent = comment.parent_id === null;

    if (isParent) {
      // If it's a parent comment, update it and all its replies
      // First, get all child comments
      const { data: childComments, error: childError } = await supabase
        .from("comments")
        .select("id")
        .eq("parent_id", comment_id)
        .is("deleted_at", null);

      if (!childError && childComments && childComments.length > 0) {
        // Update all child comments
        const childIds = childComments.map((child) => child.id);
        await supabase
          .from("comments")
          .update({
            is_resolved: resolved,
            updated_at: new Date().toISOString(),
          })
          .in("id", childIds);
      }
    }

    // Update the comment itself
    const { data: updatedComment, error: updateError } = await supabase
      .from("comments")
      .update({
        is_resolved: resolved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", comment_id)
      .select("*")
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        comment: updatedComment,
        affected_replies: isParent ? true : false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
