import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, productSlugs } from "@/lib/products/catalog";
import ProductPage from "@/components/public/products/ProductPage.jsx";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return productSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const path = `/products/${product.slug}`;
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: path },
    openGraph: { title: `${product.seo.title} | Dyxersoft`, description: product.seo.description, url: path }
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const softwareApplication = product.appUrl ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: product.appUrl,
    description: product.seo.description
  } : null;

  return (
    <>
      {softwareApplication && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }} />}
      <ProductPage product={product} />
    </>
  );
}
