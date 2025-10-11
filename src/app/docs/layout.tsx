import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6 py-12">{children}</div>;
}
