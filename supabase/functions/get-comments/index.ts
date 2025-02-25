import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";
import { Comment, Reply } from "../types.ts";

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

// Create admin client for accessing auth.users
const adminAuthClient = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

serve(async (req: Request) => {
  console.log("Get comments function called");
  console.log("Request URL:", req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get URL parameters
    const url = new URL(req.url);
    const projectId = url.searchParams.get("project_id");
    const pageId = url.searchParams.get("page_id");
    const showResolved = url.searchParams.get("show_resolved") === "true";

    console.log("Query params:", { projectId, pageId, showResolved });

    // Verify auth token
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify JWT token
    const token = authHeader.replace("Bearer ", "");
    try {
      console.log("Verifying token...");
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        token,
      );

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Invalid token");
      }

      if (!user) {
        console.error("No user found with token");
        throw new Error("Invalid token");
      }

      console.log("User authenticated:", user.id);

      // Build query for comments
      console.log("Building comments query...");
      let query = supabase
        .from("comments")
        .select(`
          *,
          replies:comments!parent_id (
            *
          )
        `)
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .is("parent_id", null);

      // Filter by page if specified
      if (pageId) {
        console.log("Filtering by page:", pageId);
        query = query.eq("page_id", pageId);
      }

      // Filter by resolved status if not showing resolved
      if (!showResolved) {
        console.log("Filtering out resolved comments");
        query = query.eq("is_resolved", false);
      }

      // Order by creation date
      query = query.order("created_at", { ascending: false });

      console.log("Executing query...");
      const { data: comments, error: commentsError } = await query;

      if (commentsError) {
        console.error("Comments query error:", commentsError);
        return new Response(
          JSON.stringify({ error: commentsError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log(`Found ${comments?.length || 0} comments`);

      // Fetch user data separately
      const userIds = new Set<string>();
      comments?.forEach((comment: Comment) => {
        userIds.add(comment.user_id);
        comment.replies?.forEach((reply: Reply) => userIds.add(reply.user_id));
      });

      // Fetch user data separately using admin client
      const { data: users, error: usersError } = await adminAuthClient
        .auth.admin.listUsers(); // Use the auth admin API instead

      if (usersError) {
        console.error("Users query error:", usersError);
      }

      // Create a map of user data - adjust to match the auth.admin.listUsers() response
      const userMap = new Map(
        users?.users?.map((user) => [user.id, user]) || [],
      );
      console.log("User map:", userMap);

      // Process comments to format user data
      const processedComments = comments?.map((comment) => {
        const user = userMap.get(comment.user_id);
        // Format user data for replies
        const processedReplies = comment.replies?.map((reply: Reply) => {
          const replyUser = userMap.get(reply.user_id);
          
          return {
            ...reply,
            user: replyUser,
          };
        });

        return {
          ...comment,
          user,
          replies: processedReplies,
        };
      });

      return new Response(
        JSON.stringify({ comments: processedComments || [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
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
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
