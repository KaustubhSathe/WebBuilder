// User types
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Page types
export interface Page {
  id: string;
  project_id: string;
  name: string;
  path: string;
  is_home: boolean;
  component_tree: object;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Comment types
export interface Comment {
  id: string;
  project_id: string;
  page_id: string;
  user_id: string;
  content: string;
  position_x: number;
  position_y: number;
  is_resolved: boolean;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user?: User;
  replies?: Comment[];
}

// Reply is just a Comment with a parent_id
export type Reply = Comment;

export interface Component {
  id: string;
  type: ComponentType;
  content?: string;
  src?: string;
  children: Component[];
  interactions?: string | "";
  styles: {
    width: string;
    height: string;
    backgroundColor?: string;
    color?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    [key: string]: string | undefined;
  };
  position?: {
    x: number;
    y: number;
  };
}

export type ComponentType =
  | "section"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "main"
  | "a"
  | "text"
  | "blockquote"
  | "rich-text"
  | "div"
  | "list"
  | "list-item"
  | "button"
  | "image"
  | "input"
  | "video"
  | "youtube"
  | "form"
  | "label"
  | "textarea"
  | "file"
  | "checkbox"
  | "radio"
  | "select"
  | "form-button";
