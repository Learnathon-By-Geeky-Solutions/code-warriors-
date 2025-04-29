// src/types/DocsDTO.ts

export interface DocsDTO {
  id: string;
  teamId: string;
  officeId: string;
  parentId: string | null;
  title: string;
  content: string;
  rootGrandparentId: string | null;
  children?: DocsDTO[];
  level: number;
}
