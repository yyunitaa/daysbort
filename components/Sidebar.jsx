"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2, ChevronDown, ChevronsLeft, ChevronsRight, Plus, LayoutDashboard,
  FileText, UserRound, Users, Settings, User, Landmark, Users2, CircleUserRound, LogOut,
} from "lucide-react";
import { BLUE } from "./ui";

const DASHBOARD_SUBMENU = [
  { id: "self", label: "Citra Pribadi", icon: User },
  { id: "regency", label: "Kabupaten Kolaka", icon: Landmark },
  { id: "audience", label: "Audience", icon: Users2 },
];

function NavItem({ href, active, icon: Icon, label, collapsed }) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${collapsed ? "justify-center" : ""} ${
        active ? "bg-blue-50 text-[#2563eb] font-medium" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon size={16} className={`shrink-0 ${active ? "text-[#2563eb]" : "text-slate-500"}`} />
      {!collapsed && label}
    </Link>
  );
}

export default function Sidebar({ organizationId, organizationName, organizations = [], activePage, dashboardTab, onDashboardTabChange, showRegencyTab = true, currentFigureId, username, email }) {
  const router = useRouter();
  const [orgExpanded, setOrgExpanded] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const dashboardSubmenu = showRegencyTab ? DASHBOARD_SUBMENU : DASHBOARD_SUBMENU.filter((item) => item.id !== "regency");
  const reportHref = currentFigureId ? `/dashboard/${currentFigureId}/report` : "/organization/figures";

  function handleSubmenuClick(id) {
    if (onDashboardTabChange) {
      onDashboardTabChange(id);
    } else if (currentFigureId) {
      router.push(`/dashboard/${currentFigureId}`);
    } else {
      router.push("/organization/figures");
    }
  }

  async function handleSwitchOrganization(orgId) {
    if (orgId === organizationId) {
      setOrgExpanded(false);
      return;
    }
    setSwitching(true);
    try {
      await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      setOrgExpanded(false);
      router.push("/organization/figures");
      router.refresh();
    } finally {
      setSwitching(false);
    }
  }

  return (
    <aside className={`${collapsed ? "w-16" : "w-60"} shrink-0 bg-white border-r border-[#e2e8f0] h-screen sticky top-0 overflow-y-auto flex flex-col transition-all duration-200`}>
      <div className={`pt-6 pb-4 flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: BLUE, color: "#fff" }}>
            K
          </div>
          {!collapsed && <span className="font-semibold text-slate-900 truncate">Kanalytics</span>}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Tutup sidebar"
            className="text-slate-400 hover:text-slate-700 shrink-0"
          >
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Buka sidebar"
          className="mx-auto mb-2 text-slate-400 hover:text-slate-700"
        >
          <ChevronsRight size={16} />
        </button>
      )}

      <div className="border-t border-[#e2e8f0]" />

      <nav className={`flex-1 py-4 flex flex-col gap-1 ${collapsed ? "px-2" : "px-3"}`}>
        {collapsed ? (
          <Link
            href="/organization"
            title={organizationName || "Organisasi"}
            className={`flex items-center justify-center px-2.5 py-2 rounded-lg text-sm transition-colors ${
              activePage === "organization" ? "bg-blue-50 text-[#2563eb]" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Building2 size={16} />
          </Link>
        ) : (
          <button
            onClick={() => setOrgExpanded((v) => !v)}
            className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
              activePage === "organization" ? "bg-blue-50 text-[#2563eb] font-medium" : "text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <Building2 size={16} className={`shrink-0 ${activePage === "organization" ? "text-[#2563eb]" : "text-slate-500"}`} />
              <span className="truncate">{organizationName || "Belum ada organisasi"}</span>
            </span>
            <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${orgExpanded ? "rotate-180" : ""}`} />
          </button>
        )}

        {!collapsed && orgExpanded && (
          <div className="flex flex-col gap-0.5 pl-9">
            {organizations.length === 0 ? (
              <p className="text-xs text-slate-400 py-1">Belum tergabung organisasi manapun.</p>
            ) : (
              organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrganization(org.id)}
                  disabled={switching}
                  className={`text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                    org.id === organizationId ? "bg-blue-50 text-[#2563eb] font-medium" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {org.name}
                </button>
              ))
            )}
          </div>
        )}

        {!collapsed && (
          <Link
            href="/organization/new"
            className="flex items-center gap-2 pl-9 pr-2.5 py-1.5 text-xs font-medium text-[#2563eb] hover:underline"
          >
            <Plus size={12} />
            Organisasi
          </Link>
        )}
        {collapsed && (
          <Link
            href="/organization/new"
            title="Organisasi Baru"
            className="flex items-center justify-center px-2.5 py-1.5 text-[#2563eb] hover:bg-slate-50 rounded-lg"
          >
            <Plus size={14} />
          </Link>
        )}

        <div className="border-t border-[#e2e8f0] my-2" />

        {!collapsed && (
          <div className="flex items-center gap-2 px-2.5 py-2 mt-1 text-sm font-medium text-slate-900">
            <LayoutDashboard size={16} className="text-slate-500" />
            Dashboard
          </div>
        )}
        <div className={`flex flex-col gap-0.5 mb-2 ${collapsed ? "" : "pl-8"}`}>
          {dashboardSubmenu.map((item) => {
            const isActive = activePage === "dashboard" && dashboardTab === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSubmenuClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${collapsed ? "justify-center" : ""} ${
                  isActive ? "bg-blue-50 text-[#2563eb] font-medium" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {collapsed && <ItemIcon size={16} className="shrink-0" />}
                {!collapsed && item.label}
              </button>
            );
          })}
        </div>

        <NavItem href={reportHref} active={activePage === "report"} icon={FileText} label="Report" collapsed={collapsed} />
        <NavItem href="/organization/figures" active={activePage === "figures"} icon={UserRound} label="Figur" collapsed={collapsed} />
        <NavItem href="/member" active={activePage === "member"} icon={Users} label="Member" collapsed={collapsed} />
        <NavItem href="/settings" active={activePage === "settings"} icon={Settings} label="Setting" collapsed={collapsed} />
      </nav>

      <div className="border-t border-[#e2e8f0]" />

      <div className={`py-3 flex flex-col gap-2 ${collapsed ? "px-2 items-center" : "px-3"}`}>
        <div className={`flex items-center gap-2.5 px-2.5 py-1.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100">
            <CircleUserRound size={18} className="text-slate-500" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{username || "Akun"}</p>
              <p className="text-xs text-slate-400 truncate">{email || "-"}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? "Keluar" : undefined}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && (loggingOut ? "Memproses..." : "Keluar")}
        </button>
      </div>
    </aside>
  );
}
