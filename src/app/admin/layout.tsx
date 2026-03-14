export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950" style={{ isolation: 'isolate' }}>
      {children}
    </div>
  );
}
