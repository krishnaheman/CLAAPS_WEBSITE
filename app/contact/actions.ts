"use server";

import { appendConsultationRow } from "@/lib/consultations-excel";

export type ConsultationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitConsultationRequest(
  _prevState: ConsultationFormState,
  formData: FormData
): Promise<ConsultationFormState> {
  const name            = String(formData.get("name")            ?? "").trim();
  const email           = String(formData.get("email")           ?? "").trim();
  const company         = String(formData.get("company")         ?? "").trim();
  const role            = String(formData.get("role")            ?? "").trim();
  const serviceInterest = String(formData.get("serviceInterest") ?? "").trim();
  const message         = String(formData.get("message")         ?? "").trim();

  // ── Validation (unchanged) ────────────────────────────────────────────────
  if (!name || !email || !company || !role || !serviceInterest || !message) {
    return { status: "error", message: "Please complete all required fields." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid work email address." };
  }

  // ── Persist to Excel ──────────────────────────────────────────────────────
  try {
    await appendConsultationRow({
      timestamp: new Date().toISOString(),
      name,
      email,
      company,
      role,
      serviceInterest,
      message,
    });
  } catch (err) {
    console.error("Failed to write consultation to Excel:", err);
    return {
      status: "error",
      message: "Something went wrong saving your request. Please try again.",
    };
  }

  // ── Success (unchanged) ───────────────────────────────────────────────────
  return {
    status: "success",
    message:
      "Thanks — your request has been received. A member of the Claaps team will follow up.",
  };
}
