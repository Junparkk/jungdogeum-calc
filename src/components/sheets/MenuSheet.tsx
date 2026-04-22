import type { Payment, Schedule } from "@/lib/calc";
import {
  calcCredit,
  daysBetween,
  effectiveCompound,
  effectiveSimple,
} from "@/lib/calc";
import { fmtWon } from "@/lib/format";
import { BottomSheet } from "@/components/ui/BottomSheet";

type Totals = {
  totalPaid: number;
  totalCredit: number;
  totalScheduled: number;
  totalDiscount: number;
  avgDays: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  totals: Totals;
  schedules: Schedule[];
  payments: Payment[];
  rate: number;
  onClearPays: () => void;
  onReset: () => void;
};

function Row({
  l,
  v,
  accent,
}: {
  l: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
      }}
    >
      <span style={{ color: "#8B95A1" }}>{l}</span>
      <span
        style={{
          color: accent ? "var(--pc)" : "#191F28",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {v}
      </span>
    </div>
  );
}

function aggregateByKind(
  schedules: Schedule[],
  payments: Payment[],
  rate: number,
  kind: "principal" | "option",
) {
  const ks = schedules.filter((s) => s.kind === kind);
  if (ks.length === 0) return null;
  const scheduled = ks.reduce((a, s) => a + s.amt, 0);
  let paid = 0;
  let credit = 0;
  for (const p of payments) {
    const sch = ks.find((s) => s.id === p.schId);
    if (!sch) continue;
    const days = daysBetween(p.date, sch.date);
    paid += p.amt;
    credit += calcCredit(p.amt, days, rate);
  }
  const remain = Math.max(0, scheduled - credit);
  return { scheduled, paid, credit, remain };
}

export function MenuSheet({
  open,
  onClose,
  totals,
  schedules,
  payments,
  rate,
  onClearPays,
  onReset,
}: Props) {
  const remain =
    totals.totalScheduled > 0
      ? fmtWon(Math.max(0, totals.totalScheduled - totals.totalCredit))
      : "—";
  const effS =
    totals.avgDays > 0 ? effectiveSimple(totals.avgDays, rate) : null;
  const effC =
    totals.avgDays > 0 ? effectiveCompound(totals.avgDays, rate) : null;

  const principal = aggregateByKind(schedules, payments, rate, "principal");
  const option = aggregateByKind(schedules, payments, rate, "option");
  const showSplit = principal !== null && option !== null;

  return (
    <BottomSheet open={open} onClose={onClose} title="더보기">
      <div
        style={{
          padding: 16,
          background: "#F9FAFB",
          borderRadius: 14,
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 13, color: "#4E5968", lineHeight: 1.8 }}>
          <Row l="실제 납부액" v={fmtWon(totals.totalPaid)} />
          <Row l="충당액" v={fmtWon(totals.totalCredit)} accent />
          <Row l="총 할인액" v={fmtWon(totals.totalDiscount)} />
          <Row l="전체 잔여액" v={remain} />
          <div style={{ height: 8 }} />
          <Row l="표면 할인율" v={(rate * 100).toFixed(3) + "%"} />
          <Row
            l="단리 실효"
            v={effS != null ? (effS * 100).toFixed(3) + "%" : "—"}
          />
          <Row
            l="복리 실효"
            v={effC != null ? (effC * 100).toFixed(3) + "%" : "—"}
          />
        </div>
      </div>

      {showSplit && (
        <div
          style={{
            padding: 16,
            background: "#F9FAFB",
            borderRadius: 14,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#8B95A1",
              fontWeight: 600,
              letterSpacing: 0.04,
              marginBottom: 6,
            }}
          >
            종류별 합계
          </div>
          <div style={{ fontSize: 13, color: "#4E5968", lineHeight: 1.8 }}>
            <Row
              l="중도금 충당 / 예정"
              v={`${fmtWon(principal!.credit)} / ${fmtWon(principal!.scheduled)}`}
            />
            <Row l="중도금 잔여" v={fmtWon(principal!.remain)} />
            <div style={{ height: 4 }} />
            <Row
              l="옵션비 충당 / 예정"
              v={`${fmtWon(option!.credit)} / ${fmtWon(option!.scheduled)}`}
            />
            <Row l="옵션비 잔여" v={fmtWon(option!.remain)} />
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (totals.totalPaid === 0) return;
          if (window.confirm("납부 내역을 모두 삭제할까요?")) {
            onClearPays();
            onClose();
          }
        }}
        style={{
          width: "100%",
          height: 52,
          border: "none",
          borderRadius: 12,
          background: "#F2F4F6",
          color: "#4E5968",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        납부 내역 전체 삭제
      </button>
      <button
        onClick={() => {
          if (window.confirm("모든 데이터를 초기화할까요?")) {
            onReset();
            onClose();
          }
        }}
        style={{
          width: "100%",
          height: 52,
          border: "none",
          borderRadius: 12,
          background: "#FFF1F0",
          color: "#FF4D4F",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        모든 데이터 초기화
      </button>
    </BottomSheet>
  );
}

export type { Totals as MenuSheetTotals };
