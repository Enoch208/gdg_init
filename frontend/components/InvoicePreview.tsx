"use client";

import { useEffect, useRef, useState } from "react";
import type { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/currency";

type Props = {
  invoice: Invoice | null;
  loading: boolean;
  onChange: (invoice: Invoice) => void;
  onReset: () => void;
};

function EditableField({
  value,
  onChange,
  ariaLabel,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      aria-label={ariaLabel}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent border-b border-transparent hover:border-black/10 focus:border-[#0071e3] focus:outline-none transition-colors ${className}`}
    />
  );
}

export default function InvoicePreview({ invoice, loading, onChange, onReset }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (invoice && typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [invoice]);

  async function handleDownload() {
    if (!invoice || !sheetRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .from(sheetRef.current)
        .set({
          margin: 0.5,
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .save();
    } finally {
      setDownloading(false);
    }
  }

  function update<K extends keyof Invoice>(key: K, value: Invoice[K]) {
    if (!invoice) return;
    onChange({ ...invoice, [key]: value });
  }

  if (loading && !invoice) {
    return (
      <div className="rounded-2xl bg-white p-10 shadow-[0_3px_30px_rgba(0,0,0,0.06)]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-black/5" />
          <div className="h-4 w-64 rounded bg-black/5" />
          <div className="mt-8 h-4 w-full rounded bg-black/5" />
          <div className="h-4 w-5/6 rounded bg-black/5" />
          <div className="h-4 w-4/6 rounded bg-black/5" />
          <div className="mt-8 h-24 w-full rounded bg-black/5" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-2xl bg-white p-10 shadow-[0_3px_30px_rgba(0,0,0,0.06)]">
        <div className="mb-6 text-[14px] font-semibold tracking-[-0.224px] text-black/40">
          PREVIEW
        </div>
        <div className="pointer-events-none select-none opacity-40">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[28px] font-semibold leading-[1.14] tracking-[0.196px] text-[#1d1d1f]">
                Invoice
              </div>
              <div className="mt-1 text-[14px] leading-[1.43] tracking-[-0.224px] text-black/60">
                INV-20260418-042
              </div>
            </div>
            <div className="text-right text-[14px] leading-[1.43] tracking-[-0.224px] text-black/60">
              <div>Issued Apr 18, 2026</div>
              <div>Due Apr 25, 2026</div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 text-[14px] leading-[1.43] tracking-[-0.224px]">
            <div>
              <div className="font-semibold text-black/40">From</div>
              <div className="mt-1 text-[#1d1d1f]">Your Name</div>
            </div>
            <div>
              <div className="font-semibold text-black/40">To</div>
              <div className="mt-1 text-[#1d1d1f]">Client</div>
            </div>
          </div>
          <div className="mt-10 border-t border-black/10 pt-4 text-[14px] text-black/60">
            Line items will show up here.
          </div>
        </div>
        <div className="mt-8 text-center text-[14px] leading-[1.43] tracking-[-0.224px] text-black/50">
          Describe your work on the left to generate an invoice.
        </div>
      </div>
    );
  }

  const symbol = detectSymbol(invoice);

  return (
    <div>
      <div
        ref={sheetRef}
        className="rounded-2xl bg-white p-10 text-[#1d1d1f] shadow-[0_3px_30px_rgba(0,0,0,0.08)]"
      >
        <header className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[40px] font-semibold leading-[1.10] tracking-tight text-[#1d1d1f]">
              Invoice
            </div>
            <div className="mt-1 text-[14px] leading-[1.43] tracking-[-0.224px] text-black/60">
              {invoice.invoiceNumber}
            </div>
          </div>
          <div className="text-right text-[14px] leading-[1.43] tracking-[-0.224px] text-black/60">
            <div>
              <span className="text-black/40">Issued </span>
              {formatDate(invoice.issueDate)}
            </div>
            <div>
              <span className="text-black/40">Due </span>
              {formatDate(invoice.dueDate)}
            </div>
          </div>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="text-[14px] leading-[1.43] tracking-[-0.224px]">
            <div className="mb-2 font-semibold text-black/40">From</div>
            <EditableField
              value={invoice.freelancerName}
              onChange={(v) => update("freelancerName", v)}
              ariaLabel="Your name"
              placeholder="Your Name"
              className="text-[17px] leading-[1.24] font-semibold tracking-[-0.374px] text-[#1d1d1f]"
            />
            <EditableField
              value={invoice.freelancerEmail}
              onChange={(v) => update("freelancerEmail", v)}
              ariaLabel="Your email"
              placeholder="you@example.com"
              className="mt-1 text-[14px] text-black/70"
            />
          </div>
          <div className="text-[14px] leading-[1.43] tracking-[-0.224px]">
            <div className="mb-2 font-semibold text-black/40">Bill to</div>
            <EditableField
              value={invoice.clientName}
              onChange={(v) => update("clientName", v)}
              ariaLabel="Client name"
              placeholder="Client name"
              className="text-[17px] leading-[1.24] font-semibold tracking-[-0.374px] text-[#1d1d1f]"
            />
            <EditableField
              value={invoice.clientEmail}
              onChange={(v) => update("clientEmail", v)}
              ariaLabel="Client email"
              placeholder="client@example.com"
              className="mt-1 text-[14px] text-black/70"
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-3 border-b border-black/10 pb-3 text-[12px] font-semibold uppercase tracking-[-0.12px] text-black/40">
            <div>Description</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Amount</div>
          </div>
          <div className="divide-y divide-black/5 text-[14px] leading-[1.43] tracking-[-0.224px]">
            {invoice.lineItems.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 py-3"
              >
                <div className="text-[#1d1d1f]">{item.description}</div>
                <div className="text-right text-black/70">{item.quantity}</div>
                <div className="text-right text-black/70">
                  {formatCurrency(item.rate, symbol)}
                </div>
                <div className="text-right font-semibold text-[#1d1d1f]">
                  {formatCurrency(item.amount, symbol)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 flex justify-end">
          <div className="w-full max-w-xs text-[14px] leading-[1.43] tracking-[-0.224px]">
            <Row label="Subtotal" value={formatCurrency(invoice.subtotal, symbol)} />
            {invoice.taxRate > 0 && (
              <Row
                label={`VAT (${(invoice.taxRate * 100).toFixed(1).replace(/\.0$/, "")}%)`}
                value={formatCurrency(invoice.taxAmount, symbol)}
              />
            )}
            <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-3">
              <span className="text-[17px] font-semibold tracking-[-0.374px]">Total</span>
              <span className="text-[21px] font-semibold tracking-[0.231px]">
                {formatCurrency(invoice.total, symbol)}
              </span>
            </div>
          </div>
        </section>

        {(invoice.paymentTerms || invoice.notes) && (
          <section className="mt-10 space-y-4 border-t border-black/10 pt-6 text-[14px] leading-[1.43] tracking-[-0.224px] text-black/70">
            {invoice.paymentTerms && (
              <div>
                <div className="mb-1 text-[12px] font-semibold uppercase tracking-[-0.12px] text-black/40">
                  Payment terms
                </div>
                <div>{invoice.paymentTerms}</div>
              </div>
            )}
            {invoice.notes && (
              <div>
                <div className="mb-1 text-[12px] font-semibold uppercase tracking-[-0.12px] text-black/40">
                  Notes
                </div>
                <div>{invoice.notes}</div>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="no-print mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center rounded-lg border border-black/10 bg-white px-4 text-[14px] font-normal text-[#1d1d1f] transition-colors hover:bg-black/[.03]"
        >
          New invoice
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex h-10 items-center rounded-lg bg-[#1d1d1f] px-4 text-[14px] font-normal text-white transition-colors hover:bg-black disabled:opacity-60"
        >
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-black/60">{label}</span>
      <span className="text-[#1d1d1f]">{value}</span>
    </div>
  );
}

function detectSymbol(invoice: Invoice): string {
  const hay = `${invoice.notes} ${invoice.paymentTerms} ${invoice.lineItems.map((i) => i.description).join(" ")}`;
  if (hay.includes("$")) return "$";
  if (hay.includes("€")) return "€";
  if (hay.includes("£")) return "£";
  return "₦";
}
