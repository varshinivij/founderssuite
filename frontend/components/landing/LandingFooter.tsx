"use client";

import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative overflow-x-hidden border-t border-slate-200/90">
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1fr_1.2fr]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image src="/logo.png" alt="FoundersSuite logo" width={40} height={40} />
            </div>
            <div className="font-extrabold tracking-tight text-slate-900">
              FoundersSuite
            </div>
          </div>

          <div className="max-w-[320px] text-sm text-slate-600">
            Market validation, reimagined — connect with domain-matched testers and
            turn feedback into action.
          </div>

          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">Learn</div>
              <Link href="/community" className="block text-slate-600 transition hover:text-violet-700">
                Community
              </Link>
              <Link href="/agents" className="block text-slate-600 transition hover:text-violet-700">
                AI Agents
              </Link>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">Support</div>
              <a href="mailto:support@founderssuite.ai" className="block text-slate-600 transition hover:text-violet-700">
                Email
              </a>
              <a href="#" className="block text-slate-600 transition hover:text-violet-700">
                Status (soon)
              </a>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">Social</div>
              <a href="#" className="block text-slate-600 transition hover:text-violet-700">
                X (soon)
              </a>
              <a href="#" className="block text-slate-600 transition hover:text-violet-700">
                LinkedIn (soon)
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <div className="text-center text-xs text-slate-500 md:text-left">
            © 2026 FoundersSuite. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <a href="#" aria-label="X" className="transition hover:text-slate-800">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 4L20 20M20 4L4 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="transition hover:text-slate-800">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6.5 10V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6.5 6.5V6.6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M10.5 18V13.2C10.5 11.6 11.5 10.6 13 10.6C14.6 10.6 15.5 11.7 15.5 13.3V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M15.5 13.3C15.5 11.7 16.6 10.6 18.2 10.6C19.8 10.6 20.5 11.8 20.5 13.4V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
