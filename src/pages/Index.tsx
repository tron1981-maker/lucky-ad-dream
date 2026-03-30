import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LottoBall } from "@/components/LottoBall";
import { AdModal } from "@/components/AdModal";
import {
  generateLottoNumbers,
  dateToNumbers,
  dateSlotToString,
  loadSlots,
  loadHistory,
  saveHistory,
  loadDateSlots,
  saveDateSlots,
  type DrawResult,
  type DateSlot,
} from "@/lib/lotto";
import { BottomNav } from "@/components/BottomNav";
import { CalendarDays, Sparkles, Plus, X } from "lucide-react";

const MAX_DATE_SLOTS = 10;

export default function Index() {
  const [dateSlots, setDateSlots] = useState<DateSlot[]>(loadDateSlots);
  const [result, setResult] = useState<number[] | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [adPurpose, setAdPurpose] = useState<"draw" | "addSlot">("draw");
  const [isRevealing, setIsRevealing] = useState(false);

  const updateDateSlots = useCallback((slots: DateSlot[]) => {
    setDateSlots(slots);
    saveDateSlots(slots);
  }, []);

  const handleDraw = useCallback(() => {
    setAdPurpose("draw");
    setShowAd(true);
  }, []);

  const handleAddSlot = useCallback(() => {
    if (dateSlots.length >= MAX_DATE_SLOTS) return;
    setAdPurpose("addSlot");
    setShowAd(true);
  }, [dateSlots.length]);

  const handleRemoveSlot = useCallback((id: string) => {
    updateDateSlots(dateSlots.filter(s => s.id !== id));
  }, [dateSlots, updateDateSlots]);

  const handleSlotChange = useCallback((id: string, field: keyof DateSlot, value: string) => {
    updateDateSlots(
      dateSlots.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  }, [dateSlots, updateDateSlots]);

  const handleAdComplete = useCallback(() => {
    if (adPurpose === "addSlot") {
      const newSlot: DateSlot = {
        id: crypto.randomUUID(),
        label: "",
        month: "",
        day: "",
        year: "",
      };
      updateDateSlots([...dateSlots, newSlot]);
      return;
    }

    // Draw logic
    const slots = loadSlots();
    const fixedNums = slots
      .filter(s => !s.isLocked && s.value !== null)
      .map(s => s.value!);

    const allDateNums: number[] = [];
    for (const ds of dateSlots) {
      if (ds.month && ds.day) {
        allDateNums.push(...dateToNumbers(ds));
      }
    }

    const numbers = generateLottoNumbers(fixedNums, allDateNums);
    setResult(numbers);
    setIsRevealing(true);

    const baseDateStr = dateSlots
      .filter(ds => ds.month && ds.day)
      .map(ds => {
        const y = ds.year || "????";
        return `${y}/${ds.month.padStart(2, "0")}/${ds.day.padStart(2, "0")}`;
      })
      .join(", ") || "없음";

    const history = loadHistory();
    const newDraw: DrawResult = {
      id: crypto.randomUUID(),
      numbers,
      baseDate: baseDateStr,
      createdAt: new Date().toISOString(),
    };
    saveHistory([newDraw, ...history]);

    setTimeout(() => setIsRevealing(false), 2500);
  }, [adPurpose, dateSlots, updateDateSlots]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-14 pb-2">
        <h1 className="toss-title text-[26px]">로또 번호 조합기</h1>
        <p className="toss-subtitle mt-1">나만의 로또 번호를 추첨하세요</p>
      </header>

      <div className="px-5 space-y-4 mt-4">
        {/* Date Input Card */}
        <div className="toss-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="text-[15px] font-semibold">기념일 입력</span>
            </div>
            <span className="text-[12px] text-muted-foreground">
              {dateSlots.length}/{MAX_DATE_SLOTS}
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            생일, 기념일 등의 날짜를 입력하면 번호 조합에 반영됩니다
          </p>

          <div className="space-y-2.5">
            {dateSlots.map((slot, idx) => (
              <div key={slot.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="기념일 이름 (예: 엄마 생일)"
                    value={slot.label}
                    onChange={e => handleSlotChange(slot.id, "label", e.target.value)}
                    className="flex-1 bg-transparent text-foreground text-[13px] font-medium outline-none placeholder:text-muted-foreground/40"
                  />
                  {idx === 0 ? (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">무료</span>
                  ) : (
                    <button
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="연(선택)"
                    maxLength={4}
                    value={slot.year}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      handleSlotChange(slot.id, "year", v);
                    }}
                    className="w-[72px] bg-transparent text-foreground text-[14px] text-center outline-none placeholder:text-muted-foreground/50"
                  />
                  <span className="text-muted-foreground/40 text-[14px]">/</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="월"
                    maxLength={2}
                    value={slot.month}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                      if (v === "" || (parseInt(v) >= 0 && parseInt(v) <= 12)) {
                        handleSlotChange(slot.id, "month", v);
                      }
                    }}
                    className="w-[40px] bg-transparent text-foreground text-[14px] text-center outline-none placeholder:text-muted-foreground/50"
                  />
                  <span className="text-muted-foreground/40 text-[14px]">/</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="일"
                    maxLength={2}
                    value={slot.day}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                      if (v === "" || (parseInt(v) >= 0 && parseInt(v) <= 31)) {
                        handleSlotChange(slot.id, "day", v);
                      }
                    }}
                    className="w-[40px] bg-transparent text-foreground text-[14px] text-center outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            ))}
          </div>

          {dateSlots.length < MAX_DATE_SLOTS && (
            <button
              onClick={handleAddSlot}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[13px] font-medium">기념일 추가 (광고 시청)</span>
            </button>
          )}
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
