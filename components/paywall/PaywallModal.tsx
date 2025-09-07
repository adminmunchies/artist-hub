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
};

export default function PaywallModal({
  open,
  title,
  subhead,
  benefits,
  priceLabel,
  ctaHref,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            aria-label="Close"
            className="rounded-full border px-2 py-1 text-sm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {subhead && <p className="mt-2 text-sm text-neutral-600">{subhead}</p>}

        <ul className="mt-4 list-disc space-y-1 pl-6 text-sm">
          {benefits.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-neutral-600">You can change or cancel anytime.</span>
          <a
            href={ctaHref}
            className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-black hover:text-white"
          >
            Unlock — {priceLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
