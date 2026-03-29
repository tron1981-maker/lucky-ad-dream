import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AdModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export function AdModal({ isOpen, onComplete, onClose }: AdModalProps) {
  const [progress, setProgress] = useState(0);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCanClose(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setCanClose(true);
          return 100;
        }
        return p + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
      <div className="toss-card mx-6 w-full max-w-sm text-center space-y-5">
        <div className="space-y-2">
          <p className="text-muted-foreground text-[13px] font-medium">광고</p>
          <div className="bg-secondary rounded-xl h-48 flex items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="text-4xl">🎰</div>
              <p className="text-muted-foreground text-[14px]">광고 영역</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-[12px]">
            {canClose ? "광고 시청 완료!" : `${Math.ceil((100 - progress) * 0.03)}초 남음`}
          </p>
        </div>

        {canClose && (
          <Button
            variant="toss"
            size="full"
            onClick={() => {
              onComplete();
              onClose();
            }}
          >
            확인하기
          </Button>
        )}
      </div>
    </div>
  );
}
