export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-violet-50 via-white to-violet-50/70">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-violet-200/90 bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(91,33,182,0.1)]">
          {children}
        </div>
      </div>
    </div>
  );
}

