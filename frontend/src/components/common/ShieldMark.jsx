export default function ShieldMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 2 L36 8.5 V20.5 C36 30.5 29.5 38 20 42 C10.5 38 4 30.5 4 20.5 V8.5 Z"
        className="fill-ink-900 dark:fill-ink-100"
      />
      <path
        d="M13.5 21.5 L18 26 L27 15.5"
        stroke="currentColor"
        className="text-accent-400"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
