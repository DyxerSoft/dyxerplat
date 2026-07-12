import { PublicPostDetail } from "@/features/posts/components/PublicPostDetail";

export default async function BlogPostPage({
  params
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  return <PublicPostDetail slug={slug} />;
}
