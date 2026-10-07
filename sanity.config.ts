import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemas";

export default defineConfig({
  name: "govita",
  title: "Go Vita CMS",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Blog Posts").schemaType("blogPost").child(S.documentTypeList("blogPost")),
            S.listItem().title("Experts").schemaType("expert").child(S.documentTypeList("expert")),
            S.listItem().title("Ingredients").schemaType("ingredient").child(S.documentTypeList("ingredient")),
            S.listItem().title("Synergy Pairs").schemaType("synergyPair").child(S.documentTypeList("synergyPair")),
            S.listItem().title("Brands").schemaType("brand").child(S.documentTypeList("brand")),
          ]),
    }),
    /*
      Vision is a GROQ console: it lets whoever is logged in read the whole
      dataset by writing queries against it. That is what you want while
      authoring and exactly what you do not want shipped to a production
      Studio, so it is a development plugin. The static import stays — the
      package is a production dependency because this config is bundled into
      the /studio route — but the tool is not registered in production.
    */
    ...(process.env.NODE_ENV === "production" ? [] : [visionTool()]),
  ],
  schema: { types: schemaTypes },
});
