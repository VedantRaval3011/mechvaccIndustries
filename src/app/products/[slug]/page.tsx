import { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Product } from "@/types/product";

interface ExtendedProduct extends Product {
  _id: string;
}

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}

// Function to convert slug to name for querying
const slugToName = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Fetch product data
async function fetchProduct(slug: string, productId?: string): Promise<ExtendedProduct | null> {
  try {
    let id = productId;

    if (!id) {
      const name = slugToName(slug);
      const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        cache: "no-store", // Ensure fresh data
      });
      if (!productsRes.ok) throw new Error("Failed to fetch products list");
      const products: ExtendedProduct[] = await productsRes.json();
      const targetProduct = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (!targetProduct) return null;
      id = targetProduct._id;
    }

    const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      cache: "no-store",
    });
    if (!productRes.ok) throw new Error("Failed to fetch product");
    return await productRes.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Fetch interesting products
async function fetchInterestingProducts(): Promise<ExtendedProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?featured=true&limit=4`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch interesting products");
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 4) : [];
  } catch (error) {
    console.error("Error fetching interesting products:", error);
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: ProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const product = await fetchProduct(resolvedParams.slug, resolvedSearchParams.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const pageTitle = `${product.displayTitle} - ${product.group || "Product"}`;
  const metaDescription = `${product.description || product.displayTitle} - High-quality ${
    product.group || "product"
  }.`;
  const canonicalUrl = `https://yourdomain.com/products/${resolvedParams.slug}`;
  const keywords = product.seoKeywords
    ? product.seoKeywords
    : `${product.displayTitle}, ${product.group}, buy online`;

  return {
    title: pageTitle,
    description: metaDescription,
    keywords,
    robots: "index, follow",
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      images: [product.displayImage || "/default-image.jpg"],
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
      images: [product.displayImage || "/default-image.jpg"],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const product = await fetchProduct(resolvedParams.slug, resolvedSearchParams.id);
  const interestingProducts = await fetchInterestingProducts();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-bg)]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product Not Found</h2>
          <a href="/products" className="px-6 py-3 bg-[var(--color-green)] text-white rounded-xl font-medium">
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "http://schema.org",
            "@type": "Product",
            name: product.displayTitle,
            description: product.description || product.displayTitle,
            image: product.displayImage || "/default-image.jpg",
            offers: {
              "@type": "Offer",
              availability: "http://schema.org/InStock",
              priceCurrency: "USD",
              price: "0.00", // Update with actual price if available
            },
            additionalProperty: product.specifications?.map((spec) => ({
              "@type": "PropertyValue",
              name: spec.title,
              value: spec.value,
            })),
          }),
        }}
      />
      <ProductDetailClient
        product={product}
        interestingProducts={interestingProducts}
        slug={resolvedParams.slug}
      />
    </>
  );
}