import React from 'react';

const paths = {
  temple: (
    <>
      <path d="M4 9.5h16" />
      <path d="M6 9.5 12 5l6 4.5" />
      <path d="M7 9.5v7" />
      <path d="M11 9.5v7" />
      <path d="M15 9.5v7" />
      <path d="M19 9.5v7" />
      <path d="M5 16.5h14" />
      <path d="M3.5 19h17" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </>
  ),
  shuffle: (
    <>
      <path d="M4 7h2.8c2.7 0 3.9 2.2 5.1 5s2.4 5 5.1 5H20" />
      <path d="M17 14l3 3-3 3" />
      <path d="M4 17h2.8c1.5 0 2.6-.7 3.4-1.9" />
      <path d="M13.8 8.9C14.6 7.7 15.7 7 17.2 7H20" />
      <path d="M17 4l3 3-3 3" />
    </>
  ),
  library: (
    <>
      <path d="M5 5.5h5.2c1 0 1.8.8 1.8 1.8v11.2c-.5-.8-1.3-1.2-2.3-1.2H5z" />
      <path d="M19 5.5h-5.2c-1 0-1.8.8-1.8 1.8v11.2c.5-.8 1.3-1.2 2.3-1.2H19z" />
      <path d="M8 8.5h1.8M15.2 8.5H17M8 11.5h1.8M15.2 11.5H17" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" />
      <circle cx="12" cy="12" r=".8" />
    </>
  ),
  image: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m6.5 17 4-4 2.8 2.8 2.2-2.2L20 18" />
    </>
  ),
  bell: (
    <>
      <path d="M18 10.5a6 6 0 0 0-12 0c0 5-2 5.8-2 5.8h16s-2-.8-2-5.8" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  share: (
    <>
      <path d="M12 5v9" />
      <path d="m8.5 8.5L12 5l3.5 3.5" />
      <path d="M5 13.5V18a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18v-4.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8.5 10.5L12 14l3.5-3.5" />
      <path d="M5 17.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-1.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M5 15.5V6.5A1.5 1.5 0 0 1 6.5 5h9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  chevronDown: <path d="m6.5 9 5.5 5.5L17.5 9" />,
  x: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12s3.2-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.2 5.5-9.2 5.5S2.8 12 2.8 12z" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3.5 3.5 20.5 20.5" />
      <path d="M9.2 5.1A10.5 10.5 0 0 1 12 4.7c6 0 9.2 5.3 9.2 5.3a16 16 0 0 1-3.1 3.7" />
      <path d="M14.2 14.2A3 3 0 0 1 9.8 9.8" />
      <path d="M6.5 7.2A15.4 15.4 0 0 0 2.8 12s3.2 5.3 9.2 5.3c1.2 0 2.3-.2 3.3-.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 0 1-13.6 5.7" />
      <path d="M4 12A8 8 0 0 1 17.6 6.3" />
      <path d="M17.5 2.8v3.8h-3.8" />
      <path d="M6.5 21.2v-3.8h3.8" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10.5 18h3" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 9h16" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20h4.2L19 9.2a2.6 2.6 0 0 0-3.7-3.7L4.5 16.3z" />
      <path d="m13.8 7 3.2 3.2" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4 21 20H3z" />
      <path d="M12 9v5" />
      <path d="M12 17.5h.01" />
    </>
  ),
  book: (
    <>
      <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H7.5A2.5 2.5 0 0 1 5 17V5.5a1 1 0 0 1 1-1z" />
      <path d="M8 8h7M8 11h7M7.5 16.5H18" />
    </>
  ),
  tag: (
    <>
      <path d="M4.5 5.5v6.2L12.8 20l6.7-6.7-8.3-7.8z" />
      <circle cx="8.2" cy="9" r="1.1" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  circle: <circle cx="12" cy="12" r="7" />,
  star: <path d="m12 4 2.2 5 5.4.5-4.1 3.6 1.2 5.3L12 15.6l-4.7 2.8 1.2-5.3-4.1-3.6 5.4-.5z" />,
  spark: (
    <>
      <path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9z" />
      <path d="M5 16.5l.8 2.2 2.2.8-2.2.8L5 22.5l-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  flame: (
    <>
      <path d="M12 21c3.3 0 5.8-2.2 5.8-5.6 0-2.6-1.3-4.2-3.1-6.1-.9 2.4-2.2 3.2-2.2 3.2.3-3.2-1.2-5.4-3.1-7.2.1 3.4-3.2 5.4-3.2 9.8C6.2 18.7 8.7 21 12 21z" />
      <path d="M12 18.5c1.2 0 2.2-.8 2.2-2.1 0-1-.5-1.7-1.3-2.5-.4.9-.9 1.3-.9 1.3.1-1.2-.5-2.1-1.2-2.8 0 1.3-1.2 2.1-1.2 3.8 0 1.4 1 2.3 2.4 2.3z" />
    </>
  ),
  mind: (
    <>
      <path d="M9 18.5H7.5A3.5 3.5 0 0 1 4 15v-1.2c0-1 .4-1.9 1.1-2.5A4.1 4.1 0 0 1 9 6a4 4 0 0 1 7.4 1.5A4 4 0 0 1 20 11.4V15a3.5 3.5 0 0 1-3.5 3.5H15" />
      <path d="M9 14h6M10 17h4M12 14v6" />
    </>
  ),
  skull: (
    <>
      <path d="M12 3.5c-4 0-7 2.9-7 7 0 2.6 1.3 4.6 3.4 5.8V20h7.2v-3.7c2.1-1.2 3.4-3.2 3.4-5.8 0-4.1-3-7-7-7z" />
      <circle cx="9.2" cy="11" r="1.2" />
      <circle cx="14.8" cy="11" r="1.2" />
      <path d="M12 13.5v2M9.5 18h5" />
    </>
  ),
  service: (
    <>
      <path d="M4 18h16" />
      <path d="M6 18V9l6-4 6 4v9" />
      <path d="M10 18v-5h4v5" />
      <path d="M8.5 10.5h7" />
    </>
  ),
  stone: (
    <>
      <path d="M4.5 16.5 7 7.5 13 4l6.5 5-2 8.5-6.5 2.5z" />
      <path d="M7 7.5 12 11l7.5-2M12 11l-1 9" />
    </>
  ),
  scales: (
    <>
      <path d="M12 4v16" />
      <path d="M6 7h12" />
      <path d="M8 7 5 13h6z" />
      <path d="M16 7l-3 6h6z" />
      <path d="M8.5 20h7" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c8.5.2 14-5.3 14-14-8.7 0-14 5.5-14 14z" />
      <path d="M5 19 16 8" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7 4h10M7 20h10" />
      <path d="M8 4c0 4 2.8 5.3 4 8-1.2 2.7-4 4-4 8" />
      <path d="M16 4c0 4-2.8 5.3-4 8 1.2 2.7 4 4 4 8" />
    </>
  ),
  handshake: (
    <>
      <path d="m7.5 12 3-3 2.2 2.2a2 2 0 0 0 2.8 0l.5-.5" />
      <path d="M3.5 13.5 7 17l2-2" />
      <path d="m20.5 13.5-3.5 3.5-2-2" />
      <path d="M7 9.5 9.5 7h3L17 11.5" />
    </>
  ),
  scroll: (
    <>
      <path d="M8 5.5A2.5 2.5 0 0 1 10.5 3H18v15a3 3 0 0 1-3 3H7" />
      <path d="M7 21a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v1.5h6" />
      <path d="M12 8h4M12 11h4M12 14h3" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8, title }) {
  return (
    <svg
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {paths[name] || paths.spark}
    </svg>
  );
}
