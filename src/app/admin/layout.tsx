export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f2340] overflow-auto">
      {children}
    </div>
  );
}
