import { useState } from "react";

const inputCls = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition";

export default function TesterSettings() {
  const [availability, setAvailability] = useState("Weeknights (after 6pm PT)");
  const [timezone, setTimezone] = useState("PT");
  const [rate, setRate] = useState("85");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your availability, rate, and notification preferences.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900">Availability</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Availability windows</label>
            <input value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls + " cursor-pointer"}>
              {["ET", "CT", "MT", "PT", "GMT", "CET"].map((tz) => <option key={tz}>{tz}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Hourly rate ($)</label>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Notifications</h2>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="h-4 w-4 accent-violet-600" />
          <span className="text-sm text-slate-700">Email me when a new match is found</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="rounded-full bg-[#8b5cf6] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c3aed]">
          {saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
