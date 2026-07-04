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
/* Expansion plates — symbolic variants for additive faction banners   */
/* ------------------------------------------------------------------ */
type ExpansionPlateTheme = {
  deep: string;
  mid: string;
  glow: string;
  motif: "arches" | "lanterns" | "horizon" | "spires" | "tunnels" | "court" | "storm" | "sanctum" | "gate" | "garden" | "maze" | "canyon";
  seed: number;
};

function ExpansionPlate({ className, theme }: PlateProps & { theme: ExpansionPlateTheme }) {
  const marks = Array.from({ length: 7 }, (_, i) => ({
    x: 54 + i * 48,
    h: 34 + ((theme.seed + i * 17) % 76),
    delay: (i % 4) * 0.7,
  }));
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={`exp-bg-${theme.seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.deep} />
          <stop offset="0.62" stopColor={theme.mid} />
          <stop offset="1" stopColor={theme.deep} />
        </linearGradient>
        <radialGradient id={`exp-glow-${theme.seed}`} cx="0.5" cy="0.72" r="0.65">
          <stop offset="0" stopColor={theme.glow} stopOpacity="0.42" />
          <stop offset="1" stopColor={theme.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#exp-bg-${theme.seed})`} />
      <Stars seed={theme.seed} count={theme.motif === "horizon" || theme.motif === "sanctum" ? 24 : 12} color={theme.glow} maxY={190} />
      <ellipse cx="200" cy="365" rx="230" ry="150" fill={`url(#exp-glow-${theme.seed})`} />
      {theme.motif === "horizon" && <path d="M0 300 Q110 255 210 285 T400 250 V500 H0 Z" fill={theme.deep} opacity="0.82" />}
      {theme.motif === "canyon" && <><path d="M0 500 L0 250 L95 330 L145 500 Z" fill={theme.deep} opacity="0.9"/><path d="M400 500 L400 220 L295 320 L250 500 Z" fill={theme.deep} opacity="0.88"/></>}
      {theme.motif === "garden" && <g fill={theme.glow} opacity="0.45">{marks.map((m,i)=><circle key={i} cx={m.x} cy={420-m.h/3} r={3+(i%3)} className="anim-twinkle" style={{animationDelay:`${m.delay}s`}} />)}</g>}
      {theme.motif === "storm" && <g stroke={theme.glow} strokeWidth="3" opacity="0.5" className="anim-flicker"><path d="M245 0 L205 128 H235 L180 270"/><path d="M330 70 L296 162 H320 L275 278"/></g>}
      {theme.motif === "maze" && <g fill="none" stroke={theme.glow} opacity="0.45"><path d="M70 420 H330 V365 H115 V305 H295 V250 H160 V190 H245"/><path d="M95 455 H305" strokeDasharray="6 10"/></g>}
      {(theme.motif === "arches" || theme.motif === "sanctum" || theme.motif === "gate") && <g fill={theme.deep} opacity="0.9"><path d="M34 500 V260 Q72 190 110 260 V500 Z"/><path d="M145 500 V220 Q200 130 255 220 V500 Z"/><path d="M290 500 V260 Q328 190 366 260 V500 Z"/></g>}
      {(theme.motif === "spires" || theme.motif === "court") && <g fill={theme.deep} opacity="0.88">{marks.map((m,i)=><path key={i} d={`M${m.x-16} 500 L${m.x-6} ${360-m.h} L${m.x} ${315-m.h} L${m.x+6} ${360-m.h} L${m.x+16} 500 Z`} />)}</g>}
      {theme.motif === "tunnels" && <g fill="none" stroke={theme.glow} opacity="0.38"><path d="M0 390 C85 330 130 420 205 360 S330 330 400 380"/><path d="M0 440 C95 390 150 468 230 420 S330 395 400 430"/><path d="M55 280 V500 M205 245 V500 M340 300 V500"/></g>}
      {theme.motif === "lanterns" && <g>{marks.map((m,i)=><g key={i} className="anim-flicker" style={{animationDelay:`${m.delay}s`}}><line x1={m.x} y1="255" x2={m.x} y2={410-m.h/2} stroke={theme.deep}/><circle cx={m.x} cy={410-m.h/2} r="7" fill={theme.glow} opacity="0.75"/><circle cx={m.x} cy={410-m.h/2} r="18" fill={theme.glow} opacity="0.13"/></g>)}</g>}
      <path d="M0 500 Q95 466 200 478 T400 462 V500 Z" fill={theme.deep} opacity="0.92" />
      <path d="M40 454 Q160 430 230 448 T360 420" fill="none" stroke={theme.glow} strokeWidth="1.5" strokeDasharray="5 9" opacity="0.42" />
      <g fill={theme.glow}>{marks.slice(0,5).map((m,i)=><circle key={i} cx={m.x+12} cy={475-(i%3)*28} r="1.8" className="anim-drift" style={{animationDelay:`${m.delay}s`}} />)}</g>
    </Svg>
  );
}

const EXPANSION_PLATE_THEMES: Record<string, ExpansionPlateTheme> = {
  "blackened-choir": { deep: "#10070a", mid: "#3d1020", glow: "#d14a32", motif: "arches", seed: 21 },
  "lantern-line": { deep: "#0b1010", mid: "#2f3a28", glow: "#d6b36a", motif: "lanterns", seed: 22 },
  "patient-horizon": { deep: "#07131a", mid: "#1e4f66", glow: "#f0b86a", motif: "horizon", seed: 23 },
  "glass-knife": { deep: "#070711", mid: "#30164f", glow: "#73f0d8", motif: "spires", seed: 24 },
  "subterranean-star": { deep: "#0d0b12", mid: "#3b2a54", glow: "#d8c26a", motif: "tunnels", seed: 25 },
  "towering-vow": { deep: "#111018", mid: "#5a2630", glow: "#e0bd73", motif: "court", seed: 26 },
  "ashen-tithe": { deep: "#0b0808", mid: "#3a2a1f", glow: "#9bd46a", motif: "storm", seed: 27 },
  "silver-sanctum": { deep: "#0a0d12", mid: "#344457", glow: "#9fd8ff", motif: "sanctum", seed: 28 },
  "auric-watch": { deep: "#120d06", mid: "#6b4318", glow: "#f0d37a", motif: "gate", seed: 29 },
  "garden-of-rust": { deep: "#0d1008", mid: "#4b4a22", glow: "#b6c96a", motif: "garden", seed: 30 },
  "sapphire-labyrinth": { deep: "#06101d", mid: "#123d7a", glow: "#d8b45a", motif: "maze", seed: 31 },
  "red-urgency": { deep: "#120606", mid: "#6a1717", glow: "#f06a32", motif: "canyon", seed: 32 },
  "skittering-crown": { deep: "#080d0a", mid: "#264329", glow: "#7ee06a", motif: "arches", seed: 33 },
  "star-coil": { deep: "#061512", mid: "#1f5a4b", glow: "#82e8ff", motif: "lanterns", seed: 34 },
  "market-walls": { deep: "#0d1014", mid: "#354256", glow: "#d6a85f", motif: "horizon", seed: 35 },
  "sky-ledger": { deep: "#081018", mid: "#4f3b22", glow: "#f0b45f", motif: "spires", seed: 36 },
  "ember-vault": { deep: "#120805", mid: "#5a2112", glow: "#ff9a3d", motif: "tunnels", seed: 37 },
  "dawn-prism": { deep: "#071118", mid: "#31506a", glow: "#f2e6a0", motif: "court", seed: 38 },
  "crimson-oracle": { deep: "#12070d", mid: "#5c1832", glow: "#f07a8a", motif: "storm", seed: 39 },
  "hollow-bell": { deep: "#061013", mid: "#1d3a45", glow: "#a8f0e8", motif: "sanctum", seed: 40 },
  "bone-accounting": { deep: "#0d0c0a", mid: "#4a4032", glow: "#d8c190", motif: "gate", seed: 41 },
  "iron-tempest": { deep: "#09090c", mid: "#30303a", glow: "#b6a06a", motif: "garden", seed: 42 },
  "brass-thunder": { deep: "#130605", mid: "#6b1810", glow: "#e0a13d", motif: "maze", seed: 43 },
  "changing-stair": { deep: "#070a18", mid: "#283c8a", glow: "#ff7ad8", motif: "canyon", seed: 44 },
  "rain-of-spores": { deep: "#0b1108", mid: "#3f5126", glow: "#d6c66a", motif: "arches", seed: 45 },
  "velvet-mirror": { deep: "#120714", mid: "#4b1d55", glow: "#f0a0c8", motif: "lanterns", seed: 46 },
  "winter-cauldron": { deep: "#091018", mid: "#35475a", glow: "#e89a4a", motif: "horizon", seed: 47 },
  "green-avalanche": { deep: "#071008", mid: "#24451e", glow: "#9ad45a", motif: "spires", seed: 48 },
};

const expansionPlate = (id: string): React.FC<PlateProps> =>
  function ExpansionPlateForBanner(props: PlateProps) {
    return <ExpansionPlate {...props} theme={EXPANSION_PLATE_THEMES[id]} />;
  };

/** Plate registry, keyed by banner id. Banners without a plate fall back to
 * BannerArt's gradient — so new banners can ship before their art does. */
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
  "blackened-choir": expansionPlate("blackened-choir"),
  "lantern-line": expansionPlate("lantern-line"),
  "patient-horizon": expansionPlate("patient-horizon"),
  "glass-knife": expansionPlate("glass-knife"),
  "subterranean-star": expansionPlate("subterranean-star"),
  "towering-vow": expansionPlate("towering-vow"),
  "ashen-tithe": expansionPlate("ashen-tithe"),
  "silver-sanctum": expansionPlate("silver-sanctum"),
  "auric-watch": expansionPlate("auric-watch"),
  "garden-of-rust": expansionPlate("garden-of-rust"),
  "sapphire-labyrinth": expansionPlate("sapphire-labyrinth"),
  "red-urgency": expansionPlate("red-urgency"),
  "skittering-crown": expansionPlate("skittering-crown"),
  "star-coil": expansionPlate("star-coil"),
  "market-walls": expansionPlate("market-walls"),
  "sky-ledger": expansionPlate("sky-ledger"),
  "ember-vault": expansionPlate("ember-vault"),
  "dawn-prism": expansionPlate("dawn-prism"),
  "crimson-oracle": expansionPlate("crimson-oracle"),
  "hollow-bell": expansionPlate("hollow-bell"),
  "bone-accounting": expansionPlate("bone-accounting"),
  "iron-tempest": expansionPlate("iron-tempest"),
  "brass-thunder": expansionPlate("brass-thunder"),
  "changing-stair": expansionPlate("changing-stair"),
  "rain-of-spores": expansionPlate("rain-of-spores"),
  "velvet-mirror": expansionPlate("velvet-mirror"),
  "winter-cauldron": expansionPlate("winter-cauldron"),
  "green-avalanche": expansionPlate("green-avalanche"),
};
