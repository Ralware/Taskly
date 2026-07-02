import { Plus } from "lucide-react";
import { useStore } from "@/store/store";

export function QuickAddFab() {
  const { openQuickAdd } = useStore();
  return (
    <button
      data-testid="quick-add-fab"
      onClick={() => openQuickAdd()}
      className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-[var(--acid)] text-black flex items-center justify-center shadow-2xl shadow-[var(--acid)]/20 hover:bg-[var(--acid-hover)] transition-all hover:scale-105 active:scale-95"
    >
      <Plus strokeWidth={2} className="w-6 h-6" />
    </button>
  );
}
