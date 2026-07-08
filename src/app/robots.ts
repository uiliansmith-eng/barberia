import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/agenda",
        "/clientes",
        "/empleados",
        "/servicios",
        "/inventario",
        "/login",
        "/registro",
        "/recuperar-password",
        "/actualizar-password",
        "/onboarding",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
