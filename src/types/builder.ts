export interface Component {
  id: string;
  type: 'container' | 'text' | 'image' | 'button';
  content?: string;
  src?: string;
  children?: Component[];
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
  components: Component[];
  selectedComponent: string | null;
}

export type DragItemType = {
  id: string;
  type: string;
  component: Component;
};

export type ElementType = 
  | 'section' 
  | 'container' 
  | 'heading'
  | 'paragraph'
  | 'text-link'
  | 'text-block'
  | 'blockquote'
  | 'rich-text'
  | 'div' 
  | 'list' 
  | 'list-item'
  | 'button' 
  | 'image'
  | 'video'
  | 'youtube'
  | 'form'
  | 'label'
  | 'textarea'
  | 'file'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'form-button';

export interface DraggableElement {
  type: ElementType;
  label: string;
  icon: string;
} 