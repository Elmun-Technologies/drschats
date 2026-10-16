"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

const embeddedConfig = { ...config, basePath: "/admin/content/studio" };

/** Sanity editor hosted inside the authenticated Go Vita admin shell. */
export function AdminSanityStudio() {
  return <NextStudio config={embeddedConfig} />;
}
