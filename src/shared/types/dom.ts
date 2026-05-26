export type InteractiveKind = 'button' | 'link' | 'input' | 'select' | 'textarea';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteractiveElement {
  ref: number;
  kind: InteractiveKind;
  tag: string;
  text: string;
  ariaLabel: string;
  placeholder: string;
  value: string;
  box: BoundingBox;
}

export interface Viewport {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface PageSnapshot {
  url: string;
  title: string;
  text: string;
  elements: InteractiveElement[];
  viewport: Viewport;
  stateHash: string;
}
