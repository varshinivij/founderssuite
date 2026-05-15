import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import BrandMark from "../components/layout/BrandMark";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "founder") navigate("/signup/founder", { replace: true });
    if (role === "tester") navigate("/signup/tester", { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50 via-white to-violet-50/70 px-6 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <BrandMark size={40} fontSize={18} />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">FoundersSuite</span>
        </Link>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-violet-200/90 bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(91,33,182,0.1)]">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Join FoundersSuite</h2>
          <p className="mt-1 text-sm text-slate-600">Choose how you'll use the platform.</p>
        </div>

        <div className="mt-6 grid gap-3">
          <Link
            to="/signup/founder"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#8b5cf6] px-4 text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
          >
            Join as Founder
          </Link>
          <Link
            to="/signup/tester"
            className="flex h-12 w-full items-center justify-center rounded-full border border-violet-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-violet-50"
          >
            Join as Tester
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-900">
            Log in
          </Link>
        </p>
      </div>

      <Link to="/" className="mt-6 text-sm text-slate-500 hover:text-slate-800 transition">
        ← Back to home
      </Link>
    </div>
  );
}
