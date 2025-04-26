declare module "prismjs" {
  interface Prism {
    highlightAll(): void
    highlight(text: string, grammar: any, language: string): string
  }

  const Prism: Prism
  export = Prism
}

declare module "prismjs/components/*" {
  const content: any
  export = content
}

declare module "prismjs/themes/*" {
  const content: any
  export = content
}

