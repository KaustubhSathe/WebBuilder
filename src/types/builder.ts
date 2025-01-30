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