"use client";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import { useKioskStore } from "@/store/kioskStore";
import { t } from "@/lib/i18n";

export default function CameraConsentPage() {
  const router = useRouter();
  const { setIntake, intake, language } = useKioskStore();

  function accept() {
    // Store camera consent in intake so it flows into HL7
    setIntake({ ...(intake ?? {
      chiefComplaints: [], chiefComplaintNote: "",
      ageGroup: null, sex: null, conditions: [], allergies: [],
      cameraConsent: false,
    }), cameraConsent: true });
    // Arm the one-time 5-second recording — the Pi camera stays off until
    // the vitals page triggers it, and shuts off right after the clip
    fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "consent_given" }),
    }).catch(() => {});
    router.push("/intake");
  }

  function decline() {
    setIntake({ ...(intake ?? {
      chiefComplaints: [], chiefComplaintNote: "",
      ageGroup: null, sex: null, conditions: [], allergies: [],
      cameraConsent: false,
    }), cameraConsent: false });
    router.push("/intake");
  }

  const howItems = [
    t(language, "cam_how_1"),
    t(language, "cam_how_2"),
    t(language, "cam_how_3"),
    t(language, "cam_how_4"),
  ];

  return (
    <KioskShell step={2}>
      {/* Portrait-first vertical layout for 720×1280 */}
      <div className="flex flex-col h-full px-5 py-4 gap-4">

        {/* Camera illustration — compact horizontal strip */}
        <div className="flex items-center gap-4 bg-slate-800/60 border border-white/10 rounded-2xl px-4 py-3 shrink-0">
          <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
            <div className="relative w-10 h-10 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sky-400/50" />
              </div>
              <div className="absolute top-1.5 right-2 w-1 h-1 rounded-full bg-white/40" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold font-mono">Pi Cam V2</p>
            <p className="text-slate-400 text-xs">Camera at sensor station — not this screen</p>
          </div>
          <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl px-3 py-1.5 shrink-0">
            <svg className="w-3 h-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sky-300 text-xs font-semibold">5s clip</span>
          </div>
        </div>

        {/* Scrollable consent content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          <div>
            <p className="text-sky-400 text-xs uppercase tracking-widest mb-1">Optional</p>
            <h1 className="text-2xl font-bold text-white">{t(language, "cam_title")}</h1>
            <p className="text-slate-300 mt-2 leading-relaxed text-sm">
              {t(language, "cam_desc")}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">
              {t(language, "cam_how_title")}
            </p>
            <ul className="space-y-1.5">
              {howItems.map((text) => (
                <li key={text} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-sky-400 shrink-0 mt-0.5">›</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* AI inference tags */}
          <div className="flex flex-wrap gap-2">
            {["Estimated age", "Visible distress level", "Pulse wave (BP est.)", "Respiratory rate"].map((tag) => (
              <span key={tag} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons — always visible at bottom */}
        <div className="flex flex-col gap-2 shrink-0 pb-1">
          <button
            onClick={accept}
            className="w-full py-5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all text-white font-bold text-lg"
          >
            {t(language, "cam_accept")}
          </button>
          <button
            onClick={decline}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-300 font-semibold text-base"
          >
            {t(language, "cam_decline")}
          </button>
        </div>
      </div>
    </KioskShell>
  );
}
