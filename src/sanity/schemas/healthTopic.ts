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

const sectionList = (locale: "uz" | "ru", title: string) => ({
  name: locale,
  title,
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        { name: "body", title: "Body", type: "text" },
      ],
      preview: { select: { title: "title" } },
    }),
  ],
});

const faqList = (locale: "uz" | "ru", title: string) => ({
  name: locale,
  title,
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        { name: "question", title: "Question", type: "string" },
        { name: "answer", title: "Answer", type: "text" },
      ],
      preview: { select: { title: "question" } },
    }),
  ],
});

export const healthTopic = defineType({
  name: "healthTopic",
  title: "Health Topic",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "links", title: "Links" },
  ],
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Health goal (/goals)", value: "goal" },
          { title: "Symptom (/symptoms)", value: "symptom" },
          { title: "Vitamin / ingredient (/vitamins)", value: "vitamin" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name.uz" },
      validation: (rule) => rule.required(),
    }),
    { ...localeString("name", "Name"), group: "content" },
    { ...localeString("headline", "Headline (under the H1)"), group: "content" },
    { ...localeText("intro", "Intro (also used as meta description)"), group: "content" },
    defineField({
      name: "sections",
      title: "Sections",
      type: "object",
      group: "content",
      description: "What it is · who needs it · when to take · what it combines with",
      fields: [sectionList("uz", "O'zbekcha"), sectionList("ru", "Русский")],
    }),
    { ...localeStringList("bullets", "Bullets (signs / benefits)"), group: "content" },
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      group: "content",
      description: "Rendered on the page and emitted as FAQPage structured data",
      fields: [faqList("uz", "O'zbekcha"), faqList("ru", "Русский")],
    }),
    defineField({
      name: "ingredientSlugs",
      title: "Ingredient slugs",
      type: "array",
      group: "links",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "productSlugs",
      title: "Product slugs",
      type: "array",
      group: "links",
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
      name: "relatedSlugs",
      title: "Related topic slugs",
      type: "array",
      group: "links",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "name.uz", subtitle: "kind" },
    prepare: ({ title, subtitle }) => ({ title: title || "Unnamed", subtitle }),
  },
});
