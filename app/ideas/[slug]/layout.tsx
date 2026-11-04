import type { Metadata } from "next";
import { getIdeaBySlug } from "@/lib/ideas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  if (!idea) {
    return {
      title: "Project Specification | IdeaToX",
      description: "Discover, fork, and spec open-source project architectures.",
    };
  }

  return {
    title: `${idea.title} | IdeaToX Specification`,
    description: idea.hook,
    openGraph: {
      title: `${idea.title} — IdeaToX`,
      description: idea.hook,
      type: "article",
      siteName: "IdeaToX",
    },
    twitter: {
      card: "summary_large_image",
      title: `${idea.title} — IdeaToX`,
      description: idea.hook,
    },
  };
}

export default function IdeaSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
