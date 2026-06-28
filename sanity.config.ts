import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemas";

export default defineConfig({
  name: "alimkhanov-pharm",
  title: "Alimkhanov Pharm CMS",
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
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
