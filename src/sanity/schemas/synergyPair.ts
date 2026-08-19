import { defineField, defineType } from "sanity";

const localeString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "uz", title: "O'zbekcha", type: "string" },
      { name: "ru", title: "Русский", type: "string" },
    ],
  });

export const synergyPair = defineType({
  name: "synergyPair",
  title: "Synergy / Antagonism Pair",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: [{ title: "Boost (synergy)", value: "boost" }, { title: "Block (antagonism)", value: "block" }] },
    }),
    localeString("a", "Ingredient A"),
    localeString("b", "Ingredient B"),
    localeString("note", "Note"),
  ],
  preview: {
    select: { title: "a.uz", subtitle: "type" },
    prepare: ({ title, subtitle }) => ({ title: title || "Pair", subtitle }),
  },
});
