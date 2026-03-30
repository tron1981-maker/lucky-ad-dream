import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { LottoBall } from "@/components/LottoBall";
import {
  getStatsRanking,
  getTotalDraws,
  loadDrawLog,
  getFixedStatsRanking,
  type DrawLog,
} from "@/lib/stats";
import {
  BarChart3,
  Trophy,
  TrendingDown,
  TrendingUp,
  ListOrdered,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "summary" | "rounds" | "fixed";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("summary");

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-5 pt-14 pb-2">
        <h1 className="toss-title text-[26px]">통계</h1>
        <p className="toss-subtitle mt-1">추첨 데이터를 분석하세요</p>
      </header>

      {/* Tab Bar */}
      <div className="px-5 mt-3">
        <div className="flex bg-secondary rounded-xl p-1 gap-1">
          {([
            { key: "summary" as Tab, label: "전체요약", icon: BarChart3 },
            { key: "rounds" as Tab, label: "회차별", icon: ListOrdered },
            { key: "fixed" as Tab, label: "고정수", icon: Lock },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all",
                tab === key
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4 mt-4">
        {tab === "summary" && <SummaryTab />}
        {tab === "rounds" && <RoundsTab />}
        {tab === "fixed" && <FixedTab />}
      </div>

      <BottomNav />
    </div>
  );
}

// ===================== 전체요약 탭 =====================
function SummaryTab() {
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

  if (totalDraws === 0) {
    return (
      <div className="toss-card flex flex-col items-center justify-center py-12 space-y-3">
        <BarChart3 className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-[14px]">아직 추첨 데이터가 없어요</p>
        <p className="text-muted-foreground/60 text-[12px]">번호를 추첨하면 통계가 쌓입니다</p>
      </div>
    );
  }

  return (
    <>
      {/* 요약 카드 */}
      <div className="toss-card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="text-[15px] font-semibold">전체 요약</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-primary">{totalDraws}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">총 추첨 횟수</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-primary">
              {ranking.filter((r) => r.count > 0).length}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">출현한 번호 수</p>
          </div>
        </div>
      </div>

      {/* TOP 3 */}
      <div className="toss-card">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-[15px] font-semibold">가장 많이 나온 번호 TOP 3</span>
        </div>
        <div className="flex items-center justify-center gap-4 py-2">
          {ranking.slice(0, 3).map((item, idx) => (
            <div key={item.number} className="flex flex-col items-center gap-1.5">
              <span className="text-[12px] font-bold text-muted-foreground">{idx + 1}위</span>
              <LottoBall number={item.number} size="lg" />
              <span className="text-[13px] font-bold text-primary">{item.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* 가장 적게 나온 번호 */}
      <div className="toss-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-muted-foreground" />
          <span className="text-[15px] font-semibold">가장 적게 나온 번호</span>
        </div>
        <div className="flex items-center justify-center gap-3 py-2">
          {bottom5.map((item) => (
            <div key={item.number} className="flex flex-col items-center gap-1">
              <LottoBall number={item.number} size="sm" />
              <span className="text-[11px] text-muted-foreground font-medium">{item.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* 전체 순위 */}
      <div className="toss-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-[15px] font-semibold">번호별 출현 순위</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setView("top")}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors",
                view === "top"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              TOP 10
            </button>
            <button
              onClick={() => setView("all")}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors",
                view === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              전체
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {displayList.map((item, idx) => (
            <div key={item.number} className="flex items-center gap-3">
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
                    style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
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
  );
}

// ===================== 회차별 탭 =====================
function RoundsTab() {
  const [drawLog, setDrawLog] = useState<DrawLog[]>([]);

  useEffect(() => {
    setDrawLog(loadDrawLog());
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (drawLog.length === 0) {
    return (
      <div className="toss-card flex flex-col items-center justify-center py-12 space-y-3">
        <ListOrdered className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-[14px]">아직 추첨 기록이 없어요</p>
      </div>
    );
  }

  return (
    <>
      <div className="toss-card">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold">총 {drawLog.length}회 추첨</span>
          <span className="text-[12px] text-muted-foreground">최근 100회 저장</span>
        </div>
      </div>

      {drawLog.map((draw, idx) => (
        <div key={draw.id} className="toss-card space-y-3">
          {/* 회차 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                #{drawLog.length - idx}회
              </span>
              <span className="text-[12px] text-muted-foreground font-medium">
                {formatDate(draw.createdAt)}
              </span>
            </div>
            {draw.baseDate !== "없음" && (
              <span className="text-[10px] text-primary bg-toss-blue-light px-2 py-0.5 rounded-full font-medium">
                📅 {draw.baseDate}
              </span>
            )}
          </div>

          {/* 추첨 번호 */}
          <div>
            <p className="text-[11px] text-muted-foreground font-medium mb-1.5">추첨 결과</p>
            <div className="flex items-center gap-2">
              {draw.numbers.map((num, i) => (
                <LottoBall key={`${num}-${i}`} number={num} size="sm" />
              ))}
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="flex gap-3 pt-1 border-t border-border">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-1">고정수</p>
              <div className="flex flex-wrap gap-1">
                {draw.fixedNumbers.length > 0 ? (
                  draw.fixedNumbers.map((num, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                    >
                      {num}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-muted-foreground/50">없음</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-1">기념일 번호</p>
              <div className="flex flex-wrap gap-1">
                {draw.dateNumbers.length > 0 ? (
                  draw.dateNumbers.map((num, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded"
                    >
                      {num}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-muted-foreground/50">없음</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ===================== 고정수 탭 =====================
function FixedTab() {
  const [fixedRanking, setFixedRanking] = useState<{ number: number; count: number }[]>([]);

  useEffect(() => {
    setFixedRanking(getFixedStatsRanking());
  }, []);

  const maxCount = fixedRanking.length > 0 ? fixedRanking[0].count : 1;
  const totalFixed = fixedRanking.reduce((sum, r) => sum + r.count, 0);

  if (fixedRanking.length === 0) {
    return (
      <div className="toss-card flex flex-col items-center justify-center py-12 space-y-3">
        <Lock className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-[14px]">아직 고정수 데이터가 없어요</p>
        <p className="text-muted-foreground/60 text-[12px]">고정 수를 등록하면 통계가 쌓입니다</p>
      </div>
    );
  }

  return (
    <>
      {/* 요약 */}
      <div className="toss-card">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-primary" />
          <span className="text-[15px] font-semibold">고정수 요약</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-primary">{fixedRanking.length}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">사용된 번호 종류</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-primary">{totalFixed}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">총 등록 횟수</p>
          </div>
        </div>
      </div>

      {/* TOP 3 인기 고정수 */}
      {fixedRanking.length >= 3 && (
        <div className="toss-card">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-[15px] font-semibold">인기 고정수 TOP 3</span>
          </div>
          <div className="flex items-center justify-center gap-4 py-2">
            {fixedRanking.slice(0, 3).map((item, idx) => (
              <div key={item.number} className="flex flex-col items-center gap-1.5">
                <span className="text-[12px] font-bold text-muted-foreground">{idx + 1}위</span>
                <LottoBall number={item.number} size="lg" />
                <span className="text-[13px] font-bold text-primary">{item.count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 고정수 순위 */}
      <div className="toss-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-[15px] font-semibold">고정수 전체 순위</span>
        </div>

        <div className="space-y-2">
          {fixedRanking.map((item, idx) => (
            <div key={item.number} className="flex items-center gap-3">
              <span className="text-[12px] font-bold text-muted-foreground w-6 text-right">
                {idx + 1}
              </span>
              <LottoBall number={item.number} size="sm" />
              <div className="flex-1">
                <div className="h-5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/20 rounded-full transition-all duration-500"
                    style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-[12px] font-bold text-foreground w-10 text-right">
                {item.count}회
              </span>
              <span className="text-[11px] text-muted-foreground w-12 text-right">
                {totalFixed > 0 ? ((item.count / totalFixed) * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
