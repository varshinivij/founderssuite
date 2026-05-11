export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-xl bg-bg-accent border border-divider shadow-card p-8">
        {children}
      </div>
    </div>
  );
}

