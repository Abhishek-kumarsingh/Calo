import { ReactNode } from 'react';

declare module 'react-markdown' {
  interface ReactMarkdownProps {
    children: string;
    components?: {
      [key: string]: React.ComponentType<any>;
    };
  }

  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'react-syntax-highlighter' {
  interface SyntaxHighlighterProps {
    style?: any;
    language?: string;
    children: string;
    PreTag?: string;
    [key: string]: any;
  }

  export const Prism: React.FC<SyntaxHighlighterProps>;
  export const Light: React.FC<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const vscDarkPlus: any;
  export { vscDarkPlus };
}
