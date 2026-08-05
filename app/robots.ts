import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/editor",
        "/projects",
        "/settings",
        "/admin",
        "/profile",
        "/onboarding",
        "/signup/check-email",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
