import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import BrandMark from "../components/layout/BrandMark";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Look up the user's role to decide where to send them
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        navigate(data?.role === "tester" ? "/tester/feed" : "/founder/dashboard", { replace: true });
      } else {
        // Exchange the code from the URL (PKCE flow)
        const code = new URLSearchParams(window.location.search).get("code");
        if (!code) {
          setStatus("error");
          setErrorMsg("No confirmation code found in the URL.");
          return;
        }
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setErrorMsg(error.message);
          return;
        }
        // onAuthStateChange will fire; give it a moment then redirect
        setTimeout(async () => {
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession?.user) {
            const { data } = await supabase
              .from("users")
              .select("role")
              .eq("id", newSession.user.id)
              .maybeSingle();
            navigate(data?.role === "tester" ? "/tester/feed" : "/founder/dashboard", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        }, 300);
      }
    });
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50 via-white to-violet-50/70 px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white px-8 py-10 text-center shadow-lg">
          <h2 className="text-lg font-extrabold text-slate-900">Confirmation failed</h2>
          <p className="mt-2 text-sm text-slate-500">{errorMsg}</p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-full bg-[#8b5cf6] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7c3aed]"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50 via-white to-violet-50/70 px-6">
      <BrandMark size={48} fontSize={22} />
      <p className="mt-5 text-sm font-medium text-slate-500 animate-pulse">Confirming your account…</p>
    </div>
  );
}
