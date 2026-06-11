"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import KioskShell from "@/components/KioskShell";
import { useKioskStore } from "@/store/kioskStore";
import type { IntakeData } from "@/store/kioskStore";
import { t } from "@/lib/i18n";

type AgeGroup = IntakeData["ageGroup"];
type Sex = IntakeData["sex"];

const COMPLAINT_GRID = [
  { id: "chest_pain",    emoji: "🫀", key: "complaint_chest"     as const },
  { id: "breathing",     emoji: "😮‍💨", key: "complaint_breathing"  as const },
  { id: "head",          emoji: "🧠", key: "complaint_head"       as const },
  { id: "abdomen",       emoji: "🤢", key: "complaint_abdomen"    as const },
  { id: "injury",        emoji: "🦴", key: "complaint_injury"     as const },
  { id: "fever",         emoji: "🤒", key: "complaint_fever"      as const },
  { id: "allergy",       emoji: "💊", key: "complaint_allergy"    as const },
  { id: "mental",        emoji: "💭", key: "complaint_mental"     as const },
  { id: "nausea",        emoji: "🤮", key: "complaint_nausea"     as const },
  { id: "dizziness",     emoji: "💫", key: "complaint_dizziness"  as const },
  { id: "back_pain",     emoji: "🔙", key: "complaint_back"       as const },
  { id: "skin",          emoji: "🩹", key: "complaint_skin"       as const },
];

const AGE_GROUPS: { value: AgeGroup; keyLabel: "age_under18" | "age_18_40" | "age_41_65" | "age_over65" }[] = [
  { value: "under18",  keyLabel: "age_under18" },
  { value: "18-40",    keyLabel: "age_18_40"   },
  { value: "41-65",    keyLabel: "age_41_65"   },
  { value: "over65",   keyLabel: "age_over65"  },
];

const SEX_OPTIONS: { value: Sex; keyLabel: "sex_male" | "sex_female" | "sex_nonbinary" | "sex_prefer_not" }[] = [
  { value: "male",        keyLabel: "sex_male"        },
  { value: "female",      keyLabel: "sex_female"      },
  { value: "nonbinary",   keyLabel: "sex_nonbinary"   },
  { value: "prefer-not",  keyLabel: "sex_prefer_not"  },
];

const CONDITIONS = [
  { id: "none",         keyLabel: "history_none"         as const },
  { id: "diabetes",     keyLabel: "history_diabetes"     as const },
  { id: "hypertension", keyLabel: "history_hypertension" as const },
  { id: "heart",        keyLabel: "history_heart"        as const },
  { id: "asthma",       keyLabel: "history_asthma"       as const },
  { id: "thinners",     keyLabel: "history_thinners"     as const },
  { id: "cancer",       keyLabel: "history_cancer"       as const },
  { id: "kidney",       keyLabel: "history_kidney"       as const },
  { id: "pregnant",     keyLabel: "history_pregnant"     as const },
];

const ALLERGIES = [
  { id: "none",       keyLabel: "allergy_none"       as const },
  { id: "penicillin", keyLabel: "allergy_penicillin" as const },
  { id: "nsaids",     keyLabel: "allergy_nsaids"     as const },
  { id: "latex",      keyLabel: "allergy_latex"      as const },
  { id: "sulfa",      keyLabel: "allergy_sulfa"      as const },
  { id: "food",       keyLabel: "allergy_food"       as const },
];

// Internal sub-steps within the intake page
const SUB_STEPS = ["complaints", "about", "history"] as const;
type SubStep = typeof SUB_STEPS[number];

export default function IntakePage() {
  const router = useRouter();
  const { setIntake, intake, language } = useKioskStore();

  const [subStep, setSubStep] = useState<SubStep>("complaints");

  // Local form state
  const [complaints, setComplaints] = useState<string[]>(intake?.chiefComplaints ?? []);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(intake?.ageGroup ?? null);
  const [sex, setSex] = useState<Sex>(intake?.sex ?? null);
  const [conditions, setConditions] = useState<string[]>(intake?.conditions ?? []);
  const [allergies, setAllergies] = useState<string[]>(intake?.allergies ?? []);

  const cameraConsent = intake?.cameraConsent ?? false;

  function toggleMulti<T extends string>(
    list: T[],
    setList: (v: T[]) => void,
    id: T,
    exclusiveIds: T[] = []
  ) {
    if (exclusiveIds.includes(id)) {
      setList(list.includes(id) ? [] : [id]);
    } else {
      const filtered = list.filter((x) => !exclusiveIds.includes(x));
      setList(filtered.includes(id)
        ? filtered.filter((x) => x !== id)
        : [...filtered, id]);
    }
  }

  function canAdvanceComplaints() { return complaints.length > 0; }
  function canAdvanceAbout() { return ageGroup !== null && sex !== null; }

  function goNext() {
    if (subStep === "complaints") setSubStep("about");
    else if (subStep === "about") setSubStep("history");
    else finish();
  }

  function finish() {
    setIntake({
      chiefComplaints: complaints,
      chiefComplaintNote: "",
      ageGroup,
      sex,
      conditions,
      allergies,
      cameraConsent,
    });
    router.push("/vitals");
  }

  const subIdx = SUB_STEPS.indexOf(subStep);

  return (
    <KioskShell step={3}>
      {/* h-full flex-col: scrollable middle, sticky nav at bottom */}
      <div className="flex flex-col h-full px-5 py-4 gap-3">

        {/* Sub-step dots */}
        <div className="flex items-center gap-3 justify-center shrink-0">
          {SUB_STEPS.map((s, i) => (
            <div
              key={s}
              className={`transition-all duration-300 rounded-full ${
                i < subIdx ? "w-6 h-2 bg-sky-500" :
                i === subIdx ? "w-8 h-2 bg-sky-400" :
                "w-2 h-2 bg-white/20"
              }`}
            />
          ))}
          <span className="text-xs text-slate-500 ml-2">{subIdx + 1} / {SUB_STEPS.length}</span>
        </div>

        {/* Scrollable content area — takes all middle space */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-2">

          {/* ── Sub-step: Complaints ── */}
          {subStep === "complaints" && (
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">{t(language, "intake_title")}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{t(language, "complaint_title")}</p>
              </div>
              {/* Fixed-height grid cells — 3 rows × 4 cols fits without giant tiles */}
              <div className="grid grid-cols-4 gap-2">
                {COMPLAINT_GRID.map(({ id, emoji, key }) => {
                  const active = complaints.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleMulti(complaints, setComplaints, id)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border transition-all duration-200 active:scale-95 h-[90px] ${
                        active
                          ? "bg-sky-500/20 border-sky-400/60 shadow-sm shadow-sky-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-3xl leading-none">{emoji}</span>
                      <span className={`text-xs font-medium text-center leading-tight px-1 ${active ? "text-sky-300" : "text-slate-300"}`}>
                        {t(language, key)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {complaints.length > 0 && (
                <p className="text-sky-400 text-sm text-center pt-1">{complaints.length} selected</p>
              )}
            </div>
          )}

          {/* ── Sub-step: About ── */}
          {subStep === "about" && (
            <div className="flex flex-col gap-5 max-w-xl mx-auto w-full pt-4">
              <h1 className="text-2xl font-bold text-white text-center">{t(language, "about_title")}</h1>

              {/* Age group */}
              <div>
                <p className="text-slate-400 text-sm mb-2">{t(language, "age_question")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_GROUPS.map(({ value, keyLabel }) => (
                    <button
                      key={value}
                      onClick={() => setAgeGroup(value)}
                      className={`py-5 rounded-2xl border text-base font-semibold transition-all active:scale-95 ${
                        ageGroup === value
                          ? "bg-sky-500/20 border-sky-400/60 text-sky-300"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {t(language, keyLabel)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sex */}
              <div>
                <p className="text-slate-400 text-sm mb-2">{t(language, "sex_question")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {SEX_OPTIONS.map(({ value, keyLabel }) => (
                    <button
                      key={value}
                      onClick={() => setSex(value)}
                      className={`py-5 rounded-2xl border text-base font-semibold transition-all active:scale-95 ${
                        sex === value
                          ? "bg-sky-500/20 border-sky-400/60 text-sky-300"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {t(language, keyLabel)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Sub-step: Medical History ── */}
          {subStep === "history" && (
            <div className="flex flex-col gap-4">
              <h1 className="text-xl font-bold text-white">{t(language, "intake_title")}</h1>

              {/* Conditions */}
              <div>
                <p className="text-slate-400 text-sm mb-2">{t(language, "history_title")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(({ id, keyLabel }) => {
                    const active = conditions.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() =>
                          toggleMulti(conditions, setConditions, id, id === "none" ? [] : ["none"])
                        }
                        className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all active:scale-95 text-left ${
                          active
                            ? "bg-sky-500/20 border-sky-400/60 text-sky-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center ${
                          active ? "bg-sky-500 border-sky-400" : "border-white/30"
                        }`}>
                          {active && <span className="text-white text-xs">✓</span>}
                        </span>
                        {t(language, keyLabel)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <p className="text-slate-400 text-sm mb-2">{t(language, "allergy_title")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGIES.map(({ id, keyLabel }) => {
                    const active = allergies.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() =>
                          toggleMulti(allergies, setAllergies, id, id === "none" ? [] : ["none"])
                        }
                        className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all active:scale-95 text-left ${
                          active
                            ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center ${
                          active ? "bg-amber-500 border-amber-400" : "border-white/30"
                        }`}>
                          {active && <span className="text-white text-xs">✓</span>}
                        </span>
                        {t(language, keyLabel)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation — always visible at bottom */}
        <div className="flex gap-3 pt-1 shrink-0">
          {subStep !== "complaints" && (
            <button
              onClick={() => setSubStep(SUB_STEPS[subIdx - 1])}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-lg transition-all active:scale-95"
            >
              {t(language, "back")}
            </button>
          )}
          <button
            onClick={goNext}
            disabled={
              (subStep === "complaints" && !canAdvanceComplaints()) ||
              (subStep === "about" && !canAdvanceAbout())
            }
            className="flex-1 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-white font-bold text-xl"
          >
            {subStep === "history" ? "Continue to Vitals →" : t(language, "continue")}
          </button>
        </div>
      </div>
    </KioskShell>
  );
}
