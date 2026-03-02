import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">{children}</div>
      <BottomNav />
    </div>
  );
}
