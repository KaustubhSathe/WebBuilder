export interface Component {
  id: string;
  type: ComponentType;
  content?: string;
  src?: string;
  children: Component[];
  styles?: {
    width?: string;
    height?: string;
    backgroundColor?: string;
    color?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    [key: string]: string | undefined;
  };
  position?: {
    x: number;
    y: number;
  };
}

export interface BuilderState {
  component: Component;
  selectedComponent: string | null;
}

export type ComponentType = 
  | 'section' 
  | 'container' 
  | 'heading'
  | 'paragraph'
  | 'text-link'
  | 'text'
  | 'blockquote'
  | 'rich-text'
  | 'div' 
  | 'list' 
  | 'list-item'
  | 'button' 
  | 'image'
  | 'input'
  | 'video'
  | 'youtube'
  | 'form'
  | 'label'
  | 'textarea'
  | 'file'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'form-button'
  | 'body';

export interface DraggableElement {
  type: ComponentType;
  label: string;
  icon: string;
} 