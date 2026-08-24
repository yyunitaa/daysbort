import Sidebar from "./Sidebar";
import { cardCls } from "./ui";

export default function ComingSoonPage({ organizationId, organizationName, organizations, activePage, title, description, currentFigureId, showRegencyTab, username, email }) {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-start" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Sidebar organizationId={organizationId} organizationName={organizationName} organizations={organizations} activePage={activePage} currentFigureId={currentFigureId} showRegencyTab={showRegencyTab} username={username} email={email} />
      <div className="flex-1 min-w-0 px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
        <h1 className="text-xl font-bold text-slate-900 mb-1">{title}</h1>
        <p className="text-sm text-slate-500 mb-8">{description}</p>
        <div className={`${cardCls} p-10 flex flex-col items-center justify-center text-center gap-2`}>
          <p className="text-sm font-medium text-slate-700">Fitur ini akan segera hadir.</p>
          <p className="text-xs text-slate-400">Kami sedang menyiapkan halaman {title.toLowerCase()}.</p>
        </div>
      </div>
    </div>
  );
}
