import { useEffect, useMemo, useRef, useState } from "react";
import type { Payment, Schedule } from "@/lib/calc";
import {
  calcCredit,
  daysBetween,
  effectiveCompound,
  effectiveSimple,
} from "@/lib/calc";
import { clearState, loadState, saveState } from "@/lib/storage";
import { Header } from "@/components/Header";
import { ScheduleSection } from "@/components/ScheduleSection";
import { PaymentSection } from "@/components/PaymentSection";
import { SummarySection } from "@/components/SummarySection";
import { RateAnalysis } from "@/components/RateAnalysis";
import { PaymentsTable } from "@/components/PaymentsTable";

type PersistedState = {
  schedules: Schedule[];
  payments: Payment[];
  rate: number;
  schIdCounter: number;
  payIdCounter: number;
};

// rate는 퍼센트 값으로 저장 (예: 5 = 5%) — 원본 HTML과 동일.
// 계산 함수 호출 시 rate/100으로 변환.
const DEFAULT_STATE: PersistedState = {
  schedules: [],
  payments: [],
  rate: 5,
  schIdCounter: 1,
  payIdCounter: 1,
};

function sortSchedules(s: Schedule[]) {
  return [...s].sort((a, b) => a.date.localeCompare(b.date));
}
function sortPayments(p: Payment[]) {
  return [...p].sort((a, b) => a.date.localeCompare(b.date));
}

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>(DEFAULT_STATE.schedules);
  const [payments, setPayments] = useState<Payment[]>(DEFAULT_STATE.payments);
  const [rate, setRate] = useState<number>(DEFAULT_STATE.rate);
  const schIdRef = useRef(DEFAULT_STATE.schIdCounter);
  const payIdRef = useRef(DEFAULT_STATE.payIdCounter);
  const [loaded, setLoaded] = useState(false);

  // 최초 복원
  useEffect(() => {
    let cancelled = false;
    loadState<PersistedState>().then((saved) => {
      if (cancelled) return;
      if (saved) {
        setSchedules(saved.schedules ?? []);
        setPayments(saved.payments ?? []);
        setRate(typeof saved.rate === "number" ? saved.rate : 5);
        schIdRef.current = saved.schIdCounter ?? 1;
        payIdRef.current = saved.payIdCounter ?? 1;
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 변경 시 자동 저장 (복원 끝난 뒤에만)
  useEffect(() => {
    if (!loaded) return;
    saveState<PersistedState>({
      schedules,
      payments,
      rate,
      schIdCounter: schIdRef.current,
      payIdCounter: payIdRef.current,
    }).catch(() => {});
  }, [schedules, payments, rate, loaded]);

  const handleAddSchedule = (
    name: string,
    date: string,
    amt: number,
  ): string | null => {
    const id = schIdRef.current++;
    setSchedules((prev) => sortSchedules([...prev, { id, name, date, amt }]));
    return null;
  };

  const handleRemoveSchedule = (id: number) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setPayments((prev) => prev.filter((p) => p.schId !== id));
  };

  const handleAddSingle = (
    schId: number,
    date: string,
    amt: number,
  ): string | null => {
    const sch = schedules.find((s) => s.id === schId);
    if (!sch) return "중도금을 찾을 수 없습니다.";
    if (date >= sch.date) return "납부일은 기준일보다 이전이어야 합니다.";
    const id = payIdRef.current++;
    setPayments((prev) =>
      sortPayments([
        ...prev,
        { id, schId, schName: sch.name, date, amt, bulk: false },
      ]),
    );
    return null;
  };

  const handleAddBulk = (
    schId: number,
    startMonth: string,
    endMonth: string,
    day: string,
    amt: number,
  ): string | null => {
    const sch = schedules.find((s) => s.id === schId);
    if (!sch) return "중도금을 찾을 수 없습니다.";
    if (startMonth > endMonth) return "시작 월이 종료 월보다 늦습니다.";

    const [sy, sm] = startMonth.split("-").map(Number);
    const [ey, em] = endMonth.split("-").map(Number);
    const dd = day.padStart(2, "0");
    const newOnes: Payment[] = [];
    let y = sy,
      m = sm;
    while (y < ey || (y === ey && m <= em)) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${dd}`;
      if (dateStr < sch.date) {
        newOnes.push({
          id: payIdRef.current++,
          schId,
          schName: sch.name,
          date: dateStr,
          amt,
          bulk: true,
        });
      }
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    if (newOnes.length === 0) {
      return "기준일 이전에 해당하는 날짜가 없습니다.";
    }
    setPayments((prev) => sortPayments([...prev, ...newOnes]));
    return null;
  };

  const handleRemovePayment = (id: number) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearPayments = () => {
    setPayments([]);
  };

  const handleReset = () => {
    setSchedules([]);
    setPayments([]);
    setRate(5);
    schIdRef.current = 1;
    payIdRef.current = 1;
    clearState().catch(() => {});
  };

  const summary = useMemo(() => {
    const rateDec = rate / 100;
    let totalPaid = 0;
    let totalCredit = 0;
    let sumDaysWeighted = 0;
    let sumAmt = 0;

    for (const p of payments) {
      const sch = schedules.find((s) => s.id === p.schId);
      const dueDate = sch ? sch.date : "";
      const days = dueDate ? daysBetween(p.date, dueDate) : 0;
      const c = calcCredit(p.amt, days, rateDec);
      totalPaid += p.amt;
      totalCredit += c;
      sumDaysWeighted += days * p.amt;
      sumAmt += p.amt;
    }
    const totalScheduled = schedules.reduce((a, s) => a + s.amt, 0);
    const totalRemain = Math.max(0, totalScheduled - totalCredit);
    const totalDiscount = Math.max(0, totalCredit - totalPaid);

    let simpleRate: number | null = null;
    let compoundRate: number | null = null;
    if (sumAmt > 0 && payments.length > 0) {
      const avgDays = sumDaysWeighted / sumAmt;
      simpleRate = effectiveSimple(avgDays, rateDec);
      compoundRate = effectiveCompound(avgDays, rateDec);
    }

    return {
      totalPaid,
      totalCredit,
      totalDiscount,
      totalRemain,
      hasSchedule: schedules.length > 0,
      simpleRate,
      compoundRate,
    };
  }, [schedules, payments, rate]);

  return (
    <div className="px-4 pb-8 pt-4" style={{ fontFamily: "var(--font-sans)" }}>
      <Header onReset={handleReset} />

      <ScheduleSection
        schedules={schedules}
        payments={payments}
        rate={rate}
        onAdd={handleAddSchedule}
        onRemove={handleRemoveSchedule}
        onRateChange={setRate}
      />

      <hr className="divider" />

      <PaymentSection
        schedules={schedules}
        onAddSingle={handleAddSingle}
        onAddBulk={handleAddBulk}
      />

      <hr className="divider" />

      <SummarySection
        totalPaid={summary.totalPaid}
        totalCredit={summary.totalCredit}
        totalDiscount={summary.totalDiscount}
        totalRemain={summary.totalRemain}
        hasSchedule={summary.hasSchedule}
      />

      <RateAnalysis
        nominalRate={rate / 100}
        simpleRate={summary.simpleRate}
        compoundRate={summary.compoundRate}
      />

      <PaymentsTable
        schedules={schedules}
        payments={payments}
        rate={rate}
        onRemove={handleRemovePayment}
        onClearAll={handleClearPayments}
      />
    </div>
  );
}

export default App;
