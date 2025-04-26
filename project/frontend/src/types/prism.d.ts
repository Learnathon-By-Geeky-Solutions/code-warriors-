declare module 'prismjs' {
  const Prism: {
    highlightAll: () => void;
    highlightElement: (element: Element, async?: boolean, callback?: () => void) => void;
    highlight: (text: string, grammar: any, language: string) => string;
    languages: { [key: string]: any };
  };
  export = Prism;
}

declare module 'prismjs/components/*';
declare module 'prismjs/plugins/*';
declare module 'prismjs/themes/*';
