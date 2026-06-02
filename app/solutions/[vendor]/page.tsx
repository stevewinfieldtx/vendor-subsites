/**
 * Vendor subsite route: /solutions/:vendor
 *
 * Resolves the tenant (Phase 1: the flagship config), finds the vendor mapping
 * by slug, pulls grounded+voiced content from TDE (mock fallback), and renders
 * the reseller's chosen archetype. URL mirrors the planned reseller.com/solutions/* mesh.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findVendor, resolveTenant } from "@/lib/tenant";
import { getSubsiteContent } from "@/lib/content";
import { ShowroomSubsite } from "@/components/archetypes/showroom/Showroom";

interface Params {
  params: Promise<{ vendor: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { vendor: slug } = await params;
  const config = resolveTenant();
  const vendor = findVendor(config, slug);
  if (!vendor) return { title: "Not found" };
  const title = `${vendor.productName} — ${config.contact.companyName}`;
  const description = `${vendor.productName} from ${vendor.vendorName}, delivered and supported by ${config.contact.companyName}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/solutions/${slug}` },
  };
}

export default async function VendorSubsitePage({ params }: Params) {
  const { vendor: slug } = await params;
  const config = resolveTenant();
  const vendor = findVendor(config, slug);
  if (!vendor) notFound();

  const content = await getSubsiteContent(config, vendor);

  // Archetype router. Phase 1 implements "showroom"; others land in Phase 3 and
  // fall back to showroom until built.
  switch (config.archetype) {
    case "showroom":
    default:
      return <ShowroomSubsite config={config} vendor={vendor} content={content} />;
  }
}
