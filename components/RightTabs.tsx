import React from "react";

export default function RightTabs({ employeeId }: { employeeId: string }) {
  return (
    <div className="flex flex-col flex-1 bg-[#101215] border border-[#1f2937] rounded-lg overflow-auto">
      {/* Tab bar and panel for Calendar/Tasks, pinned docs below */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">RightTabs (stub)</div>
    </div>
  );
}
