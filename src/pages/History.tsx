import { useState, useEffect, useCallback } from "react";
import { BottomNav } from "@/components/BottomNav";
import { LottoBall } from "@/components/LottoBall";
import { AdModal } from "@/components/AdModal";
import { loadHistory, type DrawResult } from "@/lib/lotto";
import { ClockArrowUp, Lock } from "lucide-react";

const FREE_SLOTS = 1;
const MAX_UNLOCKED = 10;
const STORAGE_KEY = "minority-report-history-unlocked";

function loadUnlockedCount(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Math.min(parseInt(v), MAX_UNLOCKED) : FREE_SLOTS;
  } catch { return FREE_SLOTS; }
}

function saveUnlockedCount(n: number) {
  localStorage.setItem(STORAGE_KEY, String(n));
}

export default function History() {
  const [history, setHistory] = useState<DrawResult[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(loadUnlockedCount);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleUnlockMore = useCallback(() => {
    if (unlockedCount >= MAX_UNLOCKED) return;
    setShowAd(true);
  }, [unlockedCount]);

  const handleAdComplete = useCallback(() => {
    const next = Math.min(unlockedCount + 1, MAX_UNLOCKED);
    setUnlockedCount(next);
    saveUnlockedCount(next);
  }, [unlockedCount]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const visibleHistory = history.slice(0, unlockedCount);
  const hiddenCount = Math.max(0, history.length - unlockedCount);
  const canUnlockMore = unlockedCount < MAX_UNLOCKED && hiddenCount > 0;

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
          <>
            {visibleHistory.map(draw => (
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
            ))}

            {canUnlockMore && (
              <button
                onClick={handleUnlockMore}
                className="w-full toss-card flex items-center justify-center gap-2 py-4 active:scale-[0.98] transition-transform"
              >
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-primary">
                  기록 더보기 (광고 시청) · {hiddenCount}건 숨김
                </span>
              </button>
            )}

            {unlockedCount >= MAX_UNLOCKED && hiddenCount > 0 && (
              <p className="text-center text-[12px] text-muted-foreground py-2">
                최대 {MAX_UNLOCKED}개까지 확인할 수 있어요
              </p>
            )}
          </>
        )}
      </div>

      <AdModal
        isOpen={showAd}
        onComplete={handleAdComplete}
        onClose={() => setShowAd(false)}
      />

      <BottomNav />
    </div>
  );
}
