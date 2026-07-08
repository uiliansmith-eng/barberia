import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_list_tenants", {});
  const tenants = (data as unknown as { slug: string }[] | null) ?? [];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/barberias`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/anadir-barberia`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/legal/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const tenantRoutes: MetadataRoute.Sitemap = tenants.map((t) => ({
    url: `${siteUrl}/reservar/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...tenantRoutes];
}
