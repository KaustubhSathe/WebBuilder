import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";
import { generatePreview } from "../utils.ts";
import type { Component, Page } from "../types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const vercelApiToken = Deno.env.get("VERCEL_API_TOKEN");
console.log("Vercel API Token exists:", !!vercelApiToken);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting deployment process...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify JWT token
    console.log("Verifying JWT token...");
    const supabase = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("PROJECT_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("User authenticated:", user.id);
    const { projectId } = await req.json();
    console.log("Project ID:", projectId);

    // Get project and pages data
    console.log("Fetching project data...");
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        description,
        owner_id,
        created_at,
        updated_at,
        pages!project_id (
          id,
          name,
          path,
          is_home,
          component_tree,
          created_at,
          updated_at
        )
      `)
      .eq("id", projectId)
      .is("pages.deleted_at", null) // Use 'is' instead of 'eq' for null comparison
      .single();

    if (projectError) {
      console.error("Project fetch error:", projectError);
      throw new Error("Failed to fetch project");
    }

    if (!project) {
      console.error("Project not found");
      throw new Error("Project not found");
    }

    if (!project.pages || !Array.isArray(project.pages)) {
      console.error("Invalid pages data:", project.pages);
      throw new Error("Invalid pages data");
    }

    console.log("Project found:", project.name);
    console.log("Pages data:", JSON.stringify(project.pages, null, 2));
    console.log("Number of pages:", project.pages.length);

    // Generate HTML for each page
    console.log("Generating HTML for pages...");
    const pagesWithHtml: { page: Page; html: string }[] = project.pages.map(
      (page: Page, index: number) => {
        console.log(`Processing page ${index}:`, page);
        if (!page || !page.path) {
          console.error("Invalid page data:", page);
          throw new Error(`Invalid page data at index ${index}`);
        }

        const componentTree = page.component_tree as Component;
        if (!componentTree) {
          console.error("Invalid component tree for page:", page.name);
          throw new Error(`Missing component tree for page ${page.name}`);
        }

        const html = generatePreview(
          componentTree,
          componentTree.interactions || "",
        );
        return {
          page,
          html,
        };
      },
    );

    // Create files array for deployment
    console.log("Creating files array...");
    const files = pagesWithHtml.map((
      pageWithHtml: { page: Page; html: string },
    ) => {
      const filePath = `./${
        pageWithHtml.page.path === "/" ? "index" : pageWithHtml.page.path
      }.html`;
      console.log("Adding file:", filePath);
      return {
        file: filePath,
        data: pageWithHtml.html,
        encoding: "utf-8",
      };
    });

    files.push({
      file: "vercel.json",
      data: JSON.stringify({
        version: 2,
        cleanUrls: true,
        trailingSlash: false,
      }),
      encoding: "utf-8",
    });

    console.log("Total files to deploy:", files.length);

    // Create deployment payload
    const deploymentPayload = {
      name: `webbuilder-${project.name.toLowerCase().replace(/\s+/g, "-")}`,
      files,
      version: 2,
      target: "production",
      projectSettings: {
        framework: null,
        buildCommand: null,
        installCommand: null,
        devCommand: null,
        outputDirectory: ".",
        rootDirectory: null,
      },
    };

    // Create Vercel deployment
    console.log("Sending deployment request to Vercel...");
    const deployResponse = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vercelApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deploymentPayload),
      },
    );

    const deployData = await deployResponse.json();
    console.log("Vercel API response:", deployData);

    if (!deployResponse.ok) {
      console.error("Deployment failed:", deployData);
      throw new Error(deployData.error?.message || "Deployment failed");
    }

    // Update project with deployment URL
    console.log("Updating project with deployment URL...");
    await supabase
      .from("projects")
      .update({
        deployment_url: `https://${deployData.url}`,
        last_deployed: new Date().toISOString(),
      })
      .eq("id", projectId);

    console.log("Deployment successful!");
    return new Response(
      JSON.stringify({
        deploymentUrl: `https://${deployData.url}`,
        deploymentId: deployData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Deployment error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
