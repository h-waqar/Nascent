"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/types/models";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToggle } from "@/components/admin/AdminToggle";

interface BankForm {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
}

const EMPTY_BANK: BankForm = { bankName: "", accountName: "", accountNumber: "", iban: "" };

interface ContactForm {
  whatsappNumber: string;
}

const EMPTY_CONTACT: ContactForm = { whatsappNumber: "" };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bank, setBank] = useState<BankForm>(EMPTY_BANK);
  const [contact, setContact] = useState<ContactForm>(EMPTY_CONTACT);
  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [showContactSaved, setShowContactSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState<"cod" | "bt" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      const s: Settings = data.settings;
      setSettings(s);
      setBank({
        bankName: s.bankName ?? "",
        accountName: s.accountName ?? "",
        accountNumber: s.accountNumber ?? "",
        iban: s.iban ?? "",
      });
      setContact({ whatsappNumber: s.whatsappNumber ?? "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function putSettings(patch: Partial<Settings>): Promise<void> {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        Array.isArray(body.error)
          ? body.error.map((i: { message?: string }) => i.message).join(", ")
          : (body.error ?? `HTTP ${res.status}`)
      );
    }
    const data = await res.json();
    setSettings(data.settings);
  }

  async function handleToggle(field: "codEnabled" | "bankTransferEnabled", value: boolean) {
    setError(null);
    setSavingToggle(field === "codEnabled" ? "cod" : "bt");
    try {
      await putSettings({ [field]: value });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle save failed");
    } finally {
      setSavingToggle(null);
    }
  }

  async function handleSaveBank(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingBank(true);
    try {
      await putSettings({
        bankName: bank.bankName.trim(),
        accountName: bank.accountName.trim(),
        accountNumber: bank.accountNumber.trim(),
        iban: bank.iban.trim(),
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingBank(false);
    }
  }

  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingContact(true);
    try {
      await putSettings({ whatsappNumber: contact.whatsappNumber.trim() });
      setShowContactSaved(true);
      setTimeout(() => setShowContactSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingContact(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <AdminPageHeader title="Settings" />
        <div className="px-8 py-8 text-[13px] text-black">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title="Settings" />
      <div className="max-w-[800px] mx-auto px-8 py-8 space-y-12">
        {error && (
          <div className="border border-black px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-black">
            {error}
          </div>
        )}

        {/* Payment Methods toggles */}
        <section className="space-y-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2">
            Payment Methods
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-black p-4">
              <AdminToggle
                checked={!!settings?.codEnabled}
                onChange={(v) => handleToggle("codEnabled", v)}
                label="Cash on Delivery"
              />
              {savingToggle === "cod" && (
                <span className="text-[11px] uppercase tracking-[0.1em] text-black">Saving…</span>
              )}
            </div>
            <div className="flex items-center justify-between border border-black p-4">
              <AdminToggle
                checked={!!settings?.bankTransferEnabled}
                onChange={(v) => handleToggle("bankTransferEnabled", v)}
                label="Bank Transfer"
              />
              {savingToggle === "bt" && (
                <span className="text-[11px] uppercase tracking-[0.1em] text-black">Saving…</span>
              )}
            </div>
          </div>
        </section>

        {/* Bank Transfer fields (Pakistan) */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2 mb-6">
            Bank Transfer Details
          </h2>
          <form onSubmit={handleSaveBank} className="space-y-6">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">
                Bank Name
              </label>
              <input
                type="text"
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">
                Account Holder Name
              </label>
              <input
                type="text"
                value={bank.accountName}
                onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">
                Account Number
              </label>
              <input
                type="text"
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">
                IBAN
              </label>
              <input
                type="text"
                value={bank.iban}
                onChange={(e) => setBank({ ...bank, iban: e.target.value.toUpperCase() })}
                maxLength={34}
                className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none uppercase"
              />
            </div>
            <div className="flex items-center gap-4 border-t border-black pt-6">
              <button
                type="submit"
                disabled={savingBank}
                className="border border-black bg-black text-white py-3 px-8 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingBank ? "Saving…" : "Save Details"}
              </button>
              {showSaved && (
                <span className="text-[11px] uppercase tracking-[0.1em] text-black">Saved</span>
              )}
            </div>
          </form>
        </section>
        {/* Contact Details */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2 mb-6">
            Contact Details
          </h2>
          <form onSubmit={handleSaveContact} className="space-y-6">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">
                WhatsApp Number
              </label>
              <p className="text-[11px] text-[#4c4546] mb-2">
                International format without +, e.g. 923001234567
              </p>
              <input
                type="text"
                value={contact.whatsappNumber}
                onChange={(e) => setContact({ whatsappNumber: e.target.value.replace(/\D/g, "") })}
                maxLength={20}
                placeholder="923001234567"
                className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-4 border-t border-black pt-6">
              <button
                type="submit"
                disabled={savingContact}
                className="border border-black bg-black text-white py-3 px-8 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingContact ? "Saving…" : "Save Details"}
              </button>
              {showContactSaved && (
                <span className="text-[11px] uppercase tracking-[0.1em] text-black">Saved</span>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
