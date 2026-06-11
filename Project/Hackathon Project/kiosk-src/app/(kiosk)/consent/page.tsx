"use client";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import { useKioskStore } from "@/store/kioskStore";
import { t } from "@/lib/i18n";

export default function ConsentPage() {
  const router = useRouter();
  const { setConsent, language } = useKioskStore();

  function accept() {
    setConsent(true);
    router.push("/camera-consent");
  }

  const hipaaItems = [
    t(language, "hipaa_1"),
    t(language, "hipaa_2"),
    t(language, "hipaa_3"),
    t(language, "hipaa_4"),
    t(language, "hipaa_5"),
  ];

  return (
    <KioskShell step={1}>
      <div className="flex flex-col justify-center h-full px-6 py-6 gap-4 max-w-2xl mx-auto w-full">

        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">{t(language, "welcome")}</h1>
        </div>

        <p className="text-slate-300 leading-relaxed text-lg">
          {t(language, "consent_desc")}
        </p>

        {/* HIPAA notice */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3">
            {t(language, "hipaa_title")}
          </h2>
          <ul className="space-y-2.5">
            {hipaaItems.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-slate-300">
                <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* HIPAA badge */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          This kiosk is operated under HIPAA-compliant security controls. All on-premise processing — no cloud storage.
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={accept}
            className="py-5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all text-white font-bold text-xl shadow-lg shadow-sky-500/25"
          >
            {t(language, "agree_btn")}
          </button>
          <p className="text-xs text-slate-500 text-center">
            {t(language, "consent_footer")}
          </p>
        </div>
      </div>
    </KioskShell>
  );
}
