import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, productSlugs } from "@/lib/products/catalog";
import ProductPage from "@/components/public/products/ProductPage.jsx";
import { prisma } from "@/server/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return productSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    const managed = await prisma.catalogProduct.findFirst({ where: { slug, isActive: true }, select: { name: true, shortDescription: true } });
    return managed ? { title: `${managed.name} | Dyxersoft`, description: managed.shortDescription } : {};
  }
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
  const catalogProduct = getProduct(slug);
  const managed = await prisma.catalogProduct.findFirst({
    where: { slug, isActive: true },
    include: { plans: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } }
  });
  if (!catalogProduct && !managed) notFound();
  const product = catalogProduct ?? {
    slug: managed!.slug,
    name: managed!.name,
    platform: "Business Platform" as const,
    platformDescription: "Producto del catálogo Dyxersoft.",
    status: "Disponible" as const,
    tagline: managed!.shortDescription,
    shortDescription: managed!.shortDescription,
    description: managed!.description,
    problem: managed!.additionalInfo || managed!.description,
    capabilities: managed!.plans.flatMap((plan) => plan.benefits),
    workflow: [],
    useCases: [],
    relatedProducts: [],
    seo: { title: managed!.name, description: managed!.shortDescription }
  };

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
      <ProductPage product={product} configuredPlans={managed?.plans ?? []} />
    </>
  );
}
