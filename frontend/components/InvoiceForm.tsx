"use client";

import { useState, type FormEvent } from "react";
import type { Invoice } from "@/lib/types";

type Props = {
  onGenerated: (invoice: Invoice) => void;
  onLoadingChange: (loading: boolean) => void;
};

const PLACEHOLDER =
  "I designed a logo for Tunde's restaurant with 3 revisions, charged ₦50,000, he pays net 7.";

export default function InvoiceForm({ onGenerated, onLoadingChange }: Props) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!description.trim()) return;

    setError(null);
    setLoading(true);
    onLoadingChange(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      onGenerated(data as Invoice);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="description" className="sr-only">
        Describe the work
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={6}
        disabled={loading}
        className="w-full resize-none rounded-xl border border-black/5 bg-[#fafafc] px-5 py-4 text-[17px] leading-[1.47] text-[#1d1d1f] placeholder:text-black/40 focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 disabled:opacity-60"
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[14px] leading-[1.43] text-black/60">
          Plain English in. Invoice out.
        </p>
        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0071e3] px-5 text-[17px] font-normal text-white transition-colors hover:bg-[#0077ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate invoice"}
        </button>
      </div>
    </form>
  );
}
