import React from "react";

export default function ExpertDock({ employeeId }: { employeeId: string }) {
  return (
    <div className="flex gap-2 py-2">
      {/* Expert chips will go here */}
      <span className="rounded-md border border-slate-700 px-3 py-1 text-xs text-emerald-400">AI Expert 1</span>
      <span className="rounded-md border border-slate-700 px-3 py-1 text-xs text-emerald-400">AI Expert 2</span>
      <button className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 ml-2">+ New Expert</button>
    </div>
  );
}
