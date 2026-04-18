"use client";

import { useState } from "react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import type { Invoice } from "@/lib/types";

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-3">
            <span className="text-[21px] font-semibold tracking-[-0.374px] text-[#1d1d1f]">
              Invoix
            </span>
            <span className="hidden text-[14px] leading-[1.43] tracking-[-0.224px] text-black/60 sm:inline">
              Describe the work. Get a proper invoice.
            </span>
          </div>
          <span className="text-[12px] tracking-[-0.12px] text-black/40">
            Powered by Gemini
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-10 sm:py-16">
        <section className="mb-10 max-w-2xl">
          <h1 className="text-[40px] font-semibold leading-[1.10] tracking-tight text-[#1d1d1f] sm:text-[56px] sm:leading-[1.07] sm:tracking-[-0.28px]">
            Invoices, in one sentence.
          </h1>
          <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-black/70">
            Type what you did. Invoix drafts a clean invoice you can edit and download as a PDF.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <section className="rounded-2xl bg-white p-6 shadow-[0_3px_30px_rgba(0,0,0,0.04)] sm:p-8">
            <h2 className="mb-4 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">
              Describe the work
            </h2>
            <InvoiceForm onGenerated={setInvoice} onLoadingChange={setLoading} />
          </section>

          <section>
            <InvoicePreview
              invoice={invoice}
              loading={loading}
              onChange={setInvoice}
              onReset={() => setInvoice(null)}
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-black/5 py-8 text-center text-[12px] tracking-[-0.12px] text-black/40">
        Built live at Build with AI OAU × GDG · April 18 2026
      </footer>
    </div>
  );
}
