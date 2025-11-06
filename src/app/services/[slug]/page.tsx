import { Metadata } from "next";
import ServiceDetailClient from "@/components/ServiceDetailClient";
import { Service } from "@/types/service";

interface ExtendedService extends Service {
  _id: string;
}

interface ServiceDetailPageProps {
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

// Fetch service data
async function fetchService(slug: string, serviceId?: string): Promise<ExtendedService | null> {
  try {
    let id = serviceId;

    if (!id) {
      const name = slugToName(slug);
      const servicesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        cache: "no-store",
      });
      if (!servicesRes.ok) throw new Error("Failed to fetch services list");
      const services: ExtendedService[] = await servicesRes.json();
      const targetService = services.find((s) => s.name.toLowerCase() === name.toLowerCase());
      if (!targetService) return null;
      id = targetService._id;
    }

    const serviceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
      cache: "no-store",
    });
    if (!serviceRes.ok) throw new Error("Failed to fetch service");
    return await serviceRes.json();
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

// Fetch interesting services
async function fetchInterestingServices(): Promise<ExtendedService[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services?featured=true&limit=4`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch interesting services");
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 4) : [];
  } catch (error) {
    console.error("Error fetching interesting services:", error);
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: ServiceDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const service = await fetchService(resolvedParams.slug, resolvedSearchParams.id);

  if (!service) {
    return {
      title: "Service Not Found",
      description: "The requested service could not be found.",
    };
  }

  const pageTitle = `${service.displayTitle} - ${service.group || "Service"}`;
  const metaDescription = `${service.description || service.displayTitle} - High-quality ${
    service.group || "service"
  }.`;
  const canonicalUrl = `https://yourdomain.com/services/${resolvedParams.slug}`;
  const keywords = service.seoKeywords
    ? service.seoKeywords
    : `${service.displayTitle}, ${service.group}, service online`;

  return {
    title: pageTitle,
    description: metaDescription,
    keywords,
    robots: "index, follow",
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      images: [service.displayImage || "/default-image.jpg"],
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
      images: [service.displayImage || "/default-image.jpg"],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ServiceDetailPage({ params, searchParams }: ServiceDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const service = await fetchService(resolvedParams.slug, resolvedSearchParams.id);
  const interestingServices = await fetchInterestingServices();

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-bg)]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Service Not Found</h2>
          <a href="/services" className="px-6 py-3 bg-[var(--color-green)] text-white rounded-xl font-medium">
            Back to Services
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
            "@type": "Service",
            name: service.displayTitle,
            description: service.description || service.displayTitle,
            image: service.displayImage || "/default-image.jpg",
            additionalProperty: service.specifications?.map((spec) => ({
              "@type": "PropertyValue",
              name: spec.title,
              value: spec.value,
            })),
            additionalType: service.applications ? service.applications : undefined,
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Service Offer",
              itemListElement: service.customSections?.map((section) => ({
                "@type": "Offer",
                name: section.title,
                description: section.content,
              })),
            },
          }),
        }}
      />
      <ServiceDetailClient
        service={service}
        interestingServices={interestingServices}
        slug={resolvedParams.slug}
      />
    </>
  );
}