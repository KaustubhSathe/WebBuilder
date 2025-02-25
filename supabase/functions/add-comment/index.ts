import { serve } from "http/server";
import { createClient, User } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
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
    let user: User;

    try {
      const { data: { user: _user }, error: authError } = await supabase.auth.getUser(
        token,
      );

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Invalid token");
      }

      if (!_user) {
        console.error("No user found with token");
        throw new Error("Invalid token");
      }

      user = _user;
    } catch (error) {
      console.error("Token verification failed:", error);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const requestBody = await req.json();
    
    const { project_id, page_id, content, position_x, position_y, parent_id } =
      requestBody;

    if (
      !project_id || !page_id || !content || position_x === undefined ||
      position_y === undefined
    ) {
      console.error("Missing required fields:", {
        project_id,
        page_id,
        content,
        position_x,
        position_y,
      });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("owner_id", user.id)
      .single();

    if (projectError) {
      console.error("Project error:", projectError);
    }

    if (!project) {
      console.error("Project not found or unauthorized");
      return new Response(
        JSON.stringify({ error: "Project not found or unauthorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify page exists and belongs to the project
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id")
      .eq("id", page_id)
      .eq("project_id", project_id)
      .single();

    if (pageError) {
      console.error("Page error:", pageError);
    }

    if (!page) {
      console.error("Page not found or doesn't belong to the project");
      return new Response(
        JSON.stringify({
          error: "Page not found or doesn't belong to the project",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create comment
    const commentData = {
      project_id,
      page_id,
      user_id: user.id,
      content,
      position_x,
      position_y,
      parent_id: parent_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    
    // First insert the comment
    const { data: insertedComment, error: insertError } = await supabase
      .from("comments")
      .insert([commentData])
      .select("*")
      .single();

    if (insertError) {
      console.error("Comment insertion error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }


    // Then fetch user data separately
    const { data: _userData, error: _userError } = await supabase
      .from("auth.users")
      .select("id, email, user_metadata")
      .eq("id", user.id)
      .single();

    // Add user name to the response
    const commentWithUserName = {
      ...insertedComment,
      user,
    };

    return new Response(
      JSON.stringify({ comment: commentWithUserName }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
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
