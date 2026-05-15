import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/auth";
import BrandMark from "../components/layout/BrandMark";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputCls = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200/60 transition";

  const handleLogin = async () => {
    if (!email || password.length < 6) return;
    setIsSubmitting(true);
    setError("");
    try {
      const { role } = await login({ email, password });
      navigate(role === "tester" ? "/tester/feed" : "/founder/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50 via-white to-violet-50/70 px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <BrandMark size={40} fontSize={18} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">FoundersSuite</span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-violet-200/90 bg-white px-8 py-9 text-slate-900 shadow-[0_12px_40px_rgba(91,33,182,0.1)]">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue.</p>
        </div>

        <div className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="you@company.com"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          className="mt-7 h-11 w-full rounded-full bg-[#8b5cf6] font-semibold text-white transition hover:bg-[#7c3aed] disabled:opacity-50"
          disabled={!email || password.length < 6 || isSubmitting}
          onClick={handleLogin}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          <p>New here?</p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <Link to="/signup/founder" className="font-semibold text-violet-700 hover:text-violet-900">Join as founder</Link>
            <span className="text-slate-300" aria-hidden>·</span>
            <Link to="/signup/tester" className="font-semibold text-violet-700 hover:text-violet-900">Join as tester</Link>
          </p>
        </div>
      </div>

      <Link to="/" className="mt-6 text-sm text-slate-500 hover:text-slate-800 transition">
        ← Back to home
      </Link>
    </div>
  );
}
