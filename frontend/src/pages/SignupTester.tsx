import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/auth";
import { INDUSTRY_OPTIONS } from "../lib/industryOptions";
import BrandMark from "../components/layout/BrandMark";

const inputCls = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200/60 transition";
const textareaCls = "w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200/60 transition";

export default function SignupTester() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const toggleIndustry = (v: string) =>
    setIndustries((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      shortBio.trim().length > 0 &&
      industries.length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      password === confirmPassword,
    [name, shortBio, industries, email, password, confirmPassword],
  );

  if (emailSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50 via-white to-violet-50/70 px-6 py-12">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <BrandMark size={40} fontSize={18} />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">FoundersSuite</span>
          </Link>
        </div>
        <div className="w-full max-w-md rounded-2xl border border-violet-200/90 bg-white px-8 py-10 text-center shadow-[0_12px_40px_rgba(91,33,182,0.1)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-7 w-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Check your inbox</h2>
          <p className="mt-2 text-sm text-slate-500">
            We sent a confirmation link to <strong className="text-slate-700">{email}</strong>. Click it to activate your account.
          </p>
          <p className="mt-5 text-sm text-slate-500">
            Already confirmed?{" "}
            <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-900">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50 via-white to-violet-50/70 px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <BrandMark size={40} fontSize={18} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">FoundersSuite</span>
        </Link>
      </div>

      <div className="w-full max-w-lg rounded-2xl border border-violet-200/90 bg-white px-8 py-9 text-slate-900 shadow-[0_12px_40px_rgba(91,33,182,0.1)]">
        <div>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Testers
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">Share your background and the domains you can validate.</p>
        </div>

        <div className="mt-7 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Short bio</label>
            <textarea
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="What you do today, domains you've shipped in, and how you give feedback."
              rows={3}
              className={textareaCls}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Industry expertise <span className="font-normal text-slate-400">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((opt) => {
                const on = industries.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleIndustry(opt)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      on
                        ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {industries.length > 0 && (
              <p className="text-xs text-violet-600">{industries.length} selected</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Login credentials</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`${inputCls} ${passwordMismatch ? "border-red-300 focus:border-red-400 focus:ring-red-200/60" : ""}`}
                  />
                  {passwordMismatch && (
                    <p className="text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          disabled={!canSubmit || isSubmitting}
          className="mt-7 h-11 w-full rounded-full bg-[#8b5cf6] font-semibold text-white transition hover:bg-[#7c3aed] disabled:opacity-40"
          onClick={async () => {
            setIsSubmitting(true);
            setError("");
            try {
              const result = await signup({
                role: "tester",
                email,
                password,
                name,
                shortBio,
                industries,
              });
              if (result.needsEmailConfirmation) {
                setEmailSent(true);
              } else {
                navigate("/tester/feed");
              }
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : "Sign up failed");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-900">Already have an account?</Link>
          <span className="text-slate-300" aria-hidden>·</span>
          <Link to="/signup/founder" className="font-semibold text-violet-700 hover:text-violet-900">Joining as a founder?</Link>
        </div>
      </div>

      <Link to="/" className="mt-6 text-sm text-slate-500 hover:text-slate-800 transition">
        ← Back to home
      </Link>
    </div>
  );
}
