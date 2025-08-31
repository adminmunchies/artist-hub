export const size = { width: 1200, height: 630 } as const
export const contentType = "image/png"

export function OgFrame({ kicker, title, domain }: { kicker: string; title: string; domain: string }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        color: "white",
        background: "linear-gradient(135deg, #0b0b0c 0%, #101018 35%, #101320 70%, #0b0b0c 100%)",
      }}
    >
      <div style={{ fontSize: 42, opacity: 0.8, marginBottom: 12 }}>{kicker}</div>
      <div style={{ fontSize: 94, fontWeight: 800, lineHeight: 1.08, letterSpacing: -0.5, }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Inline Logo Badge */}
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            background: "linear-gradient(180deg, #fff 0%, #bbb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: 1,
          }}
        >
          MAC
        </div>
        <div style={{ fontSize: 32, opacity: 0.95 }}>{domain}</div>
      </div>
    </div>
  )
}
