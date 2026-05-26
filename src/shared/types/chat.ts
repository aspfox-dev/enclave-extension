export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface PageContext {
  url: string;
  title: string;
  text: string;
}
