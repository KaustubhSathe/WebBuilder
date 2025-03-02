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
  customAttributes: {
    [key: string]: string | undefined;
  };
  className?: string;
}

export interface BuilderState {
  component: Component;
  selectedComponent: Component | null;
  clipboardComponent: Component | null;
}

 
export type ComponentType =
  | "section"
  | "container"
  | "footer"
  | "nav"
  | "article"
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

   


export interface DraggableComponent {
  type: ComponentType;
  label: string;
  icon: string;
}
