# Invoix

An AI-powered invoice generator built live on stage at Build with AI OAU × GDG, April 18 2026.

Describe what you did in plain English. Get back a proper invoice. Download it as a PDF.

Built with Next.js, Tailwind, Gemini 2.0 Flash, and deployed to Cloud Run.

---

## What this is

Most invoice tools make you click through forms. Line item one. Line item two. Quantity. Rate. Tax. It takes longer than the work you're billing for.

Invoix flips it. You type one sentence about the work you did. Gemini extracts the line items, applies tax, calculates totals, sets a due date. You get a clean invoice you can download as a PDF and send.

Example input:
> I designed a logo for Tunde's restaurant with 3 revisions, charged ₦50,000, he pays net 7.

Example output: a formatted invoice with line items, subtotal, VAT, total, due date 7 days out, and a payment-terms line.

---

## Why this was built

This was the hero demo for "The Future Stack: Web Development in the Age of AI" — a talk about what changes when you build with AI agents instead of typing every line yourself. The point wasn't to ship a production invoicing SaaS. The point was to prove that a working AI product can be built and deployed live, in under an hour, in front of an audience, using the workflow the talk describes.

The build was done in Google Antigravity using three prompts. Those prompts are the whole engineering spec. They're in this README because the prompts *are* the context engineering the talk is about — and anyone reading this repo should be able to reproduce the build from scratch.

---

## Stack

- Next.js 14 with the app router, TypeScript
- Tailwind CSS, tokens configured from a custom Apple-inspired design system
- @google/generative-ai SDK for Gemini 2.0 Flash
- html2pdf.js for the PDF export
- Deployed to Google Cloud Run via `gcloud run deploy --source .`

No database. No auth. No history. You open the page, you generate an invoice, you download it, you close the tab. That's the whole product.

---

## Local development

You need Node 20+ and a Gemini API key from [aistudio.google.com](https://aistudio.google.com).

```bash
git clone https://github.com/Enoch208/invoix
cd invoix
npm install

# Create .env.local and paste your key
echo "GEMINI_API_KEY=your_key_here" > .env.local

npm run dev
```

Open http://localhost:3000.

---

## Deploy to Cloud Run

```bash
gcloud run deploy invoix \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

First deploy takes 3-4 minutes. The URL is printed at the end. Subsequent deploys are faster.

The app reads `process.env.PORT` so it works on Cloud Run without any config changes.

---

## How it works

1. User types a description of work done into a textarea
2. Frontend POSTs to `/api/generate` with the description
3. That route calls Gemini 2.0 Flash with a system instruction that tells it to return structured JSON matching an invoice schema
4. Gemini returns JSON (forced via `responseMimeType: 'application/json'`)
5. Frontend hydrates the invoice preview component with the parsed data
6. User can edit any field inline, then hit "Download PDF" to export via html2pdf

The Gemini system instruction does the real work. It handles currency detection, VAT logic (7.5% on amounts over ₦10,000), due date parsing ("net 14" → 14 days out), and generates an invoice number. The frontend is mostly rendering and styling.

---

## The build plan

This was built from three prompts, pasted into Antigravity one at a time, each one a complete brief instead of a vague ask.

This is the pattern the talk advocates. You don't ask AI for "an invoice generator." You give it enough context that a reasonable junior dev could do the task, then get out of the way.

### Prompt 1 — Scaffold

> I'm building an AI-powered invoice generator called "Invoix" for a live demo in 45 minutes. I need you to scaffold it end-to-end, fast.
>
> **Stack:**
> - Next.js 14 (app router, TypeScript)
> - Tailwind CSS
> - @google/generative-ai for Gemini
>
> **Design system:**
> I've attached my Apple-inspired design system as apple-design.md in the project. Read that file FIRST and extract every design token from it — colors, fonts, spacing scale, radii, shadows, button styles, input styles. Configure tailwind.config.ts to use those exact tokens. Create a globals.css that sets up the base typography and background exactly as the MD specifies. Do not invent your own colors or fonts. If the MD uses SF Pro or system fonts, use those. Follow the MD strictly.
>
> **Build:**
> 1. Initialize the Next.js project with TypeScript, Tailwind, app router, ESLint
> 2. Install @google/generative-ai and html2pdf.js
> 3. Create the folder structure: app/page.tsx, app/api/generate/route.ts, components/InvoiceForm.tsx, components/InvoicePreview.tsx, lib/gemini.ts, lib/types.ts
> 4. In lib/types.ts, define the Invoice type with: clientName, clientEmail, invoiceNumber, issueDate, dueDate, lineItems (array of {description, quantity, rate, amount}), subtotal, taxRate, taxAmount, total, paymentTerms, notes, freelancerName, freelancerEmail
> 5. Build app/page.tsx as a two-column layout: left column is InvoiceForm (a single textarea with a submit button), right column is InvoicePreview (empty placeholder for now). On mobile it stacks vertically.
> 6. Make the whole UI match the Apple MD — clean, generous whitespace, crisp type hierarchy, soft shadows, subtle borders. Header at top with "Invoix" wordmark and tagline "Describe the work. Get a proper invoice."
> 7. InvoiceForm is a client component with a textarea placeholder: "I designed a logo for Tunde's restaurant with 3 revisions, charged ₦50,000, he pays net 7."
> 8. InvoicePreview shows a friendly empty state when no invoice exists yet.
>
> Do NOT add authentication, database, or any persistence. Do NOT add a landing page above this. The app IS the invoice generator. Ship a working scaffold I can `npm run dev` and see styled correctly.
>
> When done, print the three commands I need to run: install, dev, and a confirmation that .env.local needs GEMINI_API_KEY.

### Prompt 2 — The AI feature

> Now wire up the AI. This is the core feature.
>
> **Setup:**
> - Create .env.local with GEMINI_API_KEY=<placeholder I'll fill in>
> - In lib/gemini.ts, export a function generateInvoice(description: string) that calls Gemini 2.0 Flash
>
> **System instruction for Gemini:**
>
> "You are an expert invoice generator. Given a freelancer's plain-English description of work done, extract structured invoice data. Infer reasonable line items, quantities, and rates from the description. If the user mentions a currency symbol (₦, $, €), use it; otherwise default to ₦ (Naira). Calculate subtotal, apply 7.5% VAT if the amount is over ₦10,000, and compute total. Due date should be 14 days from today unless the user specifies 'net X' in which case use X days. Generate a professional invoice number in the format INV-YYYYMMDD-XXX where XXX is random. Return ONLY valid JSON matching this exact schema, no prose, no markdown fences:
> ```
> {
>   invoiceNumber: string,
>   issueDate: string (YYYY-MM-DD),
>   dueDate: string (YYYY-MM-DD),
>   clientName: string,
>   clientEmail: string (empty string if not provided),
>   freelancerName: string (use 'Your Name' if not mentioned),
>   freelancerEmail: string (empty string if not provided),
>   lineItems: [{description: string, quantity: number, rate: number, amount: number}],
>   subtotal: number,
>   taxRate: number,
>   taxAmount: number,
>   total: number,
>   paymentTerms: string,
>   notes: string
> }
> ```
>
> Use responseMimeType: 'application/json' in the Gemini config to force JSON output. Use model 'gemini-2.0-flash-exp' or 'gemini-2.0-flash', whichever is current.
>
> **API route:**
> app/api/generate/route.ts — POST endpoint. Takes { description: string }, calls generateInvoice, returns the parsed JSON. Handle errors: if Gemini fails, return 500 with the error message. Log full errors to console.
>
> **Wire up the UI:**
> - InvoiceForm submit → POST to /api/generate → set loading state → on success, hydrate InvoicePreview → on error, show a toast/inline error message
> - InvoicePreview renders the full invoice: header with "INVOICE" + number + dates, from/to blocks, line items table, totals section (right-aligned, subtotal/tax/total with total in bold/larger), payment terms and notes at the bottom. Match the Apple design MD — clean type, generous spacing, subtle lines. Use ₦ currency formatting with proper thousands separators (e.g. ₦50,000.00).
> - Loading state: a subtle skeleton or shimmer in the preview area. Do not block the form.
> - After successful generation, scroll the preview into view on mobile.
>
> Do NOT save anything. Do NOT add a history feature. One invoice at a time, replaced on each generation.
>
> Test with: "I did branding for a fintech startup, 2 weeks of work, charged ₦800,000 with net 14 terms."

### Prompt 3 — PDF, polish, deploy prep

> Final pass. Make it shippable and demo-ready.
>
> **PDF download:**
> - Add a "Download PDF" button to the InvoicePreview, visible only after an invoice is generated
> - Use html2pdf.js to export the invoice section to a clean PDF
> - Configure it for A4, 0.5 inch margins, filename format: invoice-{invoiceNumber}.pdf
> - IMPORTANT: hide the button itself from the PDF output (use a CSS class like .no-print)
> - Make sure the rendered PDF matches what's on screen — no broken layout, no cut-off text
>
> **Inline editing:**
> - Make the freelancerName, freelancerEmail, clientName, clientEmail fields in the InvoicePreview editable inline (contentEditable or input-on-click). Users should be able to tweak the AI's output before downloading. Keep it subtle — no obvious form fields, just hover states that reveal the field is editable.
>
> **Polish:**
> - Add a small "New Invoice" button next to "Download PDF" that clears the preview and refocuses the textarea
> - Error state in the form if Gemini fails: clean inline message, not a jarring alert
> - Make the empty state in InvoicePreview genuinely helpful — show an example of what an invoice will look like, faded/grayed out as a preview
> - Add proper meta tags to app/layout.tsx: title "Invoix — AI Invoice Generator", description, open graph tags
> - Favicon — use an emoji like 🧾 as a data URI favicon, no need for an actual file
>
> **Deploy prep:**
> - Create a Dockerfile at the root using node:20-slim, multi-stage build (deps → build → runner), exposing port 8080
> - CRITICAL: the app must listen on process.env.PORT (Next.js does this automatically if you use `next start -p $PORT`). Update package.json start script to: `"next start -p ${PORT:-8080}"`
> - Add a .dockerignore: node_modules, .next, .env.local, .git
> - Add a .gcloudignore (copy the .dockerignore content)
> - Create a README.md with three sections: (1) Local dev, (2) Deploy to Cloud Run, (3) How it works
>
> **Final check:**
> Build the app (`npm run build`) and fix any type errors or build warnings before declaring done. Test the PDF export actually works in the browser.

---

## The lesson, if you're reading this repo to learn

Three things made this work in under an hour. They're the three beats of the talk.

**AI is a tool, not a threat.** Every line of code in this project was written by an agent. I didn't type the Tailwind config. I didn't type the Gemini call. I didn't type the PDF export. I was the architect. The agent was the laborer. That distribution is why it shipped.

**Context beats prompting.** Look at those three prompts. They're not clever. They're *complete*. They specify the stack, the files, the types, the user-facing copy, the edge cases, the things to NOT do. A clever one-liner like "make me an invoice generator" gets you garbage. A boring 400-word brief gets you a shipped product. That's context engineering.

**Shipping beats planning.** There's no database because I don't need one. There's no auth because nobody's paying for this yet. There's no history feature because I can add it in v2 if anyone actually wants it. The invoice generator that shipped at 4pm beats the invoicing platform I would have been still scoping at midnight.

---

## What it doesn't do (yet)

- No saved invoices
- No user accounts
- No email sending
- No multi-currency conversion
- No Stripe or payment links
- No recurring invoices
- No team features
- No analytics

All of these are v2 ideas. None of them were needed for today.

---

## Credits

Built by [Enoch Idowu](https://github.com/Enoch208) as the hero demo for "The Future Stack: Web Development in the Age of AI" — a talk given at Build with AI OAU × GDG Mobile & Web Development Community, April 18 2026, Step B (Adj. Faculty of Technology Building), OAU.

Co-facilitators: Nahemm Adisa (agents), Codegod (host).

Built in Google Antigravity with Gemini 2.0 Flash. Deployed on Google Cloud Run. Styled with an Apple-inspired design system that lives in the repo as `apple-design.md`.

---

## License

MIT. Take it, fork it, ship something better.
