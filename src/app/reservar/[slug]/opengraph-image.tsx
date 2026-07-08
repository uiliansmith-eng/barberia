import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type BookingInfo = {
  tenant: {
    name: string;
    address: string | null;
    avg_rating: number | null;
    reviews_count: number;
    price_tier: string | null;
    tags: string[];
  };
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_booking_info", { p_slug: slug });
  const info = data as unknown as BookingInfo | null;
  const tenant = info?.tenant;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 90px",
          background: "#141210",
          backgroundImage:
            "radial-gradient(ellipse 900px 600px at 90% 10%, rgba(201,162,39,0.2), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "sans-serif",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#c9a227",
            marginBottom: 28,
          }}
        >
          BARBEROS
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 66,
            fontWeight: 800,
            color: "#efe9df",
            maxWidth: 950,
            lineHeight: 1.15,
          }}
        >
          {tenant?.name ?? "Reserva tu cita"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 28,
            color: "#a39c8e",
            marginTop: 26,
          }}
        >
          {tenant && tenant.reviews_count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#c9a227" }}>★</span>
              <span style={{ color: "#efe9df" }}>{tenant.avg_rating}</span>
              <span>({tenant.reviews_count})</span>
            </div>
          )}
          {tenant?.price_tier && <div style={{ display: "flex" }}>{tenant.price_tier}</div>}
          {tenant && tenant.tags.length > 0 && (
            <div style={{ display: "flex" }}>{tenant.tags.join(", ")}</div>
          )}
        </div>
      </div>
    ),
    size
  );
}
