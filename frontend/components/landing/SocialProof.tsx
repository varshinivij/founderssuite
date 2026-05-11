"use client";

export function SocialProof() {
  const people = [
    { name: "Alicia W.", subtitle: "Founder • Savory" },
    { name: "Theo M.", subtitle: "Founder • Meridian" },
    { name: "Priya S.", subtitle: "Founder • Pixel" },
  ];

  const logos = ["MINKO", "PIXEL", "MERIDIAN", "Savory", "Terranove", "AUA"];

  return (
    <section className="relative overflow-x-hidden">
      <div className="relative mx-auto max-w-[1100px] px-6 py-16 md:py-20">
        <h2 className="text-center text-[32px] font-extrabold text-slate-900">
          Founders love what we do.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
          {people.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-[0_12px_40px_rgba(91,33,182,0.06)] backdrop-blur-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8b5cf6] bg-[#f5f0ff]">
                <span className="font-bold text-[#5b21b6]">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div className="mt-4 font-semibold text-slate-900">{p.name}</div>
              <div className="mt-1 text-sm text-slate-600">{p.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm tracking-widest text-slate-500 uppercase">
          {logos.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
