import { ImageResponse } from "next/og";

export const alt = "Voya · Planea el viaje de tus sueños";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
          backgroundColor: "#FAF6F1",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "2px",
              backgroundColor: "#C97B5A",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              color: "#C97B5A",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Voya
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "100px",
            fontWeight: 300,
            color: "#2C1810",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Planea el viaje</span>
          <span>
            de tus{" "}
            <span style={{ color: "#C97B5A", fontStyle: "italic" }}>
              sueños
            </span>
          </span>
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>
            sin el caos
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: "40px",
            fontSize: "28px",
            color: "#5C4438",
            fontFamily: "Inter, sans-serif",
            fontWeight: 300,
            lineHeight: 1.4,
            maxWidth: "900px",
          }}
        >
          Descubre actividades curadas con AI, organiza tu calendario y
          calcula tu presupuesto.
        </div>
      </div>
    ),
    { ...size }
  );
}
