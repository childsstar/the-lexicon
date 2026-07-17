// Hand-crafted SVG plates — one atmospheric scene per banner, following each
// banner's imagePrompt art direction. All original artwork: environments and
// mood only, no characters, no publisher IP.
//
// These are deliberately swappable: when AI-rendered raster plates exist
// (see TODO(ai-images) in lib/chronicle/generate.ts), drop a .webp per
// banner id and BannerArt can prefer it over the SVG. Until then the SVGs
// carry the reveal — and their micro-animations (drifting spores, candle
// flicker, lightning) are the first step toward fully animated plates.

type PlateProps = { className?: string };

function Svg({
  className,
  children,
}: PlateProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

function Stars({
  seed = 1,
  count = 26,
  color = "#e8e4d8",
  maxY = 260,
}: {
  seed?: number;
  count?: number;
  color?: string;
  maxY?: number;
}) {
  // Deterministic pseudo-random star field (no hydration mismatch).
  const stars = Array.from({ length: count }, (_, i) => {
    const a = Math.sin(seed * 997 + i * 131) * 10000;
    const b = Math.sin(seed * 313 + i * 719) * 10000;
    return {
      x: Math.abs(a - Math.floor(a)) * 400,
      y: Math.abs(b - Math.floor(b)) * maxY,
      r: 0.6 + Math.abs(Math.sin(i * 7.3)) * 1.1,
      delay: (i % 7) * 0.5,
    };
  });
  return (
    <g>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={color}
          className={i % 3 === 0 ? "anim-twinkle" : undefined}
          style={i % 3 === 0 ? { animationDelay: `${s.delay}s` } : undefined}
          opacity={0.7}
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The Shield Unbroken — marble bastion at dawn, storm breaking        */
/* ------------------------------------------------------------------ */
function ShieldUnbroken({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="su-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1425" />
          <stop offset="0.55" stopColor="#27405f" />
          <stop offset="0.78" stopColor="#8a6a3f" />
          <stop offset="1" stopColor="#d4ac62" />
        </linearGradient>
        <radialGradient id="su-sun" cx="0.5" cy="0.72" r="0.5">
          <stop offset="0" stopColor="#f0d898" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f0d898" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#su-sky)" />
      <ellipse cx="200" cy="360" rx="220" ry="130" fill="url(#su-sun)" />
      {/* storm clouds */}
      <ellipse cx="60" cy="90" rx="150" ry="48" fill="#0a1120" opacity="0.85" />
      <ellipse cx="340" cy="60" rx="170" ry="55" fill="#0a1120" opacity="0.9" />
      <ellipse cx="260" cy="130" rx="120" ry="34" fill="#122036" opacity="0.7" />
      {/* bastion on the cliff */}
      <g fill="#0b1322">
        <path d="M0 500 L0 400 L90 380 L120 300 L132 300 L132 250 L150 250 L150 300 L165 300 L165 330 L235 330 L235 300 L250 300 L250 240 L256 226 L262 240 L262 300 L280 300 L305 380 L400 405 L400 500 Z" />
      </g>
      {/* lit windows */}
      <g fill="#e8c479" className="anim-flicker">
        <rect x="140" y="272" width="4" height="8" />
        <rect x="253" y="262" width="4" height="8" />
        <rect x="196" y="342" width="5" height="9" />
      </g>
      {/* banner streaming from the keep */}
      <path
        d="M256 226 L256 196 Q276 200 262 208 Q280 212 258 220 Z"
        fill="#1e3a5f"
      />
      {/* embers rising from below */}
      <g fill="#e8a05f">
        {[70, 150, 320, 360].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={470}
            r={1.8}
            className="anim-drift"
            style={{ animationDelay: `${i * 1.7}s` }}
          />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Burning Faith — ruined cathedral, thousand candles              */
/* ------------------------------------------------------------------ */
function BurningFaith({ className }: PlateProps) {
  const candles = [
    [60, 430], [95, 445], [130, 425], [170, 448], [205, 430],
    [240, 447], [275, 428], [315, 442], [350, 430], [45, 460],
    [145, 465], [255, 462], [340, 465], [190, 470],
  ] as const;
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="bf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120607" />
          <stop offset="0.6" stopColor="#3a1112" />
          <stop offset="1" stopColor="#5f1e1e" />
        </linearGradient>
        <radialGradient id="bf-glow" cx="0.5" cy="0.9" r="0.75">
          <stop offset="0" stopColor="#e8a05f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e8a05f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#bf-bg)" />
      {/* broken rose window */}
      <circle cx="200" cy="150" r="58" fill="none" stroke="#7a3a2a" strokeWidth="7" opacity="0.8" />
      <g stroke="#7a3a2a" strokeWidth="4" opacity="0.7">
        <path d="M200 92 V208 M142 150 H258 M159 109 L241 191 M241 109 L159 191" />
      </g>
      <path d="M200 150 L258 150 A58 58 0 0 1 200 208 Z" fill="#e5c988" opacity="0.16" />
      {/* arch silhouettes */}
      <g fill="#160708">
        <path d="M0 500 V260 Q45 170 90 260 V500 Z" />
        <path d="M310 500 V260 Q355 170 400 260 V500 Z" />
        <path d="M118 500 V300 Q142 240 166 300 V500 Z" opacity="0.85" />
        <path d="M234 500 V300 Q258 240 282 300 V500 Z" opacity="0.85" />
      </g>
      {/* incense shafts */}
      <path d="M180 60 L150 500 L250 500 L220 60 Z" fill="#e5c988" opacity="0.06" />
      <ellipse cx="200" cy="470" rx="230" ry="110" fill="url(#bf-glow)" />
      {/* candles */}
      <g>
        {candles.map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 1.5} y={y} width="3" height="9" fill="#d8c9a8" opacity="0.85" />
            <circle
              cx={x}
              cy={y - 3}
              r="2.4"
              fill="#f0d898"
              className="anim-flicker"
              style={{ animationDelay: `${(i % 5) * 0.6}s` }}
            />
            <circle cx={x} cy={y - 3} r="7" fill="#e8a05f" opacity="0.18" />
          </g>
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Endless Hunger — alien jungle beneath twin moons                */
/* ------------------------------------------------------------------ */
function EndlessHunger({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="eh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0716" />
          <stop offset="0.6" stopColor="#2a1445" />
          <stop offset="1" stopColor="#123024" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#eh-sky)" />
      <Stars seed={4} count={20} color="#cdb8f0" maxY={200} />
      {/* twin moons */}
      <circle cx="120" cy="95" r="34" fill="#e0d2f5" opacity="0.9" />
      <circle cx="110" cy="88" r="34" fill="#0d0716" opacity="0.25" />
      <circle cx="255" cy="60" r="16" fill="#9adfb8" opacity="0.85" />
      {/* mist */}
      <ellipse cx="200" cy="330" rx="240" ry="60" fill="#3d1e5f" opacity="0.35" />
      {/* organic spires */}
      <g fill="#0a1410">
        <path d="M40 500 C30 380 55 330 48 250 C46 230 62 230 60 250 C56 330 82 380 76 500 Z" />
        <path d="M330 500 C320 350 350 300 342 210 C340 188 358 188 356 210 C350 300 378 350 372 500 Z" />
        <path d="M0 500 L0 420 C40 430 60 460 70 500 Z" />
      </g>
      <g fill="#0e1c14">
        <path d="M150 500 C138 400 170 370 160 290 C158 270 176 270 174 290 C166 370 196 400 190 500 Z" />
        <path d="M255 500 C245 420 270 395 262 330 C260 312 276 312 274 330 C268 395 292 420 286 500 Z" />
        {/* fronds */}
        <path d="M160 290 Q120 260 96 272 Q130 282 158 300 Z" />
        <path d="M262 330 Q300 300 326 310 Q294 322 266 340 Z" />
      </g>
      {/* bioluminescent nodes */}
      <g fill="#7ee08a">
        <circle cx="58" cy="252" r="3.5" className="anim-twinkle" />
        <circle cx="166" cy="292" r="3" className="anim-twinkle" style={{ animationDelay: "1.1s" }} />
        <circle cx="349" cy="212" r="3.5" className="anim-twinkle" style={{ animationDelay: "2s" }} />
        <circle cx="268" cy="332" r="2.6" className="anim-twinkle" style={{ animationDelay: "0.6s" }} />
      </g>
      {/* drifting spores */}
      <g fill="#a58ae0">
        {[90, 200, 300, 140, 250].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={460 - (i % 3) * 40}
            r={i % 2 ? 1.6 : 2.2}
            className="anim-drift"
            style={{ animationDelay: `${i * 1.4}s` }}
          />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Deathless Crown — desert monoliths, emerald circuitry           */
/* ------------------------------------------------------------------ */
function DeathlessCrown({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="dc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02070a" />
          <stop offset="0.7" stopColor="#0a1a16" />
          <stop offset="1" stopColor="#1a2a20" />
        </linearGradient>
        <linearGradient id="dc-dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15221c" />
          <stop offset="1" stopColor="#0a120e" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#dc-sky)" />
      <Stars seed={9} count={34} color="#bfe8d4" maxY={280} />
      {/* dunes */}
      <path d="M0 500 V400 Q120 360 220 405 T400 390 V500 Z" fill="url(#dc-dune)" />
      <path d="M0 500 V445 Q150 415 280 452 T400 440 V500 Z" fill="#060c09" />
      {/* monoliths */}
      <g fill="#040a07">
        <path d="M96 408 L110 180 L146 180 L160 408 Z" />
        <path d="M250 400 L260 240 L292 240 L302 400 Z" />
        <path d="M340 435 L346 330 L368 330 L374 435 Z" />
        <path d="M30 428 L36 350 L54 350 L60 428 Z" />
      </g>
      {/* carved circuitry */}
      <g stroke="#3de8a0" strokeWidth="1.6" fill="none" opacity="0.9">
        <path className="anim-flicker" d="M128 200 V250 H120 V300 H134 V370" />
        <path
          className="anim-flicker"
          style={{ animationDelay: "1.3s" }}
          d="M274 258 V300 H266 V340 H280 V385"
        />
        <path
          className="anim-flicker"
          style={{ animationDelay: "2.2s" }}
          d="M356 344 V380 H350 V420"
        />
      </g>
      <g fill="#3de8a0">
        <circle cx="128" cy="196" r="2.6" className="anim-twinkle" />
        <circle cx="274" cy="254" r="2.4" className="anim-twinkle" style={{ animationDelay: "1s" }} />
      </g>
      {/* green horizon haze */}
      <ellipse cx="200" cy="410" rx="240" ry="40" fill="#3de8a0" opacity="0.06" />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Roaring Horde — scrap totems, smoke-red sunset, sparks          */
/* ------------------------------------------------------------------ */
function RoaringHorde({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="rh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0b05" />
          <stop offset="0.55" stopColor="#5f2a14" />
          <stop offset="0.85" stopColor="#a85a24" />
          <stop offset="1" stopColor="#c9762e" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#rh-sky)" />
      {/* huge low sun */}
      <circle cx="205" cy="330" r="85" fill="#e8a05f" opacity="0.85" />
      <circle cx="205" cy="330" r="115" fill="#e8a05f" opacity="0.18" />
      {/* smoke banks */}
      <ellipse cx="80" cy="130" rx="140" ry="45" fill="#140a05" opacity="0.8" />
      <ellipse cx="330" cy="95" rx="150" ry="50" fill="#140a05" opacity="0.85" />
      {/* scrap totems */}
      <g fill="#120803">
        <path d="M60 500 L66 340 L52 336 L70 322 L58 310 L82 306 L74 290 L96 298 L92 320 L104 330 L88 342 L94 500 Z" />
        <path d="M300 500 L306 300 L288 294 L310 280 L298 262 L326 268 L322 244 L342 262 L330 284 L348 294 L326 304 L334 500 Z" />
        {/* patchwork banner pole */}
        <path d="M180 500 L184 380 L178 378 L186 372 L182 250 L190 250 L188 372 L212 380 L188 386 L192 500 Z" />
      </g>
      <path d="M190 252 L190 274 L234 268 L214 262 L232 256 Z" fill="#5f1e1e" />
      {/* bonfire glow + sparks */}
      <ellipse cx="130" cy="480" rx="70" ry="22" fill="#e8a05f" opacity="0.35" />
      <g fill="#f0c078">
        {[112, 128, 146, 260, 282].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={472}
            r={i % 2 ? 1.6 : 2.4}
            className="anim-drift"
            style={{ animationDelay: `${i * 1.1}s` }}
          />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Veiled Path — glass spires adrift in a sea of stars             */
/* ------------------------------------------------------------------ */
function VeiledPath({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="vp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b16" />
          <stop offset="1" stopColor="#1c2440" />
        </linearGradient>
        <linearGradient id="vp-aurora" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7ec9c0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#9ab8f0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#c9a0d8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="vp-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d8f0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#2e3a5f" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#vp-sky)" />
      <Stars seed={2} count={40} color="#dce6f5" maxY={480} />
      <path d="M-20 210 Q120 120 240 190 T420 150 L420 230 Q260 280 140 240 T-20 290 Z" fill="url(#vp-aurora)" className="anim-flicker" style={{ animationDuration: "9s" }} />
      {/* drifting crystalline spires */}
      <g>
        <path d="M120 470 L140 190 L152 160 L164 190 L184 470 Z" fill="url(#vp-glass)" opacity="0.95" />
        <path d="M152 160 L152 470 L184 470 L164 190 Z" fill="#8fa8d8" opacity="0.5" />
        <path d="M235 430 L248 260 L256 240 L264 260 L277 430 Z" fill="url(#vp-glass)" opacity="0.8" />
        <path d="M60 400 L68 300 L73 288 L78 300 L86 400 Z" fill="url(#vp-glass)" opacity="0.6" />
        <path d="M320 390 L330 280 L336 266 L342 280 L352 390 Z" fill="url(#vp-glass)" opacity="0.7" />
      </g>
      {/* the silver-thin path only you can see */}
      <path
        d="M0 480 Q140 430 200 380 T400 300"
        fill="none"
        stroke="#e8eef8"
        strokeWidth="1.2"
        strokeDasharray="6 10"
        opacity="0.55"
        className="anim-flicker"
        style={{ animationDelay: "2s", animationDuration: "6s" }}
      />
      <circle cx="152" cy="152" r="3" fill="#e8eef8" className="anim-twinkle" />
      <circle cx="256" cy="234" r="2.4" fill="#e8eef8" className="anim-twinkle" style={{ animationDelay: "1.4s" }} />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Verdant Wrath — ancient forest waking at green dawn             */
/* ------------------------------------------------------------------ */
function VerdantWrath({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="vw-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1a10" />
          <stop offset="0.55" stopColor="#1e4a2e" />
          <stop offset="1" stopColor="#0a1a10" />
        </linearGradient>
        <radialGradient id="vw-dawn" cx="0.5" cy="0.42" r="0.5">
          <stop offset="0" stopColor="#c8e89a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c8e89a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#vw-bg)" />
      <ellipse cx="200" cy="210" rx="160" ry="150" fill="url(#vw-dawn)" />
      {/* light shafts */}
      <g fill="#d8f0b0" opacity="0.1">
        <path d="M150 0 L110 500 L170 500 L196 0 Z" />
        <path d="M260 0 L240 500 L290 500 L296 0 Z" />
      </g>
      {/* canopy masses */}
      <g fill="#0c2415">
        <ellipse cx="30" cy="40" rx="150" ry="70" />
        <ellipse cx="370" cy="60" rx="160" ry="80" />
        <ellipse cx="180" cy="-10" rx="130" ry="60" />
      </g>
      <g fill="#143521" opacity="0.9">
        <ellipse cx="80" cy="95" rx="90" ry="34" />
        <ellipse cx="330" cy="120" rx="100" ry="38" />
      </g>
      {/* colossal trunks */}
      <g fill="#07130b">
        <path d="M-10 500 L4 120 Q10 60 30 20 L44 20 Q30 80 40 140 L58 500 Z" />
        <path d="M340 500 L350 160 Q354 90 378 30 L394 30 Q378 100 386 170 L400 500 Z" />
        <path d="M150 500 L158 240 Q160 190 172 150 L184 150 Q174 200 180 250 L196 500 Z" />
        {/* branch reaching from the left trunk */}
        <path d="M36 180 Q90 150 128 158 Q92 168 44 196 Z" />
        <path d="M352 210 Q300 184 262 192 Q298 202 348 226 Z" />
      </g>
      {/* root swells */}
      <path d="M0 500 Q60 470 130 492 T290 480 T400 492 V500 Z" fill="#050d08" />
      {/* moss highlights on trunks */}
      <g fill="#3d6a42" opacity="0.8">
        <path d="M10 300 Q22 296 34 302 L32 316 Q18 310 12 314 Z" />
        <path d="M356 260 Q368 256 382 262 L380 276 Q366 270 358 274 Z" />
        <path d="M164 320 Q172 316 184 322 L182 334 Q170 328 166 332 Z" />
      </g>
      {/* golden spirit-lights between the roots */}
      <g fill="#f0d878">
        {[
          [70, 430, 0], [110, 452, 1.2], [225, 440, 2.1], [265, 458, 0.7],
          [320, 436, 1.7], [180, 462, 2.8],
        ].map(([x, y, d]) => (
          <circle
            key={`${x}`}
            cx={x}
            cy={y}
            r="2.6"
            className="anim-twinkle"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </g>
      {/* drifting seeds */}
      <g fill="#c8e89a">
        {[95, 210, 305].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={400}
            r="1.8"
            className="anim-drift"
            style={{ animationDelay: `${i * 2.3}s` }}
          />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Storm's Herald — lightning over a mountain temple               */
/* ------------------------------------------------------------------ */
function StormsHerald({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0d1d" />
          <stop offset="0.65" stopColor="#242a52" />
          <stop offset="1" stopColor="#3a3468" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#sh-sky)" />
      <Stars seed={6} count={16} color="#d8def0" maxY={140} />
      {/* faint standing bolt so stills read; the flash brightens it */}
      <path
        d="M208 0 L186 120 L212 118 L172 240 L204 232 L182 320"
        fill="none"
        stroke="#cdd4f0"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <ellipse cx="190" cy="180" rx="140" ry="130" fill="#9ab8f0" opacity="0.07" />
      {/* the bolt */}
      <g className="anim-bolt">
        <path
          d="M208 0 L186 120 L212 118 L172 240 L204 232 L182 320"
          fill="none"
          stroke="#f0e6b8"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M208 0 L186 120 L212 118 L172 240 L204 232 L182 320"
          fill="none"
          stroke="#f0d878"
          strokeWidth="10"
          opacity="0.25"
        />
        <ellipse cx="190" cy="200" rx="180" ry="160" fill="#9ab8f0" opacity="0.12" />
      </g>
      {/* mountain */}
      <path d="M0 500 L60 400 L120 300 L182 322 L250 290 L320 380 L400 500 Z" fill="#0b0e1e" />
      {/* temple + colossal stair */}
      <g fill="#131736">
        <path d="M158 322 L166 292 L214 292 L222 322 Z" />
        <rect x="170" y="268" width="40" height="26" />
        <path d="M166 268 L190 248 L214 268 Z" />
        <path d="M140 500 L160 322 L220 322 L240 500 Z" opacity="0.9" />
      </g>
      <g stroke="#f0d878" strokeWidth="1.4" opacity="0.85">
        <path d="M175 280 h30" className="anim-flicker" />
        <path d="M180 306 h20" className="anim-flicker" style={{ animationDelay: "1s" }} />
      </g>
      {/* cloud sea below */}
      <g fill="#494f80" opacity="0.85">
        <ellipse cx="60" cy="470" rx="120" ry="36" />
        <ellipse cx="230" cy="488" rx="150" ry="40" />
        <ellipse cx="370" cy="468" rx="110" ry="34" />
      </g>
      <g fill="#5d64a0" opacity="0.6">
        <ellipse cx="140" cy="455" rx="90" ry="24" />
        <ellipse cx="320" cy="450" rx="80" ry="20" />
      </g>
      {/* rain frozen mid-fall */}
      <g stroke="#9ab8f0" strokeWidth="1" opacity="0.35">
        {[40, 90, 280, 350, 385].map((x, i) => (
          <path key={x} d={`M${x} ${90 + i * 40} l-4 16`} />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Iron Oath — forge-halls beneath a mountain of ice               */
/* ------------------------------------------------------------------ */
function IronOath({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="io-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0e14" />
          <stop offset="1" stopColor="#1c1410" />
        </linearGradient>
        <linearGradient id="io-aurora" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7ee08a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#7ec9c0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7ee08a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="io-melt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c078" />
          <stop offset="1" stopColor="#c25635" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#io-bg)" />
      {/* distant cavern mouth with aurora */}
      <path d="M150 40 Q200 -10 250 40 L250 150 L150 150 Z" fill="#101c2a" />
      <path d="M150 55 Q200 8 250 55 L250 90 L150 90 Z" fill="url(#io-aurora)" className="anim-flicker" style={{ animationDuration: "8s" }} />
      <Stars seed={12} count={8} color="#bcd8e8" maxY={70} />
      {/* cavern frame */}
      <path d="M0 0 H400 V500 H0 Z M150 40 Q200 -10 250 40 L258 500 L142 500 Z" fill="#08090d" fillRule="evenodd" />
      {/* stone pillars */}
      <g fill="#12141c">
        <path d="M60 500 V120 L92 100 L124 120 V500 Z" />
        <path d="M276 500 V120 L308 100 L340 120 V500 Z" />
      </g>
      <g stroke="#2a2e3d" strokeWidth="3">
        <path d="M60 180 h64 M60 320 h64 M276 180 h64 M276 320 h64" />
      </g>
      {/* molten river */}
      <path
        d="M142 500 L150 400 Q200 380 250 400 L258 500 Q200 480 142 500 Z"
        fill="url(#io-melt)"
        opacity="0.9"
      />
      <path d="M165 448 Q200 438 235 448" stroke="#f8e0a8" strokeWidth="2" fill="none" className="anim-flicker" />
      {/* forge glow on pillars */}
      <path d="M124 500 V300 L142 320 V500 Z" fill="#c25635" opacity="0.25" />
      <path d="M276 500 V300 L258 320 V500 Z" fill="#c25635" opacity="0.25" />
      {/* rising embers */}
      <g fill="#f0c078">
        {[170, 200, 232].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={430}
            r={1.8}
            className="anim-drift"
            style={{ animationDelay: `${i * 2.1}s` }}
          />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Machine Communion — forge-city under a rust sky                 */
/* ------------------------------------------------------------------ */
function MachineCommunion({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="mc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#170808" />
          <stop offset="0.7" stopColor="#4a1a12" />
          <stop offset="1" stopColor="#6a2a16" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#mc-sky)" />
      {/* smog */}
      <ellipse cx="120" cy="110" rx="160" ry="40" fill="#100505" opacity="0.7" />
      <ellipse cx="330" cy="70" rx="140" ry="45" fill="#100505" opacity="0.75" />
      {/* cog sun */}
      <g opacity="0.5">
        <circle cx="300" cy="170" r="36" fill="#c9762e" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <rect
              key={i}
              x={300 + Math.cos(a) * 40 - 4}
              y={170 + Math.sin(a) * 40 - 4}
              width="8"
              height="8"
              fill="#c9762e"
              transform={`rotate(${(a * 180) / Math.PI} ${300 + Math.cos(a) * 40} ${170 + Math.sin(a) * 40})`}
            />
          );
        })}
        <circle cx="300" cy="170" r="14" fill="#170808" />
      </g>
      {/* industrial skyline */}
      <g fill="#0e0606">
        <path d="M0 500 V300 H30 V260 H44 V300 H60 V330 H90 V240 L104 220 L118 240 V330 H140 V500 Z" />
        <path d="M140 500 V280 H160 V210 H172 L176 190 L180 210 H192 V280 H212 V500 Z" />
        <path d="M212 500 V340 H250 V300 H270 V340 H300 V270 H330 V340 H360 V310 H380 V500 Z" />
      </g>
      {/* pipes */}
      <g stroke="#1c0d0a" strokeWidth="8" fill="none">
        <path d="M0 420 H140 M212 400 H400 M60 330 V420 M330 340 V400" />
      </g>
      {/* data-lights */}
      <g fill="#7ec9c0">
        {[
          [104, 250, 0], [176, 220, 0.8], [270, 312, 1.6], [330, 282, 2.4], [37, 274, 1.2],
        ].map(([x, y, d]) => (
          <rect
            key={`${x}-${y}`}
            x={x - 2}
            y={y}
            width="4"
            height="4"
            className="anim-twinkle"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </g>
      {/* steam columns */}
      <g fill="#d8c9b8" opacity="0.5">
        {[75, 186, 345].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={230}
            r={6}
            className="anim-drift"
            style={{ animationDelay: `${i * 2.6}s`, animationDuration: "10s" }}
          />
        ))}
      </g>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Midnight Court — moonlit manor above a sea of mist              */
/* ------------------------------------------------------------------ */
function MidnightCourt({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="mcqt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#090914" />
          <stop offset="1" stopColor="#232038" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#mcqt-sky)" />
      <Stars seed={7} count={24} color="#d8d2e8" maxY={220} />
      {/* moon */}
      <circle cx="310" cy="90" r="42" fill="#e8e2f0" />
      <circle cx="298" cy="82" r="7" fill="#c9c2d8" opacity="0.7" />
      <circle cx="322" cy="104" r="5" fill="#c9c2d8" opacity="0.6" />
      <circle cx="310" cy="90" r="60" fill="#e8e2f0" opacity="0.12" />
      {/* crag */}
      <path d="M60 500 L90 330 L140 300 L250 300 L310 340 L340 500 Z" fill="#0b0a14" />
      {/* manor */}
      <g fill="#100e1d">
        <rect x="130" y="220" width="140" height="86" />
        <path d="M124 220 L200 176 L276 220 Z" />
        <rect x="112" y="176" width="26" height="130" />
        <path d="M108 176 L125 148 L142 176 Z" />
        <rect x="262" y="176" width="26" height="130" />
        <path d="M258 176 L275 148 L292 176 Z" />
        <rect x="192" y="140" width="16" height="80" />
        <path d="M188 140 L200 118 L212 140 Z" />
      </g>
      {/* candlelit windows */}
      <g fill="#e8b878">
        {[
          [150, 244, 0], [176, 244, 1.1], [224, 244, 0.4], [250, 244, 1.8],
          [122, 210, 0.7], [272, 210, 2.2], [197, 165, 1.4],
        ].map(([x, y, d]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="7"
            height="12"
            className="anim-flicker"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </g>
      {/* iron gate + roses */}
      <g stroke="#0b0a14" strokeWidth="3">
        <path d="M180 500 V440 M200 500 V432 M220 500 V440" />
        <path d="M172 452 H228" />
      </g>
      <circle cx="176" cy="452" r="4" fill="#5f2438" />
      <circle cx="224" cy="452" r="4" fill="#5f2438" />
      {/* sea of mist */}
      <g fill="#3a3454">
        <ellipse cx="80" cy="480" rx="140" ry="34" opacity="0.8" />
        <ellipse cx="260" cy="492" rx="170" ry="38" opacity="0.85" />
        <ellipse cx="390" cy="470" rx="120" ry="30" opacity="0.7" />
      </g>
      <ellipse cx="180" cy="462" rx="120" ry="22" fill="#4a4468" opacity="0.5" />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* The Cracked Moon — glowing mushroom cavern                          */
/* ------------------------------------------------------------------ */
function CrackedMoon({ className }: PlateProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="cm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0714" />
          <stop offset="1" stopColor="#1c1430" />
        </linearGradient>
        <radialGradient id="cm-cap" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#8ae0d4" />
          <stop offset="1" stopColor="#3d5f8a" />
        </radialGradient>
        <radialGradient id="cm-cap2" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#c9a0d8" />
          <stop offset="1" stopColor="#4a3d7a" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#cm-bg)" />
      {/* cavern ceiling */}
      <path d="M0 0 H400 V70 L340 52 L300 78 L250 48 L210 74 L150 50 L100 80 L48 56 L0 76 Z" fill="#060410" />
      {/* the crack + moonbeam */}
      <path d="M196 0 L204 26 L198 48 L210 52 L206 0 Z" fill="#e8e2f0" className="anim-flicker" style={{ animationDuration: "7s" }} />
      <path d="M198 48 L150 500 L280 500 L210 52 Z" fill="#e8e2f0" opacity="0.07" />
      {/* giant mushrooms */}
      <g>
        {/* left large */}
        <path d="M84 500 C78 420 88 380 84 328 L112 328 C106 380 116 420 112 500 Z" fill="#332a52" />
        <path d="M84 500 C78 420 88 380 84 328 L96 328 C92 380 98 420 96 500 Z" fill="#453a68" />
        <ellipse cx="98" cy="322" rx="62" ry="30" fill="url(#cm-cap)" />
        <ellipse cx="98" cy="330" rx="62" ry="14" fill="#0a0714" opacity="0.4" />
        {/* right tall */}
        <path d="M295 500 C289 390 299 340 294 266 L320 266 C314 340 322 390 319 500 Z" fill="#332a52" />
        <path d="M295 500 C289 390 299 340 294 266 L306 266 C301 340 308 390 306 500 Z" fill="#453a68" />
        <ellipse cx="307" cy="260" rx="52" ry="26" fill="url(#cm-cap2)" />
        <ellipse cx="307" cy="268" rx="52" ry="12" fill="#0a0714" opacity="0.4" />
        {/* small cluster */}
        <path d="M178 500 C175 460 181 440 178 412 L194 412 C190 440 196 460 194 500 Z" fill="#332a52" />
        <ellipse cx="185" cy="410" rx="26" ry="13" fill="url(#cm-cap)" opacity="0.9" />
        <path d="M243 500 C241 470 246 458 243 438 L256 438 C253 458 258 470 256 500 Z" fill="#332a52" />
        <ellipse cx="249" cy="436" rx="18" ry="9" fill="url(#cm-cap2)" opacity="0.85" />
      </g>
      {/* cavern floor to root the stems */}
      <path d="M0 500 Q100 484 200 490 T400 482 V500 Z" fill="#0f0b1e" />
      {/* gill glow */}
      <g className="anim-flicker">
        <ellipse cx="98" cy="334" rx="44" ry="8" fill="#8ae0d4" opacity="0.3" />
        <ellipse cx="307" cy="271" rx="36" ry="7" fill="#c9a0d8" opacity="0.3" />
      </g>
      {/* spore motes */}
      <g fill="#8ae0d4">
        {[70, 130, 220, 290, 350].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={470 - (i % 2) * 30}
            r={i % 2 ? 1.5 : 2}
            className="anim-drift"
            style={{ animationDelay: `${i * 1.6}s` }}
          />
        ))}
      </g>
      {/* winding path */}
      <path d="M0 496 Q120 470 200 480 T400 452" stroke="#8ae0d4" strokeWidth="1.4" strokeDasharray="4 9" fill="none" opacity="0.4" />
    </Svg>
  );
}


/* ------------------------------------------------------------------ */
/* Expansion plates — a bespoke ceremonial scene per banner.           */
/* Each has its own dominant silhouette so the composition is          */
/* recognizable before the palette is. Environments and mood only —    */
/* no characters, no publisher IP. Same visual family as the first     */
/* twelve; those remain untouched.                                     */
/* ------------------------------------------------------------------ */

function Base({
  className,
  id,
  deep,
  mid,
  sky,
  children,
}: PlateProps & {
  id: string;
  deep: string;
  mid: string;
  sky?: { cx: number; cy: number; color: string; r?: number; o?: number };
  children: React.ReactNode;
}) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        {sky && (
          <radialGradient
            id={`sky-${id}`}
            cx={sky.cx / 400}
            cy={sky.cy / 500}
            r={sky.r ?? 0.6}
          >
            <stop offset="0" stopColor={sky.color} stopOpacity={sky.o ?? 0.4} />
            <stop offset="1" stopColor={sky.color} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      <rect width="400" height="500" fill={`url(#bg-${id})`} />
      {sky && <rect width="400" height="500" fill={`url(#sky-${id})`} />}
      {children}
    </Svg>
  );
}

/* Chaos Space Marines — a shattered amphitheater of broken tiers. */
function BlackenedChoir({ className }: PlateProps) {
  const [deep, mid, glow] = ["#10070a", "#3d1020", "#d14a32"];
  return (
    <Base className={className} id="blackened-choir" deep={deep} mid={mid} sky={{ cx: 200, cy: 66, color: glow, r: 0.8, o: 0.42 }}>
      {/* broken proscenium arches at the rim */}
      <g fill={deep} opacity="0.92">
        <path d="M20 240 Q70 150 120 240 L120 250 L108 250 Q70 185 32 250 L20 250 Z" />
        <path d="M282 250 Q330 165 378 250 L378 262 L366 262 Q330 200 294 262 L282 262 Z" />
      </g>
      {/* tiered seating: concentric bowls */}
      <g fill="none" stroke={deep} strokeWidth="13" strokeLinecap="round">
        <path d="M52 300 Q200 452 348 300" opacity="0.95" />
        <path d="M92 322 Q200 448 308 322" opacity="0.9" />
        <path d="M128 344 Q200 442 272 344" opacity="0.85" />
      </g>
      {/* radial aisle breaks */}
      <g stroke={mid} strokeWidth="4" opacity="0.6">
        <path d="M200 300 V440" />
        <path d="M130 306 L168 420" />
        <path d="M270 306 L232 420" />
      </g>
      {/* tattered hanging banner */}
      <path d="M196 150 L196 238 L188 250 L196 262 L188 276 L206 276 L206 150 Z" fill={deep} opacity="0.85" />
      {/* embers */}
      <g fill={glow}>
        {[70, 150, 250, 330].map((x, i) => (
          <circle key={x} cx={x} cy={470} r={1.8} className="anim-drift" style={{ animationDelay: `${i * 1.7}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Astra Militarum — a lantern line receding into rain and fog. */
function LanternLine({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0b1010", "#2f3a28", "#d6b36a"];
  const vx = 214;
  const vy = 250;
  const lamps = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return { x: 40 + (vx - 40) * t, y: 415 - (415 - vy) * t, r: 7 - t * 5.4, o: 0.9 - t * 0.55 };
  });
  return (
    <Base className={className} id="lantern-line" deep={deep} mid={mid}>
      {/* iron clouds */}
      <ellipse cx="120" cy="70" rx="150" ry="40" fill={deep} opacity="0.6" />
      <ellipse cx="320" cy="50" rx="150" ry="44" fill={deep} opacity="0.66" />
      {/* distant searchlight */}
      <path d="M300 120 L250 250 L286 250 Z" fill={glow} opacity="0.1" />
      {/* parapet earthwork */}
      <path d="M0 500 L0 430 Q60 405 120 424 L150 405 L210 426 Q300 400 400 424 L400 500 Z" fill={deep} opacity="0.94" />
      {/* the receding lantern line */}
      <g>
        {lamps.map((l, i) => (
          <g key={i} className="anim-flicker" style={{ animationDelay: `${(i % 4) * 0.6}s` }}>
            <circle cx={l.x} cy={l.y} r={l.r} fill={glow} opacity={l.o} />
            <circle cx={l.x} cy={l.y} r={l.r * 2.6} fill={glow} opacity={l.o * 0.16} />
          </g>
        ))}
      </g>
      {/* fog banks */}
      <ellipse cx="130" cy="360" rx="150" ry="30" fill={mid} opacity="0.4" />
      <ellipse cx="300" cy="392" rx="170" ry="34" fill={mid} opacity="0.34" />
    </Base>
  );
}

/* T'au Empire — a wide dawn plain of slender towers. Mostly sky. */
function PatientHorizon({ className }: PlateProps) {
  const [deep, mid, glow] = ["#07131a", "#1e4f66", "#f0b86a"];
  return (
    <Base className={className} id="patient-horizon" deep={deep} mid={mid}>
      {/* luminous horizon band */}
      <rect x="0" y="330" width="400" height="6" fill={glow} opacity="0.28" />
      <ellipse cx="230" cy="336" rx="240" ry="70" fill={glow} opacity="0.14" />
      {/* clean terraces */}
      <g fill={deep} opacity="0.85">
        <rect x="150" y="336" width="250" height="6" />
        <rect x="196" y="348" width="204" height="7" />
        <rect x="150" y="336" width="6" height="20" />
      </g>
      {/* slender tower cluster, right of centre */}
      <g fill={deep}>
        <path d="M250 336 L253 210 Q255 200 258 210 L261 336 Z" />
        <path d="M276 336 L279 168 Q281 156 284 168 L287 336 Z" />
        <path d="M300 336 L302 232 Q304 224 306 232 L308 336 Z" />
        <rect x="272" y="196" width="16" height="6" opacity="0.9" />
      </g>
      {/* amber signal lights */}
      <g fill={glow}>
        <circle cx="282" cy="176" r="2.4" className="anim-twinkle" />
        <circle cx="256" cy="220" r="2" className="anim-twinkle" style={{ animationDelay: "1.3s" }} />
        <circle cx="304" cy="242" r="1.8" className="anim-twinkle" style={{ animationDelay: "2.1s" }} />
      </g>
    </Base>
  );
}

/* Drukhari — thin black-glass bridges over a bottomless violet gulf. */
function GlassKnife({ className }: PlateProps) {
  const [deep, mid, glow] = ["#070711", "#30164f", "#73f0d8"];
  return (
    <Base className={className} id="glass-knife" deep={deep} mid={mid} sky={{ cx: 200, cy: 120, color: mid, r: 0.7, o: 0.5 }}>
      {/* the abyss darkens downward */}
      <rect x="0" y="250" width="400" height="250" fill={deep} opacity="0.55" />
      <ellipse cx="200" cy="500" rx="260" ry="150" fill="#000" opacity="0.5" />
      {/* razor spires */}
      <g fill={deep}>
        <path d="M60 300 L66 120 L69 108 L72 120 L78 300 Z" />
        <path d="M336 330 L341 150 L344 140 L347 150 L352 330 Z" />
        <path d="M150 250 L154 176 L156 168 L158 176 L162 250 Z" opacity="0.9" />
      </g>
      {/* thin suspended bridges at varying depth */}
      <g fill={deep} opacity="0.92">
        <path d="M0 214 L400 196 L400 204 L0 226 Z" />
        <path d="M0 300 L400 336 L400 344 L0 312 Z" opacity="0.85" />
        <path d="M70 392 L330 372 L330 380 L70 402 Z" opacity="0.7" />
      </g>
      {/* cold neon glints */}
      <g fill={glow}>
        <circle cx="120" cy="207" r="1.8" className="anim-twinkle" />
        <circle cx="300" cy="322" r="1.6" className="anim-twinkle" style={{ animationDelay: "1.6s" }} />
        <circle cx="210" cy="386" r="1.5" className="anim-twinkle" style={{ animationDelay: "0.8s" }} />
      </g>
    </Base>
  );
}

/* Genestealer Cults — a chalk constellation on a subterranean wall. */
function SubterraneanStar({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0d0b12", "#3b2a54", "#d8c26a"];
  const pts = [
    [200, 150], [246, 268], [372, 268], [270, 342], [312, 462],
    [200, 388], [88, 462], [130, 342], [28, 268], [154, 268],
  ];
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ") + " Z";
  return (
    <Base className={className} id="subterranean-star" deep={deep} mid={mid}>
      {/* concrete seams */}
      <g stroke={deep} strokeWidth="2" opacity="0.5">
        <path d="M0 130 H400 M0 250 H400 M0 370 H400 M120 0 V500 M300 0 V500" />
      </g>
      {/* purple work-lamp glow */}
      <ellipse cx="40" cy="430" rx="150" ry="120" fill={mid} opacity="0.5" />
      <ellipse cx="370" cy="120" rx="140" ry="110" fill={mid} opacity="0.42" />
      {/* pipes along the top */}
      <g stroke={deep} strokeWidth="7" fill="none" opacity="0.85">
        <path d="M0 46 H160 M240 46 H400 M110 46 V0 M300 66 H400" />
      </g>
      {/* the chalk star */}
      <path d={path} fill="none" stroke={glow} strokeWidth="1.6" opacity="0.85" className="anim-flicker" style={{ animationDuration: "6s" }} />
      <g fill={glow}>
        {pts.filter((_, i) => i % 2 === 0).map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.4" className="anim-twinkle" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>
      {/* dust motes */}
      <g fill={glow}>
        {[110, 300, 210].map((x, i) => (
          <circle key={x} cx={x} cy={430} r="1.3" className="anim-drift" style={{ animationDelay: `${i * 2.1}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Imperial Knights — a courtyard of empty armour-plinths and banners. */
function ToweringVow({ className }: PlateProps) {
  const [deep, mid, glow] = ["#111018", "#5a2630", "#e0bd73"];
  const plinths = [70, 140, 210, 280, 350];
  return (
    <Base className={className} id="towering-vow" deep={deep} mid={mid} sky={{ cx: 200, cy: 430, color: glow, r: 0.7, o: 0.34 }}>
      {/* sunrise wash on the far wall */}
      <rect x="0" y="0" width="400" height="360" fill={mid} opacity="0.25" />
      {/* top beam + long hanging banners */}
      <rect x="30" y="70" width="340" height="8" fill={deep} />
      <g fill={deep} opacity="0.9">
        {plinths.map((x, i) => (
          <path key={x} d={`M${x - 12} 78 L${x + 12} 78 L${x + 12} ${300 + (i % 2) * 24} L${x} ${312 + (i % 2) * 24} L${x - 12} ${300 + (i % 2) * 24} Z`} opacity={i % 2 ? 0.66 : 0.86} />
        ))}
      </g>
      {/* polished floor */}
      <rect x="0" y="392" width="400" height="108" fill={deep} opacity="0.6" />
      <rect x="0" y="392" width="400" height="3" fill={glow} opacity="0.3" />
      {/* empty plinths in a row */}
      <g fill={deep}>
        {plinths.map((x) => (
          <path key={x} d={`M${x - 20} 392 L${x + 20} 392 L${x + 14} 356 L${x - 14} 356 Z`} />
        ))}
      </g>
      {/* faint floor reflections */}
      <g fill={glow} opacity="0.12">
        {plinths.map((x) => (
          <rect key={x} x={x - 12} y="395" width="24" height="40" />
        ))}
      </g>
    </Base>
  );
}

/* Chaos Knights — a colossal rusted gate hanging ajar, green lightning. */
function AshenTithe({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0b0808", "#3a2a1f", "#9bd46a"];
  return (
    <Base className={className} id="ashen-tithe" deep={deep} mid={mid}>
      {/* sick clouds */}
      <ellipse cx="120" cy="90" rx="160" ry="46" fill={deep} opacity="0.7" />
      <ellipse cx="320" cy="70" rx="150" ry="50" fill={deep} opacity="0.72" />
      {/* green lightning behind */}
      <g className="anim-bolt">
        <path d="M250 60 L232 150 L252 148 L214 250" fill="none" stroke={glow} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="235" cy="150" rx="120" ry="110" fill={glow} opacity="0.08" />
      </g>
      {/* rusted gate: left panel upright, right panel leaning ajar */}
      <g fill={deep}>
        <path d="M60 500 L60 210 L150 200 L150 500 Z" />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={72 + i * 20} y="212" width="6" height="288" fill={mid} opacity="0.55" />
        ))}
      </g>
      <g fill={deep} transform="rotate(9 250 500)">
        <path d="M250 500 L256 214 L344 226 L338 500 Z" />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={266 + i * 20} y="222" width="6" height="278" fill={mid} opacity="0.5" />
        ))}
      </g>
      {/* torn heraldic streamers */}
      <path d="M104 150 L104 232 L96 246 L104 260 L96 274 L114 274 L114 150 Z" fill={mid} opacity="0.7" />
      {/* ash */}
      <g fill={mid}>
        {[90, 200, 320].map((x, i) => (
          <circle key={x} cx={x} cy={460} r="1.6" className="anim-drift" style={{ animationDelay: `${i * 1.9}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Grey Knights — a warded silver door, sacred geometry aglow. */
function SilverSanctum({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0a0d12", "#344457", "#9fd8ff"];
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${200 + Math.cos(a) * 60} ${210 + Math.sin(a) * 60}`;
  });
  return (
    <Base className={className} id="silver-sanctum" deep={deep} mid={mid}>
      {/* cold hall */}
      <ellipse cx="200" cy="210" rx="150" ry="180" fill={mid} opacity="0.28" />
      {/* the high warded door */}
      <path d="M120 470 L120 150 Q200 60 280 150 L280 470 Z" fill={deep} opacity="0.9" />
      <path d="M120 470 L120 150 Q200 60 280 150 L280 470" fill="none" stroke={glow} strokeWidth="1.4" opacity="0.4" />
      {/* geometric ward */}
      <g className="anim-flicker" style={{ animationDuration: "5s" }} opacity="0.85">
        <circle cx="200" cy="210" r="60" fill="none" stroke={glow} strokeWidth="1.3" />
        <circle cx="200" cy="210" r="38" fill="none" stroke={glow} strokeWidth="1" />
        <polygon points={hex.join(" ")} fill="none" stroke={glow} strokeWidth="1.2" />
        <polygon points={hex.filter((_, i) => i % 2 === 0).join(" ")} fill="none" stroke={glow} strokeWidth="1" />
      </g>
      {/* marble floor + reflection */}
      <rect x="0" y="470" width="400" height="30" fill={deep} />
      <rect x="0" y="470" width="400" height="2.5" fill={glow} opacity="0.3" />
      {/* blue candle points + dust */}
      <g fill={glow}>
        <circle cx="150" cy="330" r="2.2" className="anim-twinkle" />
        <circle cx="250" cy="330" r="2.2" className="anim-twinkle" style={{ animationDelay: "1.4s" }} />
        {[110, 290, 200].map((x, i) => (
          <circle key={x} cx={x} cy={410} r="1.2" className="anim-drift" style={{ animationDelay: `${i * 2}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Adeptus Custodes — one radiant golden gate, perfect symmetry. */
function AuricWatch({ className }: PlateProps) {
  const [deep, mid, glow] = ["#120d06", "#6b4318", "#f0d37a"];
  return (
    <Base className={className} id="auric-watch" deep={deep} mid={mid}>
      {/* light pouring from the gate */}
      <ellipse cx="200" cy="250" rx="120" ry="230" fill={glow} opacity="0.22" />
      {/* flanking alcoves (symmetric) */}
      <g fill={deep} opacity="0.92">
        <path d="M30 440 L30 240 Q64 190 98 240 L98 440 Z" />
        <path d="M302 440 L302 240 Q336 190 370 240 L370 440 Z" />
      </g>
      {/* the central gate */}
      <path d="M132 440 L132 190 Q200 90 268 190 L268 440 Z" fill={deep} />
      <path d="M148 440 L148 200 Q200 118 252 200 L252 440 Z" fill={glow} opacity="0.5" />
      <path d="M164 440 L164 210 Q200 146 236 210 L236 440 Z" fill={mid} opacity="0.9" />
      {/* pooled light on the polished floor */}
      <path d="M150 440 L250 440 L330 500 L70 500 Z" fill={glow} opacity="0.18" />
      <rect x="0" y="440" width="400" height="3" fill={glow} opacity="0.3" />
      {/* crowning light */}
      <circle cx="200" cy="150" r="4" fill={glow} className="anim-twinkle" />
    </Base>
  );
}

/* Death Guard — a ruined greenhouse, cracked glass roof, pallid blooms. */
function GardenOfRust({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0d1008", "#4b4a22", "#b6c96a"];
  return (
    <Base className={className} id="garden-of-rust" deep={deep} mid={mid} sky={{ cx: 200, cy: 200, color: glow, r: 0.75, o: 0.22 }}>
      {/* pitched glass roof frame */}
      <path d="M40 300 L200 90 L360 300 Z" fill={mid} opacity="0.16" />
      <g stroke={deep} strokeWidth="4" fill="none" opacity="0.9">
        <path d="M40 300 L200 90 L360 300" />
        <path d="M200 90 L200 300" />
        <path d="M120 195 L280 195" />
        <path d="M80 248 L320 248" />
        <path d="M120 90 L120 300 M280 90 L280 300" opacity="0.5" />
      </g>
      {/* shattered panes (missing glass) */}
      <g fill={deep} opacity="0.85">
        <path d="M204 100 L276 195 L204 195 Z" />
        <path d="M84 252 L196 252 L196 296 L112 296 Z" opacity="0.6" />
      </g>
      {/* yellow-green fog */}
      <ellipse cx="200" cy="400" rx="230" ry="70" fill={glow} opacity="0.12" />
      {/* pallid blooms pushing up through the frame */}
      <g fill={deep}>
        <path d="M96 440 Q92 380 100 356 M100 356 Q84 350 88 366 M100 356 Q116 348 110 364" stroke={deep} strokeWidth="3" fill="none" />
        <circle cx="100" cy="352" r="9" fill={glow} opacity="0.8" />
        <circle cx="300" cy="366" r="11" fill={glow} opacity="0.7" />
        <path d="M300 440 Q296 400 300 372" stroke={deep} strokeWidth="3" fill="none" />
        <circle cx="210" cy="392" r="7" fill={glow} opacity="0.6" />
        <path d="M210 440 Q208 410 210 398" stroke={deep} strokeWidth="2.5" fill="none" />
      </g>
      {/* damp floor */}
      <path d="M0 440 Q120 424 240 436 T400 428 V500 H0 Z" fill={deep} opacity="0.9" />
    </Base>
  );
}

/* Thousand Sons — a sapphire labyrinth of script-covered walls. */
function SapphireLabyrinth({ className }: PlateProps) {
  const [deep, mid, glow] = ["#06101d", "#123d7a", "#d8b45a"];
  return (
    <Base className={className} id="sapphire-labyrinth" deep={deep} mid={mid} sky={{ cx: 200, cy: 90, color: mid, r: 0.7, o: 0.55 }}>
      {/* maze slab */}
      <rect x="40" y="180" width="320" height="300" fill={deep} opacity="0.55" />
      {/* labyrinth path */}
      <g fill="none" stroke={glow} strokeWidth="2.4" opacity="0.7">
        <path d="M70 450 V210 H330 V450 M100 450 V240 H300 V420 M130 420 V270 H270 V400 M160 400 V300 H240 V380 M190 380 V330 H210 V360" />
      </g>
      {/* impossible short stairways */}
      <g fill={mid} opacity="0.8">
        <path d="M46 230 h20 v-12 h20 v-12 h20 v34 h-60 Z" />
        <path d="M356 250 h-20 v-12 h-20 v-12 h-20 v34 h60 Z" />
      </g>
      {/* hovering lanterns */}
      <g fill={glow}>
        <circle cx="120" cy="150" r="4" className="anim-flicker" />
        <circle cx="120" cy="150" r="12" opacity="0.14" />
        <circle cx="290" cy="128" r="3.4" className="anim-flicker" style={{ animationDelay: "1.4s" }} />
        <circle cx="290" cy="128" r="10" opacity="0.14" />
      </g>
    </Base>
  );
}

/* World Eaters — a red canyon gorge narrowing to a furnace slot. */
function RedUrgency({ className }: PlateProps) {
  const [deep, mid, glow] = ["#120606", "#6a1717", "#f06a32"];
  return (
    <Base className={className} id="red-urgency" deep={deep} mid={mid}>
      {/* furnace slot of sky */}
      <rect x="176" y="0" width="48" height="500" fill={glow} opacity="0.3" />
      <ellipse cx="200" cy="120" rx="60" ry="150" fill={glow} opacity="0.35" />
      {/* converging canyon walls */}
      <path d="M0 500 L0 0 L120 0 L176 210 L172 500 Z" fill={deep} />
      <path d="M400 500 L400 0 L280 0 L224 210 L228 500 Z" fill={deep} />
      {/* jagged inner faces */}
      <g fill={mid} opacity="0.5">
        <path d="M120 0 L176 210 L150 120 L150 40 Z" />
        <path d="M280 0 L224 210 L250 120 L250 40 Z" />
      </g>
      {/* iron braziers */}
      <g fill={glow}>
        <circle cx="164" cy="360" r="3" className="anim-flicker" />
        <circle cx="236" cy="330" r="3" className="anim-flicker" style={{ animationDelay: "1.1s" }} />
      </g>
      {/* curling dust */}
      <g fill={glow} opacity="0.5">
        {[190, 205, 200].map((x, i) => (
          <circle key={i} cx={x} cy={440 - i * 20} r="2.2" className="anim-drift" style={{ animationDelay: `${i * 1.3}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Skaven — a tangle of pipes and leaning gantries, green sparks. */
function SkitteringCrown({ className }: PlateProps) {
  const [deep, mid, glow] = ["#080d0a", "#264329", "#7ee06a"];
  return (
    <Base className={className} id="skittering-crown" deep={deep} mid={mid}>
      {/* pipe tangle */}
      <g fill="none" stroke={deep} strokeWidth="10" strokeLinecap="round" opacity="0.92">
        <path d="M0 150 H120 Q150 150 150 190 V320" />
        <path d="M400 120 H250 Q220 120 220 160 V300" />
        <path d="M40 260 Q160 220 260 280 T400 250" />
        <path d="M0 340 Q120 300 210 360 T400 330" />
        <path d="M90 60 V300 M320 40 V300" />
      </g>
      <g fill="none" stroke={mid} strokeWidth="5" opacity="0.7">
        <path d="M0 200 Q140 170 250 210 T400 190" />
        <path d="M60 100 H340" />
      </g>
      {/* leaning gantries */}
      <g fill={deep} opacity="0.9" stroke={mid} strokeWidth="2">
        <path d="M120 380 L150 250 L166 254 L140 384 Z" />
        <path d="M300 384 L276 244 L292 242 L316 380 Z" />
      </g>
      {/* oily water */}
      <path d="M0 420 Q100 406 200 416 T400 410 V500 H0 Z" fill={deep} opacity="0.85" />
      <path d="M0 420 H400" stroke={glow} strokeWidth="1" opacity="0.2" />
      {/* green sparks at the joints */}
      <g fill={glow}>
        {[[150, 190], [220, 160], [90, 260], [320, 210], [260, 280]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" className="anim-twinkle" style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Seraphon — a stepped observatory beneath a coil of stars. */
function StarCoil({ className }: PlateProps) {
  const [deep, mid, glow] = ["#061512", "#1f5a4b", "#82e8ff"];
  const coil = Array.from({ length: 26 }, (_, i) => {
    const t = i / 25;
    const a = t * Math.PI * 5;
    const r = 8 + t * 120;
    return { x: 200 + Math.cos(a) * r * 0.92, y: 150 + Math.sin(a) * r * 0.5, r: 0.8 + (1 - t) * 1.8, d: (i % 5) * 0.5 };
  });
  return (
    <Base className={className} id="star-coil" deep={deep} mid={mid}>
      {/* the star coil */}
      <g fill={glow}>
        {coil.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} className={i % 2 ? "anim-twinkle" : undefined} style={i % 2 ? { animationDelay: `${s.d}s` } : undefined} opacity={0.85} />
        ))}
      </g>
      {/* luminous pool at the base */}
      <ellipse cx="200" cy="452" rx="150" ry="30" fill={glow} opacity="0.16" />
      {/* stepped ziggurat */}
      <g fill={deep}>
        <path d="M120 452 L280 452 L262 410 L138 410 Z" />
        <path d="M146 410 L254 410 L240 372 L160 372 Z" />
        <path d="M168 372 L232 372 L222 338 L178 338 Z" />
        <rect x="192" y="306" width="16" height="32" />
      </g>
      {/* fern shadows */}
      <g fill={deep} opacity="0.85">
        <path d="M0 500 L0 420 Q28 430 40 470 Q52 430 70 500 Z" />
        <path d="M400 500 L400 430 Q372 440 360 476 Q350 440 336 500 Z" />
      </g>
    </Base>
  );
}

/* Cities of Sigmar — a long fortified wall, many warm windows. */
function MarketWalls({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0d1014", "#354256", "#d6a85f"];
  const merlons = Array.from({ length: 13 }, (_, i) => 20 + i * 30);
  const windows: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) windows.push([44 + c * 34, 320 + r * 40]);
  return (
    <Base className={className} id="market-walls" deep={deep} mid={mid} sky={{ cx: 200, cy: 250, color: glow, r: 0.6, o: 0.22 }}>
      <Stars seed={35} count={16} color={glow} maxY={210} />
      {/* the wall */}
      <rect x="0" y="290" width="400" height="210" fill={deep} />
      {/* crenellations */}
      <g fill={deep}>
        {merlons.map((x) => (
          <rect key={x} x={x} y="272" width="18" height="20" />
        ))}
      </g>
      {/* central gate */}
      <path d="M170 500 L170 380 Q200 344 230 380 L230 500 Z" fill="#000" opacity="0.6" />
      <path d="M182 500 L182 386 Q200 360 218 386 L218 500 Z" fill={glow} opacity="0.28" />
      {/* many warm windows */}
      <g fill={glow}>
        {windows.filter(([x]) => x < 168 || x > 232).map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="5" height="8" className={i % 4 === 0 ? "anim-flicker" : undefined} style={i % 4 === 0 ? { animationDelay: `${(i % 5) * 0.6}s` } : undefined} opacity="0.85" />
        ))}
      </g>
      {/* little pennants */}
      <g fill={glow} opacity="0.7">
        {[80, 200, 320].map((x) => (
          <path key={x} d={`M${x} 272 L${x} 250 L${x + 14} 258 L${x} 266 Z`} />
        ))}
      </g>
    </Base>
  );
}

/* Kharadron Overlords — a brass sky-dock moored above a cloud sea. */
function SkyLedger({ className }: PlateProps) {
  const [deep, mid, glow] = ["#081018", "#4f3b22", "#f0b45f"];
  return (
    <Base className={className} id="sky-ledger" deep={deep} mid={mid} sky={{ cx: 320, cy: 150, color: glow, r: 0.6, o: 0.28 }}>
      <Stars seed={36} count={12} color={glow} maxY={150} />
      {/* mooring cables up to the frame */}
      <g stroke={deep} strokeWidth="2" opacity="0.75">
        <path d="M120 300 L40 90 M160 300 L150 70 M240 300 L250 70 M280 300 L360 90" />
      </g>
      {/* the floating dock */}
      <g fill={deep}>
        <path d="M100 300 L300 300 L280 340 L120 340 Z" />
        <rect x="150" y="266" width="10" height="34" />
        <rect x="240" y="266" width="10" height="34" />
        <rect x="196" y="252" width="8" height="48" />
        {/* mooring pylons */}
        <rect x="112" y="286" width="8" height="18" />
        <rect x="280" y="286" width="8" height="18" />
      </g>
      {/* amber dock lanterns */}
      <g fill={glow}>
        {[130, 175, 225, 270].map((x, i) => (
          <circle key={x} cx={x} cy={312} r="2.6" className="anim-flicker" style={{ animationDelay: `${(i % 3) * 0.7}s` }} />
        ))}
      </g>
      {/* cloud sea */}
      <g fill={mid} opacity="0.7">
        <ellipse cx="80" cy="440" rx="140" ry="40" />
        <ellipse cx="280" cy="460" rx="170" ry="46" />
        <ellipse cx="380" cy="430" rx="110" ry="34" />
      </g>
      <ellipse cx="180" cy="424" rx="120" ry="24" fill={mid} opacity="0.5" />
    </Base>
  );
}

/* Fyreslayers — a great round vault door, molten seams aglow. */
function EmberVault({ className }: PlateProps) {
  const [deep, mid, glow] = ["#120805", "#5a2112", "#ff9a3d"];
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `M${200 + Math.cos(a) * 40} ${250 + Math.sin(a) * 40} L${200 + Math.cos(a) * 108} ${250 + Math.sin(a) * 108}`;
  });
  return (
    <Base className={className} id="ember-vault" deep={deep} mid={mid}>
      {/* basalt blocks */}
      <g fill={deep}>
        <path d="M0 500 L0 60 L120 60 L90 250 L120 440 L0 440 Z" />
        <path d="M400 500 L400 60 L280 60 L310 250 L280 440 L400 440 Z" />
        <rect x="0" y="0" width="400" height="60" />
        <rect x="0" y="470" width="400" height="30" />
      </g>
      {/* heat haze behind the door */}
      <ellipse cx="200" cy="250" rx="130" ry="150" fill={glow} opacity="0.16" />
      {/* the round vault door */}
      <circle cx="200" cy="250" r="120" fill={deep} />
      <g stroke={glow} strokeWidth="2" opacity="0.55" className="anim-flicker" style={{ animationDuration: "5s" }}>
        {rays.map((d, i) => <path key={i} d={d} />)}
        <circle cx="200" cy="250" r="108" fill="none" />
        <circle cx="200" cy="250" r="70" fill="none" />
        <circle cx="200" cy="250" r="40" fill={glow} opacity="0.35" stroke="none" />
      </g>
      {/* sparks */}
      <g fill={glow}>
        {[150, 200, 250].map((x, i) => (
          <circle key={x} cx={x} cy={430} r="1.8" className="anim-drift" style={{ animationDelay: `${i * 1.6}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Lumineth — a causeway over a mirror-still lake, prismatic dawn. */
function DawnPrism({ className }: PlateProps) {
  const [deep, mid, glow] = ["#071118", "#31506a", "#f2e6a0"];
  const ridge = "M0 250 L70 200 L120 236 L200 170 L280 224 L340 196 L400 236";
  return (
    <Base className={className} id="dawn-prism" deep={deep} mid={mid} sky={{ cx: 200, cy: 190, color: glow, r: 0.7, o: 0.24 }}>
      {/* pale mountains */}
      <path d={`${ridge} L400 250 Z`} fill={deep} opacity="0.7" />
      {/* prism fan of light */}
      <g stroke={glow} strokeWidth="1.4" opacity="0.5">
        <path d="M200 150 L120 250" />
        <path d="M200 150 L170 250" />
        <path d="M200 150 L230 250" />
        <path d="M200 150 L280 250" />
      </g>
      {/* the causeway */}
      <rect x="0" y="248" width="400" height="4" fill={glow} opacity="0.5" />
      {/* mirror water: reflected ridge, fainter */}
      <g transform="translate(0 500) scale(1 -1)">
        <path d={`${ridge} L400 250 Z`} fill={deep} opacity="0.35" />
      </g>
      <rect x="0" y="252" width="400" height="248" fill={mid} opacity="0.2" />
      {/* reflected prism */}
      <g stroke={glow} strokeWidth="1.2" opacity="0.2">
        <path d="M200 350 L120 252" />
        <path d="M200 350 L280 252" />
      </g>
    </Base>
  );
}

/* Daughters of Khaine — a crimson temple mirrored in black water. */
function CrimsonOracle({ className }: PlateProps) {
  const [deep, mid, glow] = ["#12070d", "#5c1832", "#f07a8a"];
  const temple = "M110 300 L150 200 L186 236 L200 150 L214 236 L250 200 L290 300 Z";
  return (
    <Base className={className} id="crimson-oracle" deep={deep} mid={mid} sky={{ cx: 200, cy: 210, color: mid, r: 0.7, o: 0.5 }}>
      {/* silk veils */}
      <g fill={mid} opacity="0.35">
        <path d="M60 60 Q76 200 60 320 L84 320 Q100 200 84 60 Z" />
        <path d="M316 60 Q332 200 316 320 L340 320 Q356 200 340 60 Z" />
      </g>
      {/* obsidian temple + steps */}
      <path d={temple} fill={deep} />
      <g fill={deep}>
        <path d="M96 340 L304 340 L290 300 L110 300 Z" />
        <path d="M84 340 L316 340 L316 360 L84 360 Z" />
      </g>
      {/* mirror water: reflection */}
      <rect x="0" y="360" width="400" height="140" fill="#000" opacity="0.4" />
      <g transform="translate(0 720) scale(1 -1)" opacity="0.4">
        <path d={temple} fill={mid} />
      </g>
      <rect x="0" y="360" width="400" height="2" fill={glow} opacity="0.3" />
      {/* candle points */}
      <g fill={glow}>
        <circle cx="150" cy="326" r="2.4" className="anim-flicker" />
        <circle cx="250" cy="326" r="2.4" className="anim-flicker" style={{ animationDelay: "1.2s" }} />
        <circle cx="200" cy="300" r="2.6" className="anim-flicker" style={{ animationDelay: "0.6s" }} />
      </g>
    </Base>
  );
}

/* Nighthaunt — a hollow bell over a drowned road in mist. */
function HollowBell({ className }: PlateProps) {
  const [deep, mid, glow] = ["#061013", "#1d3a45", "#a8f0e8"];
  return (
    <Base className={className} id="hollow-bell" deep={deep} mid={mid} sky={{ cx: 200, cy: 160, color: glow, r: 0.55, o: 0.18 }}>
      {/* leaning bell towers behind fog */}
      <g fill={deep} opacity="0.7">
        <path d="M52 440 L60 150 L88 146 L92 440 Z" transform="rotate(-5 70 300)" />
        <path d="M320 440 L326 176 L352 178 L356 440 Z" transform="rotate(4 336 300)" />
      </g>
      {/* the hanging bell */}
      <g>
        <rect x="120" y="70" width="160" height="7" fill={deep} />
        <line x1="200" y1="77" x2="200" y2="120" stroke={deep} strokeWidth="4" />
        <path d="M158 250 Q158 140 200 122 Q242 140 242 250 Q242 262 200 262 Q158 262 158 250 Z" fill={deep} />
        <path d="M158 250 Q200 268 242 250 L242 262 Q200 276 158 262 Z" fill={mid} />
        <circle cx="200" cy="272" r="6" fill={deep} />
        <path d="M158 250 Q200 264 242 250" fill="none" stroke={glow} strokeWidth="1.2" opacity="0.4" className="anim-flicker" />
      </g>
      {/* still water + reflection */}
      <rect x="0" y="410" width="400" height="90" fill={deep} opacity="0.7" />
      <path d="M158 410 Q200 396 242 410 L242 430 Q200 444 158 430 Z" fill={mid} opacity="0.3" transform="translate(0 40) scale(1 -1) translate(0 -820)" />
      {/* fog veils */}
      <g fill={mid} opacity="0.4">
        <ellipse cx="120" cy="330" rx="160" ry="26" />
        <ellipse cx="300" cy="370" rx="170" ry="30" />
      </g>
    </Base>
  );
}

/* Ossiarch Bonereapers — a silent colonnade of ivory pillars. */
function BoneAccounting({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0d0c0a", "#4a4032", "#d8c190"];
  const rows = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    return { y: 470 - t * 250, h: 150 - t * 112, w: 30 - t * 22, xl: 34 + t * 138, xr: 366 - t * 138, o: 0.95 - t * 0.4 };
  });
  return (
    <Base className={className} id="bone-accounting" deep={deep} mid={mid}>
      {/* cold amber light at the far end */}
      <ellipse cx="200" cy="200" rx="90" ry="150" fill={glow} opacity="0.16" />
      {/* black floor + centre avenue */}
      <path d="M172 500 L196 220 L204 220 L228 500 Z" fill={deep} opacity="0.5" />
      {/* two receding rows of pillars */}
      <g fill={deep}>
        {rows.map((r, i) => (
          <g key={i}>
            <rect x={r.xl - r.w / 2} y={r.y - r.h} width={r.w} height={r.h} opacity={r.o} />
            <rect x={r.xl - r.w / 2 - 3} y={r.y - r.h - 6} width={r.w + 6} height={6} opacity={r.o} />
            <rect x={r.xr - r.w / 2} y={r.y - r.h} width={r.w} height={r.h} opacity={r.o} />
            <rect x={r.xr - r.w / 2 - 3} y={r.y - r.h - 6} width={r.w + 6} height={6} opacity={r.o} />
          </g>
        ))}
      </g>
      {/* braziers down the avenue */}
      <g fill={glow}>
        {rows.slice(1, 5).map((r, i) => (
          <circle key={i} cx={200} cy={r.y - 12} r={2.4 - i * 0.3} className="anim-flicker" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Slaves to Darkness — a black mountain pass in a snowstorm. */
function IronTempest({ className }: PlateProps) {
  const [deep, mid, glow] = ["#09090c", "#30303a", "#b6a06a"];
  const snow = Array.from({ length: 26 }, (_, i) => {
    const a = Math.sin(i * 91.7) * 10000;
    const b = Math.sin(i * 47.3) * 10000;
    return { x: Math.abs(a - Math.floor(a)) * 400, y: Math.abs(b - Math.floor(b)) * 500 };
  });
  return (
    <Base className={className} id="iron-tempest" deep={deep} mid={mid} sky={{ cx: 200, cy: 210, color: mid, r: 0.6, o: 0.5 }}>
      {/* two peaks forming a V-notch pass */}
      <path d="M0 500 L0 120 L90 40 L200 340 L200 500 Z" fill={deep} />
      <path d="M400 500 L400 90 L316 30 L200 340 L200 500 Z" fill={deep} />
      {/* fortress lights high on the left cliff */}
      <g fill={glow}>
        <rect x="70" y="150" width="5" height="7" className="anim-flicker" />
        <rect x="84" y="164" width="5" height="7" className="anim-flicker" style={{ animationDelay: "1s" }} />
        <rect x="60" y="176" width="5" height="7" className="anim-flicker" style={{ animationDelay: "1.8s" }} />
      </g>
      {/* iron bell on a broken post in the pass */}
      <g fill={deep}>
        <rect x="196" y="300" width="4" height="60" />
        <rect x="184" y="300" width="30" height="4" />
        <path d="M200 306 Q188 306 188 322 Q188 330 200 330 Q212 330 212 322 Q212 306 200 306 Z" />
      </g>
      {/* driving snow */}
      <g stroke={glow} strokeWidth="1.4" opacity="0.5" strokeLinecap="round">
        {snow.map((s, i) => (
          <path key={i} d={`M${s.x} ${s.y} l-6 12`} />
        ))}
      </g>
    </Base>
  );
}

/* Blades of Khorne — a brass causeway to a vast gate over red clouds. */
function BrassThunder({ className }: PlateProps) {
  const [deep, mid, glow] = ["#130605", "#6b1810", "#e0a13d"];
  return (
    <Base className={className} id="brass-thunder" deep={deep} mid={mid} sky={{ cx: 200, cy: 120, color: glow, r: 0.6, o: 0.3 }}>
      {/* the vast rune-gate at the vanishing point */}
      <rect x="150" y="150" width="100" height="130" fill={deep} />
      <rect x="150" y="150" width="100" height="8" fill={glow} opacity="0.5" />
      <g stroke={glow} strokeWidth="1.4" opacity="0.5">
        <path d="M200 158 V280 M170 180 H230 M176 220 H224 M182 250 H218" />
      </g>
      <rect x="190" y="230" width="20" height="50" fill={glow} opacity="0.35" />
      {/* the causeway in strong perspective */}
      <path d="M110 500 L188 280 L212 280 L290 500 Z" fill={deep} />
      {/* rune inlays across the deck */}
      <g stroke={glow} strokeWidth="1.6" opacity="0.55">
        <path d="M150 440 H250 M158 400 H242 M166 360 H234 M174 322 H226 M182 300 H218" />
      </g>
      {/* red storm clouds flanking */}
      <g fill={mid} opacity="0.7">
        <ellipse cx="70" cy="360" rx="130" ry="44" />
        <ellipse cx="330" cy="380" rx="140" ry="48" />
        <ellipse cx="60" cy="300" rx="90" ry="30" />
        <ellipse cx="350" cy="320" rx="90" ry="30" />
      </g>
      {/* sparks */}
      <g fill={glow}>
        {[176, 200, 224].map((x, i) => (
          <circle key={x} cx={x} cy={420} r="1.8" className="anim-drift" style={{ animationDelay: `${i * 1.4}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Disciples of Tzeentch — an impossible staircase in shifting cloud. */
function ChangingStair({ className }: PlateProps) {
  const [deep, mid, glow] = ["#070a18", "#283c8a", "#ff7ad8"];
  const teal = "#7ad8ff";
  function Flight({ x, y, dx, dy, n, fill }: { x: number; y: number; dx: number; dy: number; n: number; fill: string }) {
    const steps = [];
    for (let i = 0; i < n; i++) {
      const sx = x + dx * i;
      const sy = y + dy * i;
      steps.push(<path key={i} d={`M${sx} ${sy} h22 v10 h-22 Z`} fill={fill} />);
      steps.push(<path key={`r${i}`} d={`M${sx + 22} ${sy} v10 l8 -6 v-10 Z`} fill={deep} opacity="0.85" />);
    }
    return <g>{steps}</g>;
  }
  return (
    <Base className={className} id="changing-stair" deep={deep} mid={mid} sky={{ cx: 200, cy: 240, color: teal, r: 0.7, o: 0.4 }}>
      {/* shifting clouds: turquoise + pink */}
      <ellipse cx="90" cy="150" rx="130" ry="50" fill={teal} opacity="0.16" />
      <ellipse cx="320" cy="360" rx="140" ry="56" fill={glow} opacity="0.16" />
      {/* impossible interlocking flights */}
      <Flight x={70} y={360} dx={16} dy={-16} n={7} fill={mid} />
      <Flight x={186} y={244} dx={16} dy={12} n={7} fill={glow} />
      <Flight x={300} y={330} dx={-16} dy={-14} n={6} fill={teal} />
      <Flight x={196} y={430} dx={-15} dy={-13} n={6} fill={mid} />
      {/* mirrored doors */}
      <g fill={deep} opacity="0.9" stroke={glow} strokeWidth="1.2">
        <path d="M120 130 h26 v40 q-13 8 -26 0 Z" />
        <path d="M280 250 h24 v38 q-12 7 -24 0 Z" />
      </g>
      {/* blue-fire lanterns */}
      <g fill={teal}>
        <circle cx="150" cy="200" r="3.4" className="anim-flicker" />
        <circle cx="150" cy="200" r="10" opacity="0.16" />
        <circle cx="300" cy="200" r="3" className="anim-flicker" style={{ animationDelay: "1.3s" }} />
      </g>
    </Base>
  );
}

/* Maggotkin of Nurgle — a mossy ruin in warm rain, blooming with life. */
function RainOfSpores({ className }: PlateProps) {
  const [deep, mid, glow] = ["#0b1108", "#3f5126", "#d6c66a"];
  const rain = Array.from({ length: 20 }, (_, i) => {
    const a = Math.sin(i * 73.1) * 10000;
    return { x: Math.abs(a - Math.floor(a)) * 400, y: (i * 53) % 380 };
  });
  return (
    <Base className={className} id="rain-of-spores" deep={deep} mid={mid} sky={{ cx: 200, cy: 200, color: glow, r: 0.7, o: 0.18 }}>
      {/* soft green fog */}
      <ellipse cx="200" cy="360" rx="240" ry="90" fill={glow} opacity="0.12" />
      {/* broken arch of a ruin */}
      <g fill={deep}>
        <path d="M60 440 L60 220 Q120 150 180 220 L180 250 Q120 200 84 250 L84 440 Z" opacity="0.9" />
        <path d="M300 440 L300 280 L340 280 L340 440 Z" opacity="0.8" />
        <rect x="280" y="272" width="80" height="12" opacity="0.8" />
      </g>
      {/* warm rain */}
      <g stroke={glow} strokeWidth="1.2" opacity="0.35" strokeLinecap="round">
        {rain.map((r, i) => (
          <path key={i} d={`M${r.x} ${r.y} l-3 14`} />
        ))}
      </g>
      {/* oversized mushrooms */}
      <g>
        <rect x="126" y="392" width="14" height="60" fill={mid} rx="6" />
        <ellipse cx="133" cy="388" rx="42" ry="20" fill={glow} opacity="0.85" />
        <ellipse cx="133" cy="394" rx="42" ry="9" fill={deep} opacity="0.4" />
        <rect x="228" y="410" width="10" height="42" fill={mid} rx="5" />
        <ellipse cx="233" cy="406" rx="30" ry="15" fill={glow} opacity="0.75" />
      </g>
      {/* golden puddle + reflection */}
      <ellipse cx="200" cy="466" rx="150" ry="18" fill={glow} opacity="0.22" />
      <path d="M0 452 Q120 440 210 450 T400 444 V500 H0 Z" fill={deep} opacity="0.85" />
    </Base>
  );
}

/* Hedonites of Slaanesh — a mirrored palace of drapes and chandeliers. */
function VelvetMirror({ className }: PlateProps) {
  const [deep, mid, glow] = ["#120714", "#4b1d55", "#f0a0c8"];
  function Chandelier({ y, s, cls }: { y: number; s: number; cls?: string }) {
    return (
      <g className={cls}>
        <line x1="200" y1={y - 30 * s} x2="200" y2={y} stroke={glow} strokeWidth="1" opacity="0.5" />
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={200 + (i - 3) * 12 * s} cy={y + Math.abs(i - 3) * 4 * s} r={2 * s} fill={glow} opacity="0.85" />
        ))}
        <ellipse cx="200" cy={y} rx={44 * s} ry={12 * s} fill={glow} opacity="0.12" />
      </g>
    );
  }
  return (
    <Base className={className} id="velvet-mirror" deep={deep} mid={mid} sky={{ cx: 200, cy: 150, color: glow, r: 0.6, o: 0.22 }}>
      {/* swagged velvet drapes framing */}
      <g fill={mid} opacity="0.85">
        <path d="M0 0 L120 0 Q100 120 60 150 Q40 90 0 130 Z" />
        <path d="M400 0 L280 0 Q300 120 340 150 Q360 90 400 130 Z" />
        <path d="M120 0 L280 0 Q200 90 200 60 Q200 90 120 0 Z" opacity="0.6" />
      </g>
      {/* the chandelier */}
      <Chandelier y={170} s={1} cls="anim-flicker" />
      {/* polished mirror floor + reflection */}
      <rect x="0" y="360" width="400" height="140" fill={deep} opacity="0.6" />
      <rect x="0" y="360" width="400" height="2.5" fill={glow} opacity="0.28" />
      <g transform="translate(0 720) scale(1 -1)" opacity="0.35">
        <Chandelier y={170} s={1} />
      </g>
      {/* distant fountains as soft glows */}
      <g fill={glow} opacity="0.4">
        <ellipse cx="80" cy="330" rx="20" ry="6" />
        <ellipse cx="320" cy="330" rx="20" ry="6" />
      </g>
    </Base>
  );
}

/* Ogor Mawtribes — a great cauldron in a snow camp at twilight. */
function WinterCauldron({ className }: PlateProps) {
  const [deep, mid, glow] = ["#091018", "#35475a", "#e89a4a"];
  return (
    <Base className={className} id="winter-cauldron" deep={deep} mid={mid} sky={{ cx: 200, cy: 110, color: mid, r: 0.7, o: 0.5 }}>
      <Stars seed={47} count={12} color="#cdd8e8" maxY={150} />
      {/* hide tents flanking */}
      <g fill={deep}>
        <path d="M20 440 L70 320 L120 440 Z" />
        <path d="M300 440 L344 336 L388 440 Z" />
        <path d="M64 340 L70 320 L76 340" fill="none" stroke={deep} strokeWidth="3" />
      </g>
      {/* snow ground */}
      <path d="M0 440 Q120 424 220 436 T400 430 V500 H0 Z" fill={mid} opacity="0.4" />
      {/* fire glow beneath the cauldron */}
      <ellipse cx="200" cy="430" rx="90" ry="40" fill={glow} opacity="0.3" />
      <ellipse cx="200" cy="430" rx="46" ry="18" fill={glow} opacity="0.5" className="anim-flicker" />
      {/* the great cauldron */}
      <g fill={deep}>
        <path d="M120 350 Q120 452 200 452 Q280 452 280 350 Z" />
        <ellipse cx="200" cy="350" rx="80" ry="20" />
        <rect x="150" y="452" width="8" height="26" />
        <rect x="242" y="452" width="8" height="26" />
      </g>
      <ellipse cx="200" cy="350" rx="66" ry="14" fill={glow} opacity="0.35" />
      {/* heavy tracks in the snow */}
      <g stroke={deep} strokeWidth="4" opacity="0.5" strokeLinecap="round">
        <path d="M40 476 l14 8 M70 470 l14 8 M320 474 l14 8 M350 468 l14 8" />
      </g>
      {/* falling snow */}
      <g fill="#cdd8e8">
        {[60, 160, 260, 360].map((x, i) => (
          <circle key={x} cx={x} cy={200} r="1.6" className="anim-drift" style={{ animationDelay: `${i * 1.5}s` }} />
        ))}
      </g>
    </Base>
  );
}

/* Orruk Warclans — standing stones under a green storm, lightning. */
function GreenAvalanche({ className }: PlateProps) {
  const [deep, mid, glow] = ["#071008", "#24451e", "#9ad45a"];
  const stones = [
    { x: 46, y: 300, w: 30, h: 150, r: -6 },
    { x: 110, y: 340, w: 24, h: 110, r: 4 },
    { x: 176, y: 290, w: 38, h: 170, r: -2 },
    { x: 250, y: 330, w: 26, h: 120, r: 7 },
    { x: 320, y: 312, w: 32, h: 140, r: -4 },
    { x: 372, y: 350, w: 20, h: 100, r: 3 },
  ];
  return (
    <Base className={className} id="green-avalanche" deep={deep} mid={mid} sky={{ cx: 200, cy: 120, color: glow, r: 0.7, o: 0.28 }}>
      {/* heavy green thunderclouds */}
      <g fill={deep} opacity="0.7">
        <ellipse cx="110" cy="80" rx="170" ry="52" />
        <ellipse cx="330" cy="60" rx="160" ry="56" />
        <ellipse cx="230" cy="120" rx="130" ry="40" opacity="0.7" />
      </g>
      {/* lightning through the clouds */}
      <g className="anim-bolt">
        <path d="M240 70 L220 150 L242 148 L206 240" fill="none" stroke={glow} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="228" cy="150" rx="120" ry="100" fill={glow} opacity="0.08" />
      </g>
      {/* trampled plain */}
      <path d="M0 440 Q120 424 240 436 T400 430 V500 H0 Z" fill={deep} opacity="0.9" />
      {/* crude standing stones */}
      <g fill={deep}>
        {stones.map((s, i) => (
          <path
            key={i}
            transform={`rotate(${s.r} ${s.x} ${s.y + s.h})`}
            d={`M${s.x - s.w / 2} ${s.y + s.h} L${s.x - s.w / 2 + 3} ${s.y + 10} L${s.x} ${s.y} L${s.x + s.w / 2 - 4} ${s.y + 12} L${s.x + s.w / 2} ${s.y + s.h} Z`}
            opacity={0.95 - (i % 3) * 0.12}
          />
        ))}
      </g>
      {/* muddy tracks */}
      <g stroke={mid} strokeWidth="3" opacity="0.5" strokeLinecap="round">
        <path d="M60 470 l16 6 M150 464 l16 6 M280 468 l16 6" />
      </g>
    </Base>
  );
}

/* ------------------------------------------------------------------ */
/* Warhammer: The Old World — ten original, environment-only plates.  */
/* Shared composition keeps the launch set coherent; each faction gets */
/* its own skyline, landmark, palette, weather, and animated light.     */
/* ------------------------------------------------------------------ */
type OldWorldMotif =
  | "chapel"
  | "necropolis"
  | "hold"
  | "camp"
  | "city"
  | "road"
  | "stones"
  | "forest"
  | "observatory"
  | "compass";

function OldWorldPlate({
  className,
  id,
  deep,
  mid,
  glow,
  motif,
}: PlateProps & {
  id: string;
  deep: string;
  mid: string;
  glow: string;
  motif: OldWorldMotif;
}) {
  const night = motif === "road" || motif === "stones" || motif === "forest" || motif === "observatory";
  return (
    <Base
      className={className}
      id={id}
      deep={deep}
      mid={mid}
      sky={{ cx: motif === "chapel" ? 305 : 210, cy: 105, color: glow, r: 0.72, o: night ? 0.18 : 0.32 }}
    >
      {night && <Stars seed={id.length * 7} count={22} color={glow} maxY={245} />}
      {motif === "chapel" && (
        <>
          <circle cx="310" cy="120" r="42" fill={glow} opacity="0.42" />
          <path d="M0 420 Q90 345 185 398 T400 350 V500 H0 Z" fill={mid} opacity="0.72" />
          <g fill={deep}>
            <rect x="54" y="280" width="104" height="104" />
            <path d="M44 280 L106 225 L168 280 Z" />
            <rect x="92" y="205" width="28" height="82" />
            <path d="M88 205 L106 178 L124 205 Z" />
          </g>
          <g stroke={glow} strokeWidth="2" opacity="0.8"><path d="M205 210 V350 M205 220 Q240 238 262 218 V270 Q238 288 205 266" /></g>
        </>
      )}
      {motif === "necropolis" && (
        <>
          <circle cx="300" cy="92" r="48" fill={glow} opacity="0.55" />
          <path d="M0 385 Q125 348 230 390 T400 365 V500 H0 Z" fill={mid} opacity="0.55" />
          <g fill={deep}><path d="M90 385 L145 205 L200 385 Z" /><path d="M220 390 L260 265 L300 390 Z" /><rect x="42" y="265" width="14" height="125" /><path d="M38 265 L49 235 L60 265 Z" /></g>
          <path d="M140 385 V318 Q145 282 175 282 Q205 282 210 318 V385" fill={glow} opacity="0.25" className="anim-flicker" />
        </>
      )}
      {motif === "hold" && (
        <>
          <path d="M0 0 L82 70 L45 180 L100 245 L58 500 H0 Z M400 0 L320 80 L360 185 L305 252 L345 500 H400 Z" fill={deep} />
          <path d="M85 500 V245 Q200 100 315 245 V500 Z" fill={deep} opacity="0.88" />
          <path d="M128 500 V278 Q200 190 272 278 V500" fill="none" stroke={glow} strokeWidth="5" opacity="0.7" />
          <ellipse cx="200" cy="460" rx="150" ry="20" fill={glow} opacity="0.24" className="anim-flicker" />
        </>
      )}
      {motif === "camp" && (
        <>
          <path d="M0 420 Q95 360 205 408 T400 370 V500 H0 Z" fill={deep} />
          <g fill={mid}>{[45, 120, 285, 350].map((x, i) => <path key={x} d={`M${x - 35} 420 L${x} ${300 + (i % 2) * 35} L${x + 38} 420 Z`} />)}</g>
          <path d="M205 420 V202 M205 215 Q250 230 274 208 V272 Q245 289 205 260" fill="none" stroke={glow} strokeWidth="4" />
          <g fill={glow}>{[70, 168, 305].map((x, i) => <circle key={x} cx={x} cy={430} r="9" opacity="0.7" className="anim-flicker" style={{ animationDelay: `${i * 0.7}s` }} />)}</g>
        </>
      )}
      {motif === "city" && (
        <>
          <path d="M0 500 V310 H55 V255 H90 V330 H140 V225 H182 V305 H230 V245 H280 V320 H332 V270 H375 V220 H400 V500 Z" fill={deep} />
          <path d="M0 415 Q95 385 190 420 T400 405" fill="none" stroke={mid} strokeWidth="18" opacity="0.7" />
          <g fill={glow}>{Array.from({ length: 18 }, (_, i) => <rect key={i} x={18 + (i % 9) * 43} y={330 + Math.floor(i / 9) * 42 - (i % 3) * 12} width="6" height="9" opacity="0.75" className={i % 4 === 0 ? "anim-flicker" : undefined} />)}</g>
        </>
      )}
      {motif === "road" && (
        <>
          <path d="M155 500 L190 220 L212 220 L260 500 Z" fill={mid} opacity="0.65" />
          <path d="M0 430 Q115 375 210 420 T400 370 V500 H0 Z" fill={deep} />
          <path d="M290 10 L278 72 L296 70 L262 160" fill="none" stroke={glow} strokeWidth="5" className="anim-bolt" />
          <ellipse cx="278" cy="90" rx="110" ry="70" fill={glow} opacity="0.1" />
          <g fill={mid}>{[78, 325].map((x) => <path key={x} d={`M${x - 15} 430 L${x - 10} 275 L${x + 10} 260 L${x + 16} 430 Z`} />)}</g>
        </>
      )}
      {motif === "stones" && (
        <>
          <path d="M0 425 Q100 385 210 418 T400 390 V500 H0 Z" fill={deep} />
          <g fill={mid}>{[55, 125, 210, 292, 360].map((x, i) => <path key={x} d={`M${x - 18} 430 L${x - 12} ${255 + (i % 2) * 42} L${x + 8} ${238 + (i % 2) * 42} L${x + 18} 430 Z`} opacity={0.95 - i * 0.08} />)}</g>
          <ellipse cx="205" cy="420" rx="82" ry="26" fill={glow} opacity="0.38" className="anim-flicker" />
          <path d="M130 205 Q200 155 270 205" fill="none" stroke={glow} strokeWidth="2" opacity="0.3" />
        </>
      )}
      {motif === "forest" && (
        <>
          <g fill={deep}>{[20, 82, 168, 270, 350].map((x, i) => <path key={x} d={`M${x} 500 Q${x - 18} 380 ${x + 4} ${130 + (i % 3) * 35} Q${x + 28} 360 ${x + 38} 500 Z`} />)}</g>
          <path d="M120 500 Q175 390 210 300 Q245 395 292 500 Z" fill={mid} opacity="0.34" />
          <g fill={glow}>{[110, 184, 248, 320].map((x, i) => <circle key={x} cx={x} cy={235 + (i % 2) * 60} r="4" opacity="0.8" className="anim-twinkle" style={{ animationDelay: `${i}s` }} />)}</g>
        </>
      )}
      {motif === "observatory" && (
        <>
          <path d="M0 440 Q125 405 220 438 T400 420 V500 H0 Z" fill={deep} />
          <g fill={deep}><rect x="116" y="260" width="168" height="180" /><path d="M100 260 L200 205 L300 260 Z" /><rect x="185" y="145" width="30" height="88" /></g>
          <g fill="none" stroke={glow} opacity="0.8"><ellipse cx="200" cy="180" rx="82" ry="26" strokeWidth="4" transform="rotate(-18 200 180)" /><ellipse cx="200" cy="180" rx="30" ry="82" strokeWidth="3" transform="rotate(25 200 180)" /><circle cx="200" cy="180" r="8" fill={glow} /></g>
          <path d="M0 458 Q100 440 200 458 T400 452" fill="none" stroke={glow} strokeWidth="3" opacity="0.3" />
        </>
      )}
      {motif === "compass" && (
        <>
          <path d="M0 500 V320 L55 290 V260 L120 235 V310 L175 280 V205 L230 235 V300 L290 250 V300 L350 270 V215 L400 250 V500 Z" fill={deep} />
          <g transform="translate(205 190)" fill="none" stroke={glow}><circle r="88" strokeWidth="4" opacity="0.62" /><circle r="54" strokeWidth="2" opacity="0.45" /><path d="M0 -110 V110 M-110 0 H110 M-78 -78 L78 78 M78 -78 L-78 78" strokeWidth="2" opacity="0.55" /><path d="M0 -72 L12 0 L0 72 L-12 0 Z" fill={glow} opacity="0.45" className="anim-flicker" /></g>
          <g fill={glow}>{[48, 108, 300, 355].map((x, i) => <circle key={x} cx={x} cy={350 + (i % 2) * 38} r="4" className="anim-twinkle" />)}</g>
        </>
      )}
      <path d="M0 470 Q100 450 200 468 T400 458 V500 H0 Z" fill={deep} opacity="0.82" />
    </Base>
  );
}

const GildedCharge = (props: PlateProps) => <OldWorldPlate {...props} id="gilded-charge" deep="#0b1020" mid="#294b7a" glow="#f0cf78" motif="chapel" />;
const SunlessDynasty = (props: PlateProps) => <OldWorldPlate {...props} id="sunless-dynasty" deep="#100d08" mid="#6b4a20" glow="#55d5c8" motif="necropolis" />;
const MountainLedger = (props: PlateProps) => <OldWorldPlate {...props} id="mountain-ledger" deep="#0c1012" mid="#3e4b50" glow="#d79a45" motif="hold" />;
const CrookedMuster = (props: PlateProps) => <OldWorldPlate {...props} id="crooked-muster" deep="#0d1007" mid="#3d501d" glow="#d8a33d" motif="camp" />;
const HundredHearths = (props: PlateProps) => <OldWorldPlate {...props} id="hundred-hearths" deep="#101318" mid="#364c62" glow="#e0ad55" motif="city" />;
const IronComet = (props: PlateProps) => <OldWorldPlate {...props} id="iron-comet" deep="#0b0a0d" mid="#3e252b" glow="#e14f3d" motif="road" />;
const ThornedRevel = (props: PlateProps) => <OldWorldPlate {...props} id="thorned-revel" deep="#090d08" mid="#3b321d" glow="#a7c85a" motif="stones" />;
const HiddenBough = (props: PlateProps) => <OldWorldPlate {...props} id="hidden-bough" deep="#07110c" mid="#1f513c" glow="#d4c875" motif="forest" />;
const IvoryAstrolabe = (props: PlateProps) => <OldWorldPlate {...props} id="ivory-astrolabe" deep="#08101c" mid="#31557a" glow="#e8dfb0" motif="observatory" />;
const JadeCompass = (props: PlateProps) => <OldWorldPlate {...props} id="jade-compass" deep="#071310" mid="#246152" glow="#e0b85e" motif="compass" />;

/** Plate registry, keyed by banner id. Banners without a plate fall back to
 * BannerArt's gradient — so new banners can ship before their art does.
 * The first twelve are the hand-crafted originals (do not alter); the rest
 * are the bespoke expansion plates above. */
export const PLATES: Record<string, React.FC<PlateProps>> = {
  "shield-unbroken": ShieldUnbroken,
  "burning-faith": BurningFaith,
  "endless-hunger": EndlessHunger,
  "deathless-crown": DeathlessCrown,
  "roaring-horde": RoaringHorde,
  "veiled-path": VeiledPath,
  "verdant-wrath": VerdantWrath,
  "storms-herald": StormsHerald,
  "iron-oath": IronOath,
  "machine-communion": MachineCommunion,
  "midnight-court": MidnightCourt,
  "cracked-moon": CrackedMoon,
  "blackened-choir": BlackenedChoir,
  "lantern-line": LanternLine,
  "patient-horizon": PatientHorizon,
  "glass-knife": GlassKnife,
  "subterranean-star": SubterraneanStar,
  "towering-vow": ToweringVow,
  "ashen-tithe": AshenTithe,
  "silver-sanctum": SilverSanctum,
  "auric-watch": AuricWatch,
  "garden-of-rust": GardenOfRust,
  "sapphire-labyrinth": SapphireLabyrinth,
  "red-urgency": RedUrgency,
  "skittering-crown": SkitteringCrown,
  "star-coil": StarCoil,
  "market-walls": MarketWalls,
  "sky-ledger": SkyLedger,
  "ember-vault": EmberVault,
  "dawn-prism": DawnPrism,
  "crimson-oracle": CrimsonOracle,
  "hollow-bell": HollowBell,
  "bone-accounting": BoneAccounting,
  "iron-tempest": IronTempest,
  "brass-thunder": BrassThunder,
  "changing-stair": ChangingStair,
  "rain-of-spores": RainOfSpores,
  "velvet-mirror": VelvetMirror,
  "winter-cauldron": WinterCauldron,
  "green-avalanche": GreenAvalanche,
  "gilded-charge": GildedCharge,
  "sunless-dynasty": SunlessDynasty,
  "mountain-ledger": MountainLedger,
  "crooked-muster": CrookedMuster,
  "hundred-hearths": HundredHearths,
  "iron-comet": IronComet,
  "thorned-revel": ThornedRevel,
  "hidden-bough": HiddenBough,
  "ivory-astrolabe": IvoryAstrolabe,
  "jade-compass": JadeCompass,
};
