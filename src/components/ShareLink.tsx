"use client";

import { useState } from "react";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-600 font-mono truncate select-all">
        {url}
      </div>
      <button
        onClick={handleCopy}
        className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          copied
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-stone-900 text-white hover:bg-stone-700"
        }`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
