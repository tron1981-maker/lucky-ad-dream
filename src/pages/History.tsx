import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { LottoBall } from "@/components/LottoBall";
import { loadHistory, type DrawResult } from "@/lib/lotto";
import { ClockArrowUp } from "lucide-react";

export default function History() {
  const [history, setHistory] = useState<DrawResult[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-5 pt-14 pb-2">
        <h1 className="toss-title text-[26px]">추첨 기록</h1>
        <p className="toss-subtitle mt-1">지금까지 추첨한 번호를 확인하세요</p>
      </header>

      <div className="px-5 space-y-3 mt-4">
        {history.length === 0 ? (
          <div className="toss-card flex flex-col items-center justify-center py-12 space-y-3">
            <ClockArrowUp className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-[14px]">아직 추첨 기록이 없어요</p>
          </div>
        ) : (
          history.map(draw => (
            <div key={draw.id} className="toss-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground font-medium">
                  {formatDate(draw.createdAt)}
                </span>
                {draw.baseDate !== "없음" && (
                  <span className="text-[11px] text-primary bg-toss-blue-light px-2 py-0.5 rounded-full font-medium">
                    📅 {draw.baseDate}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {draw.numbers.map((num, i) => (
                  <LottoBall key={`${num}-${i}`} number={num} size="sm" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
