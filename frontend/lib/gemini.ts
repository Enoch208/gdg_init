import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Invoice } from "./types";

const SYSTEM_INSTRUCTION = `You are an expert invoice generator. Given a freelancer's plain-English description of work done, extract structured invoice data. Infer reasonable line items, quantities, and rates from the description. If the user mentions a currency symbol (₦, $, €), use it; otherwise default to ₦ (Naira). Calculate subtotal, apply 7.5% VAT if the amount is over ₦10,000, and compute total. Due date should be 14 days from today unless the user specifies 'net X' in which case use X days. Generate a professional invoice number in the format INV-YYYYMMDD-XXX where XXX is random. Return ONLY valid JSON matching this exact schema, no prose, no markdown fences:
{
  "invoiceNumber": string,
  "issueDate": string (YYYY-MM-DD),
  "dueDate": string (YYYY-MM-DD),
  "clientName": string,
  "clientEmail": string (empty string if not provided),
  "freelancerName": string (use 'Your Name' if not mentioned),
  "freelancerEmail": string (empty string if not provided),
  "lineItems": [{"description": string, "quantity": number, "rate": number, "amount": number}],
  "subtotal": number,
  "taxRate": number,
  "taxAmount": number,
  "total": number,
  "paymentTerms": string,
  "notes": string
}`;

export async function generateInvoice(description: string): Promise<Invoice> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Today's date is ${today}.\n\nFreelancer's description:\n${description}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as Invoice;
}
