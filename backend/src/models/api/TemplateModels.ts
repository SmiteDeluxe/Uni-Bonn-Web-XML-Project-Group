export type TemplateResponse = {
  templates: Array<{
    name: string;
    id: string;
    placeholders: Array<{ name: string; id: string; description: string }>;
  }>;
};
