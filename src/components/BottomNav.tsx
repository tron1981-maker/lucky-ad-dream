import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkles, Grid3X3, ClockArrowUp, BarChart3 } from "lucide-react";

const tabs = [
  { path: "/", label: "추첨", icon: Sparkles },
  { path: "/fixed", label: "고정 수", icon: Grid3X3 },
  { path: "/history", label: "기록", icon: ClockArrowUp },
  { path: "/admin", label: "통계", icon: BarChart3 },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
