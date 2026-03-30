import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { LottoBall } from "@/components/LottoBall";
import { getStatsRanking, getTotalDraws } from "@/lib/stats";
import { BarChart3, Trophy, TrendingUp, TrendingDown } from "lucide-react";

export default function Admin() {
  const [ranking, setRanking] = useState<
    { number: number; count: number; percentage: number }[]
  >([]);
  const [totalDraws, setTotalDraws] = useState(0);
  const [view, setView] = useState<"top" | "all">("top");

  useEffect(() => {
    setRanking(getStatsRanking());
    setTotalDraws(getTotalDraws());
  }, []);

  const top10 = ranking.slice(0, 10);
  const bottom5 = [...ranking].sort((a, b) => a.count - b.count).slice(0, 5);
  const maxCount = ranking.length > 0 ? ranking[0].count : 1;

  const displayList = view === "top" ? top10 : ranking;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-5 pt-14 pb-2">
        <h1 className="toss-title text-[26px]">통계</h1>
        <p className="toss-subtitle mt-1">추첨 번호 출현 빈도를 확인하세요</p>
      </header>

      <div className="px-5 space-y-4 mt-4">
        {/* Summary Card */}
        <div className="toss-card">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-[15px] font-semibold">전체 요약</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-[24px] font-bold text-primary">{totalDraws}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                총 추첨 횟수
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-[24px] font-bold text-primary">
                {ranking.filter((r) => r.count > 0).length}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                출현한 번호 수
              </p>
            </div>
          </div>
        </div>

        {/* Top Numbers */}
        {totalDraws > 0 && (
          <>
            {/* Most Popular */}
            <div className="toss-card">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-[15px] font-semibold">
                  가장 많이 나온 번호 TOP 3
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 py-2">
                {ranking.slice(0, 3).map((item, idx) => (
                  <div key={item.number} className="flex flex-col items-center gap-1.5">
                    <span className="text-[12px] font-bold text-muted-foreground">
                      {idx + 1}위
                    </span>
                    <LottoBall number={item.number} size="lg" />
                    <span className="text-[13px] font-bold text-primary">
                      {item.count}회
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Least Popular */}
            <div className="toss-card">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
                <span className="text-[15px] font-semibold">
                  가장 적게 나온 번호
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 py-2">
                {bottom5.map((item) => (
                  <div key={item.number} className="flex flex-col items-center gap-1">
                    <LottoBall number={item.number} size="sm" />
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {item.count}회
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Ranking */}
            <div className="toss-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-[15px] font-semibold">번호별 출현 순위</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setView("top")}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                      view === "top"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    TOP 10
                  </button>
                  <button
                    onClick={() => setView("all")}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                      view === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    전체
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {displayList.map((item, idx) => (
                  <div
                    key={item.number}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[12px] font-bold text-muted-foreground w-6 text-right">
                      {view === "all"
                        ? ranking.findIndex((r) => r.number === item.number) + 1
                        : idx + 1}
                    </span>
                    <LottoBall number={item.number} size="sm" />
                    <div className="flex-1">
                      <div className="h-5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/20 rounded-full transition-all duration-500"
                          style={{
                            width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-foreground w-10 text-right">
                      {item.count}회
                    </span>
                    <span className="text-[11px] text-muted-foreground w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {totalDraws === 0 && (
          <div className="toss-card flex flex-col items-center justify-center py-12 space-y-3">
            <BarChart3 className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-[14px]">
              아직 추첨 데이터가 없어요
            </p>
            <p className="text-muted-foreground/60 text-[12px]">
              번호를 추첨하면 통계가 쌓입니다
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
