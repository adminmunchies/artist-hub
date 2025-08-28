"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50">
      {pending ? "Saving..." : children}
    </button>
  );
}
