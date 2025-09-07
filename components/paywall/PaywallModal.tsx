// components/paywall/PaywallModal.tsx
"use client";

import React from "react";

type Props = {
  open: boolean;
  title: string;
  subhead?: string;
  benefits: string[];
  priceLabel: string;     // e.g. "€10/mo"
  ctaHref: string;        // e.g. "/api/checkout?plan=artist_basic"
  onClose: () => void;
  onUnlock?: () => void;  // called before navigating
};

export default function PaywallModal({
  open,
  title,
  subhead,
  benefits,
  priceLabel,
  ctaHref,
  onClose,
  onUnlock,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,.4)", padding: 16 }}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between" style={{ display: "flex" }}>
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            aria-label="Close"
            className="btn"
            onClick={onClose}
            style={{ borderRadius: 999, padding: "4px 10px" }}
          >
            ✕
          </button>
        </div>
        {subhead && <p className="mt-2 text-sm" style={{ color: "#666" }}>{subhead}</p>}

        <ul className="mt-4 list-disc space-y-1 pl-6 text-sm">
          {benefits.map((b, i) => <li key={i}>{b}</li>)}
        </ul>

        <div className="mt-6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="text-sm" style={{ color: "#666" }}>You can change or cancel anytime.</span>
          <a
            href={ctaHref}
            onClick={onUnlock}
            className="btn"
          >
            Unlock — {priceLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
