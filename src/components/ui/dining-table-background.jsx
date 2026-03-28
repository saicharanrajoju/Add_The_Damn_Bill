import { motion } from "motion/react";

// ─── SVG shapes ──────────────────────────────────────────────────────

const CreditCard = ({ color = "#FF6B35", width = 70 }) => {
  const h = Math.round(width * 0.63);
  const isBlue = color.startsWith("#3") || color.startsWith("#4") || color.startsWith("#5") || color.startsWith("#7B");
  const chip = isBlue ? "#2A50CC" : "#C8920A";
  return (
    <svg width={width} height={h} viewBox="0 0 70 44" fill="none">
      <rect width="70" height="44" rx="5" fill={color} />
      <rect x="7" y="13" width="14" height="10" rx="2" fill={chip} opacity="0.9" />
      <rect x="7" y="30" width="20" height="3" rx="1.5" fill="white" opacity="0.5" />
      <rect x="32" y="30" width="12" height="3" rx="1.5" fill="white" opacity="0.5" />
      <path d="M54 22 Q58 18 62 22" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M56 26 Q58 24 60 26" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
      <circle cx="58" cy="29" r="1.2" fill="white" opacity="0.6" />
    </svg>
  );
};

const Plate = ({ size = 70, foodColor = null }) => (
  <svg width={size} height={size} viewBox="0 0 70 70" fill="none">
    <circle cx="35" cy="35" r="32" fill="white" opacity="0.95" />
    <circle cx="35" cy="35" r="32" stroke="rgba(255,140,80,0.3)" strokeWidth="2" />
    <circle cx="35" cy="35" r="22" stroke="rgba(255,140,80,0.2)" strokeWidth="1.5" opacity="0.8" />
    {foodColor && <circle cx="35" cy="35" r="14" fill={foodColor} opacity="0.55" />}
  </svg>
);

const Fork = ({ size = 58 }) => (
  <svg width={Math.round(size * 0.32)} height={size} viewBox="0 0 18 58" fill="none">
    <line x1="9" y1="4" x2="9" y2="54" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="5" y1="4" x2="5" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="13" y1="4" x2="13" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 18 Q9 24 13 18" stroke="white" strokeWidth="2" fill="none" />
  </svg>
);

const Knife = ({ size = 58 }) => (
  <svg width={Math.round(size * 0.28)} height={size} viewBox="0 0 15 58" fill="none">
    <line x1="7.5" y1="28" x2="7.5" y2="56" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M7.5 4 Q13 16 10.5 28 L7.5 28 L7.5 4 Z" fill="white" opacity="0.9" />
  </svg>
);

const MartiniGlass = ({ size = 48, oliveColor = "#50C840" }) => (
  <svg width={size} height={Math.round(size * 1.25)} viewBox="0 0 45 56" fill="none">
    {/* liquid fill inside glass */}
    <path d="M7 10 L22.5 32 L38 10 Z" fill="rgba(160,220,255,0.35)" />
    <path d="M3 6 L22.5 34 L42 6 Z" stroke="white" strokeWidth="2.2" fill="none" />
    <line x1="22.5" y1="34" x2="22.5" y2="50" stroke="white" strokeWidth="2.2" />
    <line x1="13" y1="50" x2="32" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="22.5" cy="18" r="4" fill={oliveColor} />
    <line x1="22.5" y1="9" x2="22.5" y2="15" stroke="#A0B4C0" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TumblerGlass = ({ size = 45, fillColor = "rgba(255,180,40,0.5)", strawColor = "#FF6B35" }) => (
  <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 42 48" fill="none">
    <path d="M7 6 Q5 36 6 44 L36 44 Q37 36 35 6 Z" fill="white" opacity="0.15" />
    <path d="M7 6 Q5 36 6 44 L36 44 Q37 36 35 6 Z" stroke="white" strokeWidth="2.2" fill="none" />
    <path d="M8.5 22 Q8 36 8 44 L34 44 Q34 36 33.5 22 Z" fill={fillColor} />
    <line x1="16" y1="3" x2="20" y2="44" stroke={strawColor} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CardTerminal = ({ size = 65 }) => {
  const w = size;
  const h = Math.round(size * 1.3);
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2];
  return (
    <svg width={w} height={h} viewBox="0 0 65 84" fill="none">
      {/* Receipt */}
      <rect x="23" y="0" width="19" height="18" rx="2" fill="#FFFDF8" />
      <line x1="27" y1="5"  x2="38" y2="5"  stroke="#D4C8BC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="9"  x2="38" y2="9"  stroke="#D4C8BC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="13" x2="38" y2="13" stroke="#D4C8BC" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <rect x="5" y="14" width="55" height="66" rx="8" fill="#E8F0F4" />
      <rect x="5" y="14" width="55" height="66" rx="8" stroke="#C8D8E0" strokeWidth="1" />
      {/* Screen */}
      <rect x="11" y="19" width="43" height="28" rx="4" fill="#DDEEF8" />
      {/* Eyes */}
      <circle cx="25" cy="29" r="3.5" fill="#5A7A8C" />
      <circle cx="40" cy="29" r="3.5" fill="#5A7A8C" />
      {/* Sad mouth */}
      <path d="M22 40 Q32.5 35 43 40" stroke="#5A7A8C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Keypad */}
      {rows.map(r =>
        cols.map(c => (
          <rect
            key={`${r}-${c}`}
            x={13 + c * 14}
            y={54 + r * 7}
            width="10" height="4" rx="1.5"
            fill="#A8C0CC" opacity="0.7"
          />
        ))
      )}
    </svg>
  );
};

// ─── Element definitions ──────────────────────────────────────────────

const ELEMENTS = [
  // Top-left
  { type: "card",     x: 5,  y: 4,  rotate: -28, color: "#FF6B35", size: 68, floatY: 12, floatR: 3,  delay: 0   },
  { type: "plate",    x: 1,  y: 10, rotate: 0,   size: 75, foodColor: "#FF9060", floatY: 9,  floatR: 2,  delay: 0.5 },
  // Top-center
  { type: "card",     x: 47, y: 1,  rotate: 12,  color: "#4A80F0", size: 62, floatY: 11, floatR: -3, delay: 1.5 },
  // Top-right
  { type: "plate",    x: 80, y: 1,  rotate: 0,   size: 78, foodColor: "#C8E870",  floatY: 8,  floatR: -2, delay: 0.8 },
  { type: "glass",    x: 91, y: 2,  rotate: 6,   glassType: "martini", oliveColor: "#50C840", size: 46, floatY: 13, floatR: 4,  delay: 2.2 },
  { type: "card",     x: 84, y: 9,  rotate: 14,  color: "#FF4560", size: 64, floatY: 10, floatR: -4, delay: 2.8 },
  // Left side
  { type: "card",     x: 1,  y: 36, rotate: 22,  color: "#C050F0", size: 70, floatY: 14, floatR: -3, delay: 1   },
  { type: "glass",    x: 2,  y: 55, rotate: -4,  glassType: "tumbler", fillColor: "rgba(255,180,40,0.55)", strawColor: "#FF4560", size: 44, floatY: 9, floatR: 2, delay: 0.5 },
  { type: "fork",     x: 9,  y: 46, rotate: -40, size: 58,          floatY: 10, floatR: 5,  delay: 1.8 },
  // Right side
  { type: "card",     x: 83, y: 33, rotate: -18, color: "#FF6B35", size: 72, floatY: 11, floatR: -5, delay: 2.5 },
  { type: "knife",    x: 91, y: 50, rotate: 38,  size: 55,          floatY: 8,  floatR: 3,  delay: 0.3 },
  { type: "glass",    x: 85, y: 63, rotate: 5,   glassType: "martini", oliveColor: "#FF6B35", size: 44, floatY: 12, floatR: -3, delay: 3.4 },
  // Bottom-left
  { type: "plate",    x: 2,  y: 76, rotate: 0,   size: 82, foodColor: "#F05080",  floatY: 9,  floatR: 2,  delay: 3   },
  { type: "glass",    x: 11, y: 88, rotate: 2,   glassType: "tumbler", fillColor: "rgba(80,200,120,0.5)", strawColor: "#4A80F0", size: 40, floatY: 10, floatR: -4, delay: 1.3 },
  { type: "card",     x: 20, y: 82, rotate: -8,  color: "#40C0F0", size: 62, floatY: 13, floatR: 3,  delay: 3.8 },
  // Bottom-center
  { type: "fork",     x: 44, y: 91, rotate: 12,  size: 56,          floatY: 11, floatR: -4, delay: 2.8 },
  { type: "knife",    x: 55, y: 93, rotate: -8,  size: 52,          floatY: 8,  floatR: 5,  delay: 0.9 },
  // Bottom-right
  { type: "plate",    x: 80, y: 77, rotate: 0,   size: 80, foodColor: "#80D060",  floatY: 10, floatR: -2, delay: 2   },
  { type: "card",     x: 72, y: 88, rotate: 20,  color: "#FF4560", size: 66, floatY: 12, floatR: -5, delay: 1.7 },
  // Extra scattered
  { type: "fork",     x: 79, y: 20, rotate: -22, size: 50,          floatY: 9,  floatR: 4,  delay: 3.5 },
  { type: "card",     x: 67, y: 4,  rotate: -5,  color: "#A040F0", size: 58, floatY: 11, floatR: -3, delay: 0.4 },
  { type: "knife",    x: 24, y: 5,  rotate: 30,  size: 52,          floatY: 10, floatR: 5,  delay: 2   },
  // Center card terminal
  { type: "terminal", x: 44, y: 40, rotate: -4,  size: 68,          floatY: 6,  floatR: 2,  delay: 0   },
];

// ─── Main component ───────────────────────────────────────────────────

export default function DiningTableBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: "#FF8C5A" }}
    >
      {/* Vibrant gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 15% 20%, rgba(255,220,60,0.45) 0%, transparent 65%), radial-gradient(ellipse 60% 55% at 85% 75%, rgba(255,50,80,0.35) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 80% 10%, rgba(60,200,120,0.3) 0%, transparent 55%)",
        }}
      />
      {/* Paper grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "220px 220px",
        }}
      />

      {/* Floating elements */}
      {ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ left: `${el.x}%`, top: `${el.y}%`, opacity: 0.92 }}
          initial={{ rotate: el.rotate }}
          animate={{
            y: [0, -el.floatY, 0],
            rotate: [el.rotate, el.rotate + el.floatR, el.rotate],
          }}
          transition={{
            duration: 3.8 + (el.delay % 2.5),
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {el.type === "card"     && <CreditCard color={el.color} width={el.size} />}
          {el.type === "plate"    && <Plate size={el.size} foodColor={el.foodColor} />}
          {el.type === "fork"     && <Fork size={el.size} />}
          {el.type === "knife"    && <Knife size={el.size} />}
          {el.type === "glass"    && el.glassType === "martini" && <MartiniGlass size={el.size} oliveColor={el.oliveColor} />}
          {el.type === "glass"    && el.glassType === "tumbler" && <TumblerGlass size={el.size} fillColor={el.fillColor} strawColor={el.strawColor} />}
          {el.type === "terminal" && <CardTerminal size={el.size} />}
        </motion.div>
      ))}
    </div>
  );
}
