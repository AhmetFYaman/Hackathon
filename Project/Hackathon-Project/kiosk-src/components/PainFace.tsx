"use client";

// SVG pain-scale faces (Wong-Baker style). Pure vectors — render identically
// on every device, unlike emoji which need a color-emoji font the Pi lacks.

type Props = {
  level: 0 | 2 | 4 | 6 | 8 | 10;
  color: string;
  className?: string; // size via w-/h- classes
};

export default function PainFace({ level, color, className = "w-10 h-10" }: Props) {
  // Mouth paths per level (face is a 48x48 viewBox, mouth around y=32)
  const mouth: Record<number, string> = {
    0:  "M14 30 Q24 40 34 30",   // big smile
    2:  "M15 31 Q24 37 33 31",   // mild smile
    4:  "M15 33 L33 33",         // neutral
    6:  "M15 35 Q24 30 33 35",   // slight frown
    8:  "M15 37 Q24 29 33 37",   // frown
    10: "M15 38 Q24 29 33 38",   // deep frown (with tears)
  };
  const browed = level >= 8;     // angled brows for severe pain
  const tears = level === 10;

  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="21" stroke={color} strokeWidth="3" />
      {/* Eyes: dots normally, squeezed lines for severe pain */}
      {level >= 8 ? (
        <>
          <path d="M13 21 L20 19" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d="M35 21 L28 19" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="16.5" cy="19" r="2.6" fill={color} />
          <circle cx="31.5" cy="19" r="2.6" fill={color} />
        </>
      )}
      {/* Brows */}
      {browed && (
        <>
          <path d="M12 14 L20 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 14 L28 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      <path d={mouth[level]} stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Tears for worst pain */}
      {tears && (
        <>
          <path d="M14 24 q-2.5 4.5 0 6.5 q2.5 -2 0 -6.5" fill={color} />
          <path d="M34 24 q-2.5 4.5 0 6.5 q2.5 -2 0 -6.5" fill={color} />
        </>
      )}
    </svg>
  );
}
