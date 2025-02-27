import { supabase } from "@/lib/supabase";

export const deploymentService = {
    async deployToVercel(
        projectId: string,
    ): Promise<{ deploymentUrl: string; defaultDomain: string }> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const { data, error } = await supabase.functions.invoke(
            "deploy-to-vercel",
            {
                body: { projectId },
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        );

        if (error) throw error;
        return data;
    },
};
