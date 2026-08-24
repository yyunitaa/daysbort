"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { cardCls } from "./ui";

export default function OtherOrganizationsList({ organizations }) {
  const router = useRouter();
  const [switchingId, setSwitchingId] = useState(null);

  async function handleSwitch(orgId) {
    setSwitchingId(orgId);
    try {
      await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      router.refresh();
    } finally {
      setSwitchingId(null);
    }
  }

  if (organizations.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-xs font-medium text-slate-500 mb-2">Organisasi lain yang Anda ikuti</p>
      <div className="flex flex-col gap-2">
        {organizations.map((org) => (
          <div key={org.id} className={`${cardCls} p-4 flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2563eb14" }}>
                <Building2 size={16} color="#2563eb" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-slate-800 truncate">{org.name}</span>
            </div>
            <button
              onClick={() => handleSwitch(org.id)}
              disabled={switchingId === org.id}
              className="text-xs font-medium text-[#2563eb] border border-[#2563eb33] rounded-lg px-3 py-1.5 hover:bg-blue-50 disabled:opacity-50 shrink-0"
            >
              {switchingId === org.id ? "Memproses..." : "Jadikan Aktif"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
