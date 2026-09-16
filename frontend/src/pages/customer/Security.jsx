import { ShieldCheck, Check, KeyRound, Link2Off, ScanEye, RefreshCcw, Bell } from "lucide-react";

const PROTECTIONS = [
  { group: "Payment protection", items: ["Real-time payment monitoring", "Risk-based transaction assessment"] },
  { group: "Transaction monitoring", items: ["Suspicious transaction detection", "Transaction activity tracking"] },
];

const ALERTS = [
  { icon: Bell, text: "Suspicious transaction detected", time: "3 minutes ago", tone: "review" },
  { icon: Check, text: "Transaction verified", time: "2 hours ago", tone: "safe" },
];

const TIPS = [
  { icon: KeyRound, text: "Never share OTPs, even with someone claiming to be your bank." },
  { icon: ScanEye, text: "Verify payment recipients before sending money to someone new." },
  { icon: Link2Off, text: "Avoid clicking payment links from unexpected messages or emails." },
  { icon: RefreshCcw, text: "Review unusual transactions right away and report anything unfamiliar." },
];

const TONE_CLS = {
  review: "bg-review-100 dark:bg-review-500/15 text-review-600 dark:text-review-dark",
  safe: "bg-safe-100 dark:bg-safe-500/15 text-safe-600 dark:text-safe-dark",
};

export default function Security() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Account security</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">How PayGuard is protecting your payments.</p>
      </div>

      <div className="rounded-card bg-ink-900 dark:bg-ink-850 border border-ink-900 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6 flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/20 text-accent-300 flex-shrink-0">
          <ShieldCheck size={24} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-300">Security status</p>
          <p className="text-xl font-semibold text-white mt-0.5">Protected</p>
          <p className="text-xs text-ink-400 mt-1">Illustrative for this prototype — will reflect real account data once connected.</p>
        </div>
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-5">Account security</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          {PROTECTIONS.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500 mb-3">{group.group}</p>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink-800 dark:text-ink-100">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-safe-100 dark:bg-safe-500/15 text-safe-600 dark:text-safe-dark flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-4">Security alerts</h3>
        <ul className="space-y-3">
          {ALERTS.map((a) => (
            <li key={a.text} className="flex items-center gap-3 text-sm">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${TONE_CLS[a.tone]}`}>
                <a.icon size={14} />
              </span>
              <div>
                <p className="text-ink-800 dark:text-ink-100">{a.text}</p>
                <p className="text-xs text-ink-400 dark:text-ink-500">{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-4">Security tips</h3>
        <ul className="space-y-4">
          {TIPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-ink-700 dark:text-ink-200">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 flex-shrink-0">
                <Icon size={15} />
              </span>
              <span className="pt-1.5">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
