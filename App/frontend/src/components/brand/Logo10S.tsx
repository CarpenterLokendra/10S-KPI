export function Logo10S() {
  return (
    <div className="relative w-40 h-52 mx-auto mb-8 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6))
                    drop-shadow(0 0 35px rgba(251, 191, 36, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(251, 191, 36, 0.8))
                    drop-shadow(0 0 50px rgba(251, 191, 36, 0.4));
          }
        }

        @keyframes shine-sweep {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }

        .logo-card {
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))
                  drop-shadow(0 0 50px rgba(251, 191, 36, 0.2));
          position: relative;
        }

        .glow-element {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .shine-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-25deg);
          animation: shine-sweep 3s infinite;
          pointer-events: none;
          border-radius: 16px;
        }

        .text-gradient {
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.5));
        }
      `}</style>

      <svg
        viewBox="0 0 280 360"
        className="w-full h-full logo-card glow-element"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clipping path to contain effects within card */}
          <clipPath id="cardClip">
            <rect x="10" y="10" width="260" height="340" rx="16" />
          </clipPath>

          {/* Enhanced Gradients */}
          <linearGradient id="cardGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d4941e" />
          </linearGradient>

          <linearGradient id="cardPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          <linearGradient id="cardShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          {/* Radial glow behind 10S */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.3)" />
            <stop offset="70%" stopColor="rgba(251, 191, 36, 0.1)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </radialGradient>

          {/* Advanced filters */}
          <filter id="glow-outer">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-inner">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feOffset in="coloredBlur" dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="offsetblur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadow-3d">
            <feDropShadow dx="2" dy="6" stdDeviation="8" floodOpacity="0.4" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>

        <g clipPath="url(#cardClip)">
          {/* 3D Shadow effect */}
          <rect
            x="10"
            y="15"
            width="260"
            height="340"
            rx="16"
            fill="rgba(0, 0, 0, 0.2)"
            filter="url(#shadow-3d)"
          />

        {/* Main card background - Glass + Neon */}
        <rect
          x="10"
          y="10"
          width="260"
          height="340"
          rx="16"
          fill="url(#cardPurple)"
          stroke="url(#cardGold)"
          strokeWidth="3"
          filter="url(#glow-outer)"
        />

        {/* Inner glass shine */}
        <rect
          x="14"
          y="14"
          width="252"
          height="332"
          rx="14"
          fill="url(#cardShine)"
          opacity="0.15"
        />

        {/* Premium inner glow */}
        <rect
          x="16"
          y="16"
          width="248"
          height="328"
          rx="13"
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
          filter="url(#glow-inner)"
        />

        {/* Pattern/texture overlay */}
        <rect
          x="15"
          y="15"
          width="250"
          height="330"
          rx="14"
          fill="url(#cardPurple)"
          opacity="0.3"
        />

        {/* ========== TOP CORNER ORNAMENTS ========== */}

        {/* Top Left - Enhanced */}
        <g opacity="0.85" filter="url(#glow-outer)">
          <circle cx="35" cy="35" r="14" fill="none" stroke="url(#cardGold)" strokeWidth="2.5" />
          <circle cx="35" cy="35" r="9" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" opacity="0.7" />
          <circle cx="35" cy="35" r="5" fill="url(#cardGold)" opacity="0.8" />
          <path
            d="M 25 35 L 45 35 M 35 25 L 35 45"
            stroke="url(#cardGold)"
            strokeWidth="2"
            opacity="0.9"
            strokeLinecap="round"
          />
        </g>

        {/* Top Right - Enhanced */}
        <g opacity="0.85" filter="url(#glow-outer)">
          <circle cx="245" cy="35" r="14" fill="none" stroke="url(#cardGold)" strokeWidth="2.5" />
          <circle cx="245" cy="35" r="9" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" opacity="0.7" />
          <circle cx="245" cy="35" r="5" fill="url(#cardGold)" opacity="0.8" />
          <path
            d="M 235 35 L 255 35 M 245 25 L 245 45"
            stroke="url(#cardGold)"
            strokeWidth="2"
            opacity="0.9"
            strokeLinecap="round"
          />
        </g>

        {/* Bottom Left - Enhanced */}
        <g opacity="0.85" filter="url(#glow-outer)">
          <circle cx="35" cy="325" r="14" fill="none" stroke="url(#cardGold)" strokeWidth="2.5" />
          <circle cx="35" cy="325" r="9" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" opacity="0.7" />
          <circle cx="35" cy="325" r="5" fill="url(#cardGold)" opacity="0.8" />
          <path
            d="M 25 325 L 45 325 M 35 315 L 35 335"
            stroke="url(#cardGold)"
            strokeWidth="2"
            opacity="0.9"
            strokeLinecap="round"
          />
        </g>

        {/* Bottom Right - Enhanced */}
        <g opacity="0.85" filter="url(#glow-outer)">
          <circle cx="245" cy="325" r="14" fill="none" stroke="url(#cardGold)" strokeWidth="2.5" />
          <circle cx="245" cy="325" r="9" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" opacity="0.7" />
          <circle cx="245" cy="325" r="5" fill="url(#cardGold)" opacity="0.8" />
          <path
            d="M 235 325 L 255 325 M 245 315 L 245 335"
            stroke="url(#cardGold)"
            strokeWidth="2"
            opacity="0.9"
            strokeLinecap="round"
          />
        </g>

        {/* ========== TOP DECORATIVE ELEMENTS ========== */}
        <g opacity="0.65" filter="url(#glow-outer)">
          <circle cx="70" cy="45" r="5" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" />
          <circle cx="140" cy="38" r="6.5" fill="none" stroke="url(#cardGold)" strokeWidth="2" />
          <circle cx="210" cy="45" r="5" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" />
        </g>

        {/* ========== BOTTOM DECORATIVE ELEMENTS ========== */}
        <g opacity="0.65" filter="url(#glow-outer)">
          <circle cx="70" cy="315" r="5" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" />
          <circle cx="140" cy="322" r="6.5" fill="none" stroke="url(#cardGold)" strokeWidth="2" />
          <circle cx="210" cy="315" r="5" fill="none" stroke="url(#cardGold)" strokeWidth="1.5" />
        </g>

        {/* Top decorative line */}
        <line
          x1="45"
          y1="58"
          x2="235"
          y2="58"
          stroke="url(#cardGold)"
          strokeWidth="2.5"
          opacity="0.6"
          filter="url(#glow-outer)"
          strokeLinecap="round"
        />

        {/* Bottom decorative line */}
        <line
          x1="45"
          y1="302"
          x2="235"
          y2="302"
          stroke="url(#cardGold)"
          strokeWidth="2.5"
          opacity="0.6"
          filter="url(#glow-outer)"
          strokeLinecap="round"
        />

        {/* Side decorative lines */}
        <line
          x1="18"
          y1="155"
          x2="18"
          y2="205"
          stroke="url(#cardGold)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <line
          x1="262"
          y1="155"
          x2="262"
          y2="205"
          stroke="url(#cardGold)"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* ========== CENTER CIRCLE WITH GLOW ========== */}

        {/* Radial glow background */}
        <circle cx="140" cy="180" r="105" fill="url(#centerGlow)" />

        {/* Center circle - Outer ring */}
        <circle
          cx="140"
          cy="180"
          r="110"
          fill="none"
          stroke="url(#cardGold)"
          strokeWidth="3"
          opacity="0.8"
          filter="url(#glow-outer)"
        />

        {/* Center circle - Middle ring */}
        <circle
          cx="140"
          cy="180"
          r="100"
          fill="none"
          stroke="url(#cardGold)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Center circle - Inner ring */}
        <circle
          cx="140"
          cy="180"
          r="90"
          fill="none"
          stroke="url(#cardGold)"
          strokeWidth="1"
          opacity="0.25"
        />

        {/* Side accent dots */}
        <circle cx="55" cy="180" r="3.5" fill="url(#cardGold)" opacity="0.7" filter="url(#glow-outer)" />
        <circle cx="225" cy="180" r="3.5" fill="url(#cardGold)" opacity="0.7" filter="url(#glow-outer)" />

        {/* ========== 10S TEXT WITH GRADIENT ========== */}
        <text
          x="140"
          y="195"
          fontSize="140"
          fontWeight="900"
          fill="url(#cardGold)"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Rajdhani, system-ui"
          letterSpacing="6"
          filter="url(#glow-outer)"
        >
          10S
        </text>
        </g>
      </svg>

      {/* Shine sweep effect */}
      <div className="shine-effect" />
    </div>
  )
}
