import { ImageResponse } from "next/og";
import { getPublicCategory, listPublicProducts } from "@/lib/catalog-server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryOpenGraphImage({ params }: Props) {
  const { category: slug } = await params;
  const [category, products] = await Promise.all([
    getPublicCategory(slug),
    listPublicProducts(),
  ]);

  const matchingProducts = products.filter(
    (p) => p.categorySlug === slug || p.parentCategorySlug === slug
  );

  const title = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const count = matchingProducts.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #092014 0%, #113821 55%, #184b2c 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#22c55e",
                color: "#092014",
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              PM
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                Pak Multilinks Hygiene
              </span>
              <span style={{ fontSize: 16, color: "#a3e635", fontWeight: 600 }}>
                Wholesale Corporate Supplies · Lahore
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 800,
              color: "#4ade80",
            }}
          >
            {count > 0 ? `${count} Products Available` : "Wholesale Range"}
          </div>
        </div>

        {/* Middle: Category Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1040 }}>
          <span
            style={{
              fontSize: 20,
              color: "#a3e635",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Wholesale Catalog & Carton Rates
          </span>
          <div
            style={{
              fontSize: 58,
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: "#ffffff",
            }}
          >
            {title}
          </div>
          <p
            style={{
              fontSize: 22,
              lineHeight: 1.4,
              color: "#cbd5e1",
              maxWidth: 900,
              marginTop: 4,
            }}
          >
            Direct carton wholesale rates, genuine manufacturer stock, and bulk supply for commercial clients in Lahore.
          </p>
        </div>

        {/* Bottom Bar: Trust Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 18, color: "#cbd5e1" }}>
            <span style={{ fontWeight: 700, color: "#ffffff" }}>✓ Minimum Order 1 Carton</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: "#ffffff" }}>✓ Gulberg & Lahore Delivery</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: "#ffffff" }}>✓ Corporate GST Invoicing</span>
          </div>

          <div
            style={{
              background: "#22c55e",
              color: "#052e16",
              padding: "12px 24px",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            pakmultilinks.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
