import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AdModal } from "@/components/AdModal";
import { loadSlots, saveSlots, type FixedSlot } from "@/lib/lotto";
import { LottoBall } from "@/components/LottoBall";
import { Lock, Unlock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FixedNumbers() {
  const [slots, setSlots] = useState<FixedSlot[]>(loadSlots);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "view" | "edit"; slotIndex: number } | null>(null);

  useEffect(() => {
    saveSlots(slots);
  }, [slots]);

  const handleSlotClick = (slot: FixedSlot) => {
    if (slot.isLocked) {
      setPendingAction({ type: "view", slotIndex: slot.index });
      setShowAd(true);
      return;
    }
    setEditingSlot(slot.index);
    setInputValue(slot.value?.toString() || "");
  };

  const handleSave = (slotIndex: number) => {
    const num = parseInt(inputValue);
    if (isNaN(num) || num < 1 || num > 45) {
      setEditingSlot(null);
      return;
    }
    setSlots(prev =>
      prev.map(s => (s.index === slotIndex ? { ...s, value: num } : s))
    );
    setEditingSlot(null);
  };

  const handleClear = (slotIndex: number) => {
    setSlots(prev =>
      prev.map(s => (s.index === slotIndex ? { ...s, value: null } : s))
    );
    setEditingSlot(null);
  };

  const handleAdComplete = () => {
    if (!pendingAction) return;
    setSlots(prev =>
      prev.map(s =>
        s.index === pendingAction.slotIndex ? { ...s, isLocked: false } : s
      )
    );
    setPendingAction(null);
  };

  const freeSlots = slots.filter(s => s.index <= 5);
  const premiumSlots = slots.filter(s => s.index > 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-5 pt-14 pb-2">
        <h1 className="toss-title text-[26px]">고정 수 관리</h1>
        <p className="toss-subtitle mt-1">최대 20개의 숫자를 등록할 수 있어요. 고정 수도 조합수에 반영이 됩니다.</p>
      </header>

      <div className="px-5 space-y-4 mt-4">
        {/* Free Slots */}
        <div className="toss-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">무료 슬롯</span>
            <span className="text-[12px] font-medium text-primary bg-toss-blue-light px-2.5 py-1 rounded-full">
              1~5번
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {freeSlots.map(slot => (
              <SlotItem
                key={slot.index}
                slot={slot}
                isEditing={editingSlot === slot.index}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onClick={() => handleSlotClick(slot)}
                onSave={() => handleSave(slot.index)}
                onClear={() => handleClear(slot.index)}
              />
            ))}
          </div>
        </div>

        {/* Premium Slots */}
        <div className="toss-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">프리미엄 슬롯</span>
            <span className="text-[12px] font-medium text-toss-orange bg-toss-yellow/20 px-2.5 py-1 rounded-full">
              6~20번 · 광고 시청
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {premiumSlots.map(slot => (
              <SlotItem
                key={slot.index}
                slot={slot}
                isEditing={editingSlot === slot.index}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onClick={() => handleSlotClick(slot)}
                onSave={() => handleSave(slot.index)}
                onClear={() => handleClear(slot.index)}
              />
            ))}
          </div>
        </div>
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

interface SlotItemProps {
  slot: FixedSlot;
  isEditing: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  onClick: () => void;
  onSave: () => void;
  onClear: () => void;
}

function SlotItem({ slot, isEditing, inputValue, onInputChange, onClick, onSave, onClear }: SlotItemProps) {
  if (isEditing) {
    return (
      <div className="flex flex-col items-center gap-1">
        <input
          type="number"
          min={1}
          max={45}
          autoFocus
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSave()}
          onBlur={onSave}
          className="w-12 h-12 rounded-full bg-primary/10 text-center text-[14px] font-bold text-foreground border-2 border-primary outline-none"
        />
        <div className="flex gap-1">
          <button onClick={onSave} className="text-[10px] text-primary font-semibold">저장</button>
          {slot.value !== null && (
            <button onClick={onClear} className="text-[10px] text-destructive font-semibold">삭제</button>
          )}
        </div>
      </div>
    );
  }

  if (slot.isLocked) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1"
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{slot.index}번</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1"
    >
      {slot.value ? (
        <LottoBall number={slot.value} size="sm" />
      ) : (
        <div className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
          <span className="text-[13px] text-muted-foreground">+</span>
        </div>
      )}
      <span className="text-[10px] text-muted-foreground font-medium">{slot.index}번</span>
    </button>
  );
}
