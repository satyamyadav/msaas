import type { Metadata } from "next";

import { ThemeGallery } from "@components/themes/theme-gallery";

export const metadata: Metadata = {
  title: "Themes | Modular SaaS Starter Kit",
  description:
    "Preview and copy curated color palettes from ui.shadcn.com/themes without leaving the Modular SaaS Starter Kit.",
};

export default function ThemesPage() {
  return <ThemeGallery />;
}
