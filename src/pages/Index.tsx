import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LottoBall } from "@/components/LottoBall";
import { AdModal } from "@/components/AdModal";
import {
  generateLottoNumbers,
  dateToNumbers,
  loadSlots,
  loadHistory,
  saveHistory,
  type DrawResult,
} from "@/lib/lotto";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDays, Sparkles } from "lucide-react";

export default function Index() {
  const [dateInput, setDateInput] = useState("");
  const [result, setResult] = useState<number[] | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleDraw = useCallback(() => {
    setShowAd(true);
  }, []);

  const handleAdComplete = useCallback(() => {
    const slots = loadSlots();
    const fixedNums = slots
      .filter(s => !s.isLocked && s.value !== null)
      .map(s => s.value!);
    const dateNums = dateInput ? dateToNumbers(dateInput) : [];

    const numbers = generateLottoNumbers(fixedNums, dateNums);
    setResult(numbers);
    setIsRevealing(true);

    // Save to history
    const history = loadHistory();
    const newDraw: DrawResult = {
      id: crypto.randomUUID(),
      numbers,
      baseDate: dateInput || "없음",
      createdAt: new Date().toISOString(),
    };
    saveHistory([newDraw, ...history]);

    setTimeout(() => setIsRevealing(false), 2500);
  }, [dateInput]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-14 pb-2">
        <h1 className="toss-title text-[26px]">소수리포트</h1>
        <p className="toss-subtitle mt-1">나만의 로또 번호를 추첨하세요</p>
      </header>

      <div className="px-5 space-y-4 mt-4">
        {/* Date Input Card */}
        <div className="toss-card space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="text-[15px] font-semibold">기념일 입력</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            생일, 기념일 등의 날짜를 입력하면 번호 조합에 반영됩니다
          </p>
          <input
            type="date"
            value={dateInput}
            onChange={e => setDateInput(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-secondary text-foreground text-[15px] border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Result Card */}
        <div className="toss-card space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-[15px] font-semibold">추첨 결과</span>
          </div>

          {result ? (
            <div className="flex items-center justify-center gap-2 py-4">
              {result.map((num, i) => (
                <LottoBall
                  key={`${num}-${i}`}
                  number={num}
                  size="lg"
                  animated={isRevealing}
                  delay={i * 150}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-[14px]">
                아래 버튼을 눌러 번호를 추첨하세요
              </p>
            </div>
          )}
        </div>

        {/* Draw Button */}
        <Button variant="toss" size="full" onClick={handleDraw}>
          🎱 번호 추첨하기
        </Button>
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
