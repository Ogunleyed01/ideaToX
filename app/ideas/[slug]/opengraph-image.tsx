import { ImageResponse } from "next/og";
import { getIdeaBySlug } from "@/lib/ideas";

export const alt = "IdeaToX Specification Card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const CATEGORY_NAMES: Record<string, string> = {
  web: "Web Application",
  mobile: "Mobile PWA",
  ai: "AI & Agents",
  cli: "CLI & Systems",
  hardware: "Hardware & IoT",
  extension: "Browser Extension",
};

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; color: string; border: string; bg: string }
> = {
  beginner: {
    label: "Weekend Build",
    color: "#34d399",
    border: "rgba(52, 211, 153, 0.4)",
    bg: "rgba(52, 211, 153, 0.12)",
  },
  intermediate: {
    label: "Side Project",
    color: "#2dd4bf",
    border: "rgba(45, 212, 191, 0.4)",
    bg: "rgba(45, 212, 191, 0.12)",
  },
  advanced: {
    label: "Full SaaS",
    color: "#fbbf24",
    border: "rgba(251, 191, 36, 0.4)",
    bg: "rgba(251, 191, 36, 0.12)",
  },
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  const title = idea?.title || "IdeaToX Project Specification";
  const hook =
    idea?.hook ||
    "An open-source interactive technical specification for developers and indie hackers.";
  const categoryName =
    (idea && CATEGORY_NAMES[idea.category]) || "Software Architecture";
  const difficulty =
    (idea && DIFFICULTY_CONFIG[idea.difficulty]) || DIFFICULTY_CONFIG.intermediate;
  const region = idea?.target_region || "Global";
  const upvotes = idea?.upvotes_count ?? 42;
  const forks = idea?.forks_count ?? 8;
  const authorName = idea?.author?.full_name || idea?.author?.username || "Open Source Builder";
  const features = idea?.mvp_features?.slice(0, 3) || [
    "Modular architecture & high-throughput pipeline",
    "Offline-first local state replication engine",
    "Automated export & verified telemetry triggers",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#07080b",
          padding: "54px 64px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient Radial Glowing Halos */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45, 212, 191, 0.16) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            left: "-100px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          {/* Logo and Tagline */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#13141a",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  backgroundColor: "#2dd4bf",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                }}
              >
                IdeaToX
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                The Git for Software Ideas
              </span>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {categoryName}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: difficulty.bg,
                border: `1px solid ${difficulty.border}`,
                color: difficulty.color,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {difficulty.label}
            </div>
          </div>
        </div>

        {/* Central Card Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            marginTop: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: title.length > 40 ? "42px" : "50px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              maxWidth: "1040px",
            }}
          >
            {title}
          </div>

          {/* Hook / Subheadline */}
          <div
            style={{
              fontSize: "22px",
              lineHeight: 1.4,
              color: "#94a3b8",
              marginTop: "16px",
              maxWidth: "1020px",
            }}
          >
            {hook}
          </div>

          {/* Key Feature Bullets */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            {features.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#cbd5e1",
                  fontSize: "16px",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(45, 212, 191, 0.2)",
                    border: "1px solid rgba(45, 212, 191, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2dd4bf",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Metadata & Telemetry Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            zIndex: 10,
          }}
        >
          {/* Author & Region */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Architect:</span>
              <span style={{ fontSize: "15px", color: "#f1f5f9", fontWeight: 600 }}>
                {authorName}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Region:</span>
              <span style={{ fontSize: "14px", color: "#cbd5e1", fontWeight: 500 }}>
                {region}
              </span>
            </div>
          </div>

          {/* Telemetry Stats: Stars & Forks */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e2e8f0",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#fbbf24" }}>★</span>
              <span>{upvotes} upvotes</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e2e8f0",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#2dd4bf" }}>⑂</span>
              <span>{forks} forks</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "13px",
                fontFamily: "monospace",
                color: "#94a3b8",
              }}
            >
              ideatox.dev
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
