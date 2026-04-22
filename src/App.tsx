import { useEffect, useMemo, useState } from "react";
import type { Payment, Schedule } from "@/lib/calc";
import { calcCredit, daysBetween } from "@/lib/calc";
import { clearState, loadState, saveState } from "@/lib/storage";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { ScheduleCard } from "@/components/ScheduleCard";
import { Fab } from "@/components/Fab";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AddScheduleSheet } from "@/components/sheets/AddScheduleSheet";
import { AddPaymentSheet } from "@/components/sheets/AddPaymentSheet";
import { AddBulkSheet } from "@/components/sheets/AddBulkSheet";
import { RateSheet } from "@/components/sheets/RateSheet";
import { MenuSheet } from "@/components/sheets/MenuSheet";

type SheetKind = null | "sch" | "pay" | "bulk" | "rate" | "menu";

type PersistedState = {
  schedules: Schedule[];
  payments: Payment[];
  rate: number;
  schIdCounter: number;
  payIdCounter: number;
};

const DEFAULT_STATE: PersistedState = {
  schedules: [],
  payments: [],
  rate: 0.05,
  schIdCounter: 1,
  payIdCounter: 1,
};

function App() {
  const [loaded, setLoaded] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rate, setRate] = useState(0.05);
  const [schIdCounter, setSchIdCounter] = useState(1);
  const [payIdCounter, setPayIdCounter] = useState(1);

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [sheetSch, setSheetSch] = useState<Schedule | null>(null);

  // 복원
  useEffect(() => {
    let cancelled = false;
    loadState<PersistedState>().then((saved) => {
      if (cancelled) return;
      const s = saved ?? DEFAULT_STATE;
      setSchedules(s.schedules ?? []);
      setPayments(s.payments ?? []);
      setRate(typeof s.rate === "number" ? s.rate : 0.05);
      setSchIdCounter(s.schIdCounter ?? 1);
      setPayIdCounter(s.payIdCounter ?? 1);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 자동 저장
  useEffect(() => {
    if (!loaded) return;
    saveState<PersistedState>({
      schedules,
      payments,
      rate,
      schIdCounter,
      payIdCounter,
    }).catch(() => {});
  }, [loaded, schedules, payments, rate, schIdCounter, payIdCounter]);

  const addSchedule = (sch: Omit<Schedule, "id">) => {
    setSchedules(
      [...schedules, { ...sch, id: schIdCounter }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    setSchIdCounter(schIdCounter + 1);
  };
  const removeSchedule = (id: number) => {
    setSchedules(schedules.filter((s) => s.id !== id));
    setPayments(payments.filter((p) => p.schId !== id));
  };
  const addPayment = (pay: Omit<Payment, "id">) => {
    setPayments(
      [...payments, { ...pay, id: payIdCounter }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    setPayIdCounter(payIdCounter + 1);
  };
  const addBulkPayments = (pays: Omit<Payment, "id">[]) => {
    let counter = payIdCounter;
    const newPays = pays.map((p) => ({ ...p, id: counter++ }));
    setPayments(
      [...payments, ...newPays].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setPayIdCounter(counter);
  };
  const removePayment = (id: number) =>
    setPayments(payments.filter((p) => p.id !== id));

  const totals = useMemo(() => {
    let totalPaid = 0;
    let totalCredit = 0;
    let sumDays = 0;
    let sumAmt = 0;
    for (const p of payments) {
      const sch = schedules.find((s) => s.id === p.schId);
      if (!sch) continue;
      const days = daysBetween(p.date, sch.date);
      const c = calcCredit(p.amt, days, rate);
      totalPaid += p.amt;
      totalCredit += c;
      sumDays += days * p.amt;
      sumAmt += p.amt;
    }
    const totalScheduled = schedules.reduce((a, s) => a + s.amt, 0);
    return {
      totalPaid,
      totalCredit,
      totalScheduled,
      totalDiscount: Math.max(0, totalCredit - totalPaid),
      avgDays: sumAmt > 0 ? sumDays / sumAmt : 0,
    };
  }, [schedules, payments, rate]);

  const openAddPay = (sch: Schedule) => {
    setSheetSch(sch);
    setSheet("pay");
  };
  const openAddBulk = (sch: Schedule) => {
    setSheetSch(sch);
    setSheet("bulk");
  };
  const close = () => setSheet(null);

  const handleReset = () => {
    setSchedules([]);
    setPayments([]);
    setRate(0.05);
    setSchIdCounter(1);
    setPayIdCounter(1);
    clearState().catch(() => {});
  };

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <TopBar onMenu={() => setSheet("menu")} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <Hero
          totals={totals}
          rate={rate}
          onRateClick={() => setSheet("rate")}
        />

        <div
          className="flex items-center justify-between"
          style={{ padding: "22px 20px 12px" }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#191F28",
              letterSpacing: -0.4,
            }}
          >
            중도금 일정
          </div>
          <span style={{ fontSize: 13, color: "#8B95A1", fontWeight: 500 }}>
            {schedules.length}건
          </span>
        </div>

        {schedules.length === 0 ? (
          <div
            style={{
              margin: "0 16px 12px",
              padding: "36px 20px",
              background: "#fff",
              borderRadius: 18,
              textAlign: "center",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.03), 0 4px 14px rgba(17,24,39,0.04)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#191F28",
                marginBottom: 4,
              }}
            >
              중도금을 추가해 보세요
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#8B95A1",
                marginBottom: 16,
              }}
            >
              기준일과 금액을 입력하면 할인액이 자동 계산돼요
            </div>
            <PrimaryButton
              onClick={() => setSheet("sch")}
              style={{ height: 48 }}
            >
              + 중도금 추가
            </PrimaryButton>
          </div>
        ) : (
          <>
            {schedules.map((sch, i) => (
              <ScheduleCard
                key={sch.id}
                sch={sch}
                payments={payments}
                rate={rate}
                defaultOpen={i === 0}
                onAddPay={openAddPay}
                onAddBulk={openAddBulk}
                onRemoveSch={removeSchedule}
                onRemovePay={removePayment}
              />
            ))}
            <button
              onClick={() => setSheet("sch")}
              style={{
                width: "calc(100% - 32px)",
                margin: "0 16px 16px",
                padding: 16,
                border: "1.5px dashed #D1D6DB",
                borderRadius: 18,
                background: "transparent",
                color: "#4E5968",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + 중도금 추가
            </button>
          </>
        )}

        <div style={{ height: 96 }} />
      </div>

      {schedules.length > 0 && <Fab onClick={() => openAddPay(schedules[0])} />}

      <AddScheduleSheet
        open={sheet === "sch"}
        onClose={close}
        onSubmit={addSchedule}
      />
      <AddPaymentSheet
        open={sheet === "pay"}
        onClose={close}
        onSubmit={addPayment}
        sch={sheetSch}
      />
      <AddBulkSheet
        open={sheet === "bulk"}
        onClose={close}
        onSubmit={addBulkPayments}
        sch={sheetSch}
      />
      <RateSheet
        open={sheet === "rate"}
        onClose={close}
        rate={rate}
        onChange={setRate}
      />
      <MenuSheet
        open={sheet === "menu"}
        onClose={close}
        totals={totals}
        rate={rate}
        onClearPays={() => setPayments([])}
        onReset={handleReset}
      />
    </div>
  );
}

export default App;
