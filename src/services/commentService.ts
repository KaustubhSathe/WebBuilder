import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export interface CommentPosition {
    x: number;
    y: number;
}

export interface CommentData {
    id?: string;
    content: string;
    position_x: number;
    position_y: number;
    project_id?: string;
    page_id?: string;
    parent_id?: string | null;
    is_resolved?: boolean;
    user?: User | null;
    replies?: CommentData[];
    created_at?: string;
    updated_at?: string;
}

export const commentService = {
    async addComment(
        projectId: string,
        pageId: string,
        content: string,
        position: CommentPosition,
        parentId?: string,
    ): Promise<CommentData> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const { data: functionData, error: functionError } = await supabase
            .functions.invoke(
                "add-comment",
                {
                    body: {
                        project_id: projectId,
                        page_id: pageId,
                        content,
                        position_x: position.x,
                        position_y: position.y,
                        parent_id: parentId || null,
                    },
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                },
            );

        if (functionError) throw functionError;
        return functionData.comment;
    },

    async getComments(
        projectId: string,
        pageId?: string,
        showResolved: boolean = false,
    ): Promise<CommentData[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        // Build query string
        let functionUrl = `get-comments?project_id=${
            encodeURIComponent(projectId)
        }&show_resolved=${showResolved}`;

        if (pageId) {
            functionUrl += `&page_id=${encodeURIComponent(pageId)}`;
        }

        const { data: functionData, error: functionError } = await supabase
            .functions.invoke(
                functionUrl,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                },
            );

        if (functionError) throw functionError;
        return functionData.comments || [];
    },
    // Additional methods will be added later
};
