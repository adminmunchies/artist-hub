// app/onboarding/[role]/page.tsx
import type { Role } from "../../../lib/plans";

const LABEL: Record<Role, string> = {
  artist: "Artist",
  curator: "Curator",
  gallery: "Gallery / Institution",
  collector: "Collector",
};

const STEPS: Record<Role, string[]> = {
  artist: [
    "Add name, city, short bio",
    "Upload 1 artwork (images, alt text)",
    "Post 1 news (optional)",
    "Submit for review (you’ll go live after approval)",
  ],
  curator: [
    "Add curator bio & links",
    "Link artists/galleries you work with",
    "Submit your first feature (solo or group)",
    "Publish after editorial review",
  ],
  gallery: [
    "Add gallery profile (name, city, website)",
    "Create 1 show & 1 announcement",
    "Link represented artists",
    "Submit for review",
  ],
  collector: [
    "Set interests (discipline, city, budget)",
    "Save a few artists",
    "Enable alerts (Plus plan)",
    "Refine your discovery feed",
  ],
};

export default function OnboardingPage({ params }: { params: { role: Role } }) {
  const role = (["artist","curator","gallery","collector"].includes(params.role) ? params.role : "artist") as Role;
  return (
    <main className="pb-24 pt-6">
      <h1 className="text-3xl font-semibold">Onboarding — {LABEL[role]}</h1>
      <p className="mt-2" style={{ color: "#666" }}>
        This is your quick start. You can always change plan or details later.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="text-lg font-medium">Checklist</h2>
        <ol className="mt-3 pl-5" style={{ listStyle: "decimal" }}>
          {STEPS[role].map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
        </ol>

        <div className="mt-6" style={{ display: "flex", gap: 10 }}>
          {/* Login/Signup stub — passe an deine Auth-Routen an */}
          <a href="/login" className="btn">Continue & sign in</a>
          <a href={`/pricing?role=${role}`} className="btn" style={{ borderColor: "#bbb" }}>
            See pricing
          </a>
        </div>
      </div>
    </main>
  );
}
