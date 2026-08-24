"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Search, Trash2, Pencil, X } from "lucide-react";
import { cardCls, BLUE } from "./ui";

const ROLE_LABEL = { super_admin: "Super Admin", admin: "Admin", member: "Member" };

function MemberForm({ figures, onClose, onSaved, initial, canGrantSuperAdmin }) {
  const [email, setEmail] = useState(initial?.email || "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [found, setFound] = useState(initial ? { id: initial.id, username: initial.username, email: initial.email } : null);
  const [role, setRole] = useState(initial?.role || "member");
  const [figureIds, setFigureIds] = useState(initial?.figureIds || []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setSearchError("");
    setFound(null);
    setSearching(true);
    try {
      const res = await fetch(`/api/members/search?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || "Gagal mencari email.");
        return;
      }
      if (!data.found) {
        setSearchError("Email tidak terdaftar.");
        return;
      }
      if (!initial && data.existingRole) {
        setSearchError("Email sudah terdaftar dalam organisasi.");
        return;
      }
      setFound(data.user);
      setRole(data.existingRole || "member");
      setFigureIds(data.existingFigureIds || []);
    } catch {
      setSearchError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSearching(false);
    }
  }

  function toggleFigure(id) {
    setFigureIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: found.id, role, figureIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Gagal menyimpan.");
        return;
      }
      onSaved();
    } catch {
      setSaveError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`${cardCls} p-5 flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{initial ? "Edit Member" : "Tambah Member"}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>

      {!initial && !found && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            placeholder="Cari akun berdasarkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
          >
            <Search size={14} />
            {searching ? "Mencari..." : "Cari"}
          </button>
        </form>
      )}

      {searchError && <p className="text-sm text-[#dc2626]">{searchError}</p>}

      {found && (
        <>
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{found.username}</p>
              <p className="text-xs text-slate-500 truncate">{found.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">Role</label>
            <div className="flex gap-2">
              {(canGrantSuperAdmin ? ["super_admin", "admin", "member"] : ["admin", "member"]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 text-sm font-medium rounded-lg border px-3 py-2 transition-colors ${
                    role === r ? "border-[#2563eb] bg-blue-50 text-[#2563eb]" : "border-[#e2e8f0] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {role === "super_admin"
                ? "Super Admin akses penuh ke semua figur di organisasi ini, checklist di bawah diabaikan."
                : role === "admin"
                ? "Admin bisa mengelola figur & member, dan melihat daftar semua figur — tapi cuma bisa masuk ke figur yang di-checklist di bawah."
                : "Member hanya bisa melihat (view only) figur yang di-checklist di bawah."}
            </p>
          </div>

          {role !== "super_admin" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Figur yang bisa diakses</label>
              {figures.length === 0 ? (
                <p className="text-xs text-slate-400">Organisasi ini belum punya figur.</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {figures.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={figureIds.includes(f.id)}
                        onChange={() => toggleFigure(f.id)}
                        className="rounded border-slate-300"
                      />
                      {f.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {saveError && <p className="text-sm text-[#dc2626]">{saveError}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#2563eb] text-white text-sm font-medium py-2 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-[#e2e8f0] text-slate-600 text-sm font-medium px-3 py-2 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MemberManager({ members, figures, isAdmin, isSuperAdmin, currentUserId }) {
  const router = useRouter();
  const [formMode, setFormMode] = useState(null); // null | "add" | member object
  const [deletingId, setDeletingId] = useState(null);

  function handleSaved() {
    setFormMode(null);
    router.refresh();
  }

  async function handleDelete(userId) {
    if (!confirm("Hapus member ini dari organisasi?")) return;
    setDeletingId(userId);
    try {
      await fetch(`/api/members?userId=${userId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && formMode === null && (
        <button
          onClick={() => setFormMode("add")}
          className="self-start flex items-center gap-1.5 rounded-lg bg-[#2563eb] text-white text-sm font-medium px-4 py-2"
        >
          <UserPlus size={14} />
          Tambah Member
        </button>
      )}

      {formMode === "add" && (
        <MemberForm figures={figures} onClose={() => setFormMode(null)} onSaved={handleSaved} canGrantSuperAdmin={isSuperAdmin} />
      )}
      {formMode && formMode !== "add" && (
        <MemberForm
          figures={figures}
          initial={formMode}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
          canGrantSuperAdmin={isSuperAdmin}
        />
      )}

      <div className={`${cardCls} p-2`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="text-left font-medium py-2.5 pl-4">Username</th>
              <th className="text-left font-medium py-2.5">Email</th>
              <th className="text-left font-medium py-2.5">Role</th>
              {isAdmin && <th className="text-right font-medium py-2.5 pr-4">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pl-4 text-slate-800 font-medium">
                  {m.username}
                  {m.id === currentUserId && <span className="text-slate-400 font-normal"> (Anda)</span>}
                </td>
                <td className="py-2.5 text-slate-500">{m.email}</td>
                <td className="py-2.5">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: BLUE, background: `${BLUE}14` }}
                  >
                    {ROLE_LABEL[m.role]}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-2.5 pr-4 text-right">
                    <div className="inline-flex gap-2">
                      {m.role !== "super_admin" && (
                        <button
                          onClick={() => setFormMode({ id: m.id, username: m.username, email: m.email, role: m.role, figureIds: m.figureIds })}
                          className="text-slate-400 hover:text-[#2563eb]"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {m.id !== currentUserId && m.role !== "super_admin" && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          disabled={deletingId === m.id}
                          className="text-slate-400 hover:text-[#dc2626] disabled:opacity-50"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
