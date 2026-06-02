import { redirect } from "next/navigation";
import { resolveTenant } from "@/lib/tenant";

/**
 * Root: send visitors to the tenant's first vendor subsite. In Phase 2 this
 * becomes a per-reseller "solutions index" landing; for the flagship we go
 * straight to the showcase subsite.
 */
export default function Home() {
  const config = resolveTenant();
  const first = config.vendors[0];
  redirect(`/solutions/${first.slug}`);
}
