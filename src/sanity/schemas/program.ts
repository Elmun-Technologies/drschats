import { defineArrayMember, defineField, defineType } from "sanity";

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

const localeText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "uz", title: "O'zbekcha", type: "text" },
      { name: "ru", title: "Русский", type: "text" },
    ],
  });

const localeStringList = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "uz", title: "O'zbekcha", type: "array", of: [{ type: "string" }] },
      { name: "ru", title: "Русский", type: "array", of: [{ type: "string" }] },
    ],
  });

const pairList = (
  locale: "uz" | "ru",
  title: string,
  first: string,
  second: string,
) => ({
  name: locale,
  title,
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        { name: first, title: first, type: "string" },
        { name: second, title: second, type: "text" },
      ],
      preview: { select: { title: first } },
    }),
  ],
});

export const program = defineType({
  name: "program",
  title: "Program",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "commerce", title: "Commerce" },
    { name: "links", title: "Links" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name.uz" },
      validation: (rule) => rule.required(),
    }),
    { ...localeString("name", "Name"), group: "content" },
    { ...localeString("headline", "Headline"), group: "content" },
    { ...localeText("intro", "Intro (also used as meta description)"), group: "content" },
    { ...localeStringList("forWhom", "Who it is for"), group: "content" },
    defineField({
      name: "steps",
      title: "Steps",
      type: "object",
      group: "content",
      description: "How the programme is structured week by week",
      fields: [
        pairList("uz", "O'zbekcha", "title", "body"),
        pairList("ru", "Русский", "title", "body"),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      group: "content",
      fields: [
        pairList("uz", "O'zbekcha", "question", "answer"),
        pairList("ru", "Русский", "question", "answer"),
      ],
    }),
    defineField({
      name: "durationDays",
      title: "Duration (days)",
      type: "number",
      group: "commerce",
      initialValue: 30,
      validation: (rule) => rule.min(1).max(365),
    }),
    defineField({
      name: "discountPercent",
      title: "Bundle discount (%)",
      type: "number",
      group: "commerce",
      description: "Applied to every line when the whole programme is added to the cart",
      initialValue: 10,
      validation: (rule) => rule.min(0).max(60),
    }),
    defineField({
      name: "productSlugs",
      title: "Pinned product slugs",
      type: "array",
      group: "links",
      description: "Leave empty to fill the programme from its categories",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "categorySlugs",
      title: "Category slugs",
      type: "array",
      group: "links",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "ingredientSlugs",
      title: "Ingredient slugs",
      type: "array",
      group: "links",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "topicSlugs",
      title: "Health topic slugs",
      type: "array",
      group: "links",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "name.uz", subtitle: "headline.uz" },
    prepare: ({ title, subtitle }) => ({ title: title || "Unnamed", subtitle }),
  },
});
