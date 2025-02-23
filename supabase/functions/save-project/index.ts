import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

interface Page {
  id: string;
  name: string;
  path: string;
  project_id: string;
  component_tree: object;
  is_home?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

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
    console.log("Request received");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No auth header found");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    let user_id: string;
    try {
      console.log("Verifying user token");
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        token,
      );
      if (authError || !user) throw new Error("Invalid token");
      user_id = user.id;
      console.log("User verified:", user_id);
    } catch (error) {
      console.log("Auth error:", error);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { project_id, pages } = await req.json();
    console.log("Received data:", { project_id, pageCount: pages?.length });

    if (!project_id || !pages) {
      console.log("Missing required data:", { project_id, pages });
      return new Response(
        JSON.stringify({ error: "Project ID and pages are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify project ownership
    console.log("Verifying project ownership");
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("owner_id", user_id)
      .single();

    if (projectError || !project) {
      console.log("Project verification failed:", projectError);
      return new Response(
        JSON.stringify({ error: "Project not found or unauthorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update all pages
    console.log("Updating pages");
    const { error: updateError } = await supabase
      .from("pages")
      .upsert(
        pages.map((page: Page) => ({
          ...page,
          project_id,
          updated_at: new Date().toISOString(),
        })),
      );

    if (updateError) {
      console.log("Page update failed:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Save completed successfully");
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.log("Unexpected error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
