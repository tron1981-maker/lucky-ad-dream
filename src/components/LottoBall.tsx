import { getBallBgClass } from "@/lib/lotto";
import { cn } from "@/lib/utils";

interface LottoBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  delay?: number;
}

const sizeClasses = {
  sm: "w-9 h-9 text-[13px]",
  md: "w-12 h-12 text-[16px]",
  lg: "w-14 h-14 text-[18px]",
};

export function LottoBall({ number, size = "md", animated = false, delay = 0 }: LottoBallProps) {
  return (
    <div
      className={cn(
        "rounded-full font-bold flex items-center justify-center shadow-md",
        getBallBgClass(number),
        sizeClasses[size],
        animated && "animate-[slot-reveal_0.4s_ease-out_both]"
      )}
      style={animated ? { animationDelay: `${delay}ms` } : undefined}
    >
      {number}
    </div>
  );
}
