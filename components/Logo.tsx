'use client';

interface LogoProps {
  layout?: 'horizontal' | 'vertical' | 'icon-only';
  className?: string;
  size?: number;
}

export default function Logo({ layout = 'horizontal', className = '', size = 32 }: LogoProps) {
  // SVG Icon Mark only (the TN monogram)
  const IconMark = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        {/* Purple to blue gradient matching the logo N */}
        <linearGradient id="nGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        {/* Fade gradient for speed lines */}
        <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(124, 92, 255, 0.1)" />
          <stop offset="100%" stopColor="#7C5CFF" />
        </linearGradient>
      </defs>

      {/* Rounded speed lines on the left */}
      <rect x="23" y="30" width="17" height="2.5" rx="1.25" fill="url(#speedGrad)" />
      <rect x="21" y="34" width="19" height="2.5" rx="1.25" fill="url(#speedGrad)" />
      <rect x="14" y="38" width="24" height="2.5" rx="1.25" fill="url(#speedGrad)" />
      <rect x="25" y="42" width="10" height="2.5" rx="1.25" fill="url(#speedGrad)" />
      <rect x="30" y="46" width="4" height="2.5" rx="1.25" fill="url(#speedGrad)" />

      {/* Letter T (White) */}
      <path
        d="M28 20 H68 C60 23 52 28 47 34 L33 58 H23 L33 36 H18 L21 30 Z"
        fill="#FAFAFA"
      />

      {/* Letter N (Blue-Purple Gradient) */}
      <path
        d="M42 58 L51 35 H60 L51 53 L69 35 H79 L69 58 H60 L68 40 L50 58 Z"
        fill="url(#nGrad)"
      />
    </svg>
  );

  if (layout === 'icon-only') {
    return <IconMark />;
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Monogram */}
        <div className="mb-6">
          <Logo layout="icon-only" size={size * 2.2} />
        </div>
        
        {/* Full typography recreated in SVG for pixel-perfection */}
        <svg
          width={size * 5}
          height={size * 1.1}
          viewBox="0 0 152 35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="textNovaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#7C5CFF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          {/* "TYPE" (White) */}
          <g fill="#FAFAFA">
            {/* T */}
            <path d="M 0 0 H 16 V 3 H 9.5 V 18 H 6.5 V 3 H 0 Z" />
            {/* Y */}
            <path d="M 19 0 L 25 8 V 18 H 29 V 8 L 35 0 H 31.5 L 27 6 L 22.5 0 Z" />
            {/* P */}
            <path d="M 38 0 H 52 C 55 0 55 8 52 8 H 42 V 18 H 38 Z M 42 3 H 50.5 C 51.5 3 51.5 5 50.5 5 H 42 Z" />
            {/* E */}
            <path d="M 57 0 H 73 V 3 H 61 V 7.5 H 70.5 V 10.5 H 61 V 15 H 73 V 18 H 57 Z" />
          </g>

          {/* "NOVA" (Gradient) */}
          <g fill="url(#textNovaGrad)">
            {/* N */}
            <path d="M 78 18 V 0 H 81.5 L 90.5 14 V 0 H 94 V 18 H 90.5 L 81.5 4 V 18 Z" />
            {/* O */}
            <path d="M 101 0 H 109 C 112.5 0 113 2.5 113 5 V 13 C 113 15.5 112.5 18 109 18 H 101 C 97.5 18 97 15.5 97 13 V 5 C 97 2.5 97.5 0 101 0 Z M 101 3 C 100.2 3 100 4 100 5 V 13 C 100 14 100.2 15 101 15 H 109 C 109.8 15 110 14 110 13 V 5 C 110 4 109.8 3 109 3 Z" />
            {/* V */}
            <path d="M 116 0 H 120.2 L 124 14.5 L 127.8 0 H 132 L 126.5 18 H 121.5 Z" />
            {/* Λ (A) */}
            <path d="M 135 18 L 141.2 0 H 144.8 L 151 18 H 147 L 143 6.5 L 139 18 Z" />
          </g>

          {/* Subtext: "TYPE FASTER. GROW BETTER." */}
          <text
            x="76"
            y="32"
            fill="#A1A1AA"
            fontSize="4.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
            letterSpacing="0.25em"
            textAnchor="middle"
            className="opacity-75"
          >
            TYPE FASTER. GROW BETTER.
          </text>
        </svg>
      </div>
    );
  }

  // Default horizontal (Icon + Text beside it)
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <IconMark />
      {/* Recreated futuristic typography in SVG */}
      <svg
        width={size * 3.5}
        height={size * 0.45}
        viewBox="0 0 152 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 hidden sm:block"
      >
        <defs>
          <linearGradient id="textNovaGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* "TYPE" (White) */}
        <g fill="#FAFAFA">
          <path d="M 0 0 H 16 V 3 H 9.5 V 18 H 6.5 V 3 H 0 Z" />
          <path d="M 19 0 L 25 8 V 18 H 29 V 8 L 35 0 H 31.5 L 27 6 L 22.5 0 Z" />
          <path d="M 38 0 H 52 C 55 0 55 8 52 8 H 42 V 18 H 38 Z M 42 3 H 50.5 C 51.5 3 51.5 5 50.5 5 H 42 Z" />
          <path d="M 57 0 H 73 V 3 H 61 V 7.5 H 70.5 V 10.5 H 61 V 15 H 73 V 18 H 57 Z" />
        </g>

        {/* "NOVA" (Gradient) */}
        <g fill="url(#textNovaGrad2)">
          <path d="M 78 18 V 0 H 81.5 L 90.5 14 V 0 H 94 V 18 H 90.5 L 81.5 4 V 18 Z" />
          <path d="M 101 0 H 109 C 112.5 0 113 2.5 113 5 V 13 C 113 15.5 112.5 18 109 18 H 101 C 97.5 18 97 15.5 97 13 V 5 C 97 2.5 97.5 0 101 0 Z M 101 3 C 100.2 3 100 4 100 5 V 13 C 100 14 100.2 15 101 15 H 109 C 109.8 15 110 14 110 13 V 5 C 110 4 109.8 3 109 3 Z" />
          <path d="M 116 0 H 120.2 L 124 14.5 L 127.8 0 H 132 L 126.5 18 H 121.5 Z" />
          <path d="M 135 18 L 141.2 0 H 144.8 L 151 18 H 147 L 143 6.5 L 139 18 Z" />
        </g>
      </svg>
    </div>
  );
}
