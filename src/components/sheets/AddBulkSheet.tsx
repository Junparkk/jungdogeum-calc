import { useEffect, useMemo, useState } from "react";
import type { Payment, Schedule } from "@/lib/calc";
import { canPayInto, KIND_LABEL, paidFor } from "@/lib/calc";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Field } from "@/components/ui/Field";
import { BigInput } from "@/components/ui/BigInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { QuickAmt } from "@/components/ui/QuickAmt";
import { fmtAmtInput, fmtShort, fmtWon, parseAmt } from "@/lib/format";
import { ScheduleSelector } from "./ScheduleSelector";

type BulkPay = Omit<Payment, "id">;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (pays: BulkPay[]) => void;
  schedules: Schedule[];
  payments: Payment[];
  preselectedSch: Schedule | null;
};

const DAY_OPTS = [1, 5, 10, 15, 20, 25];

export function AddBulkSheet({
  open,
  onClose,
  onSubmit,
  schedules,
  payments,
  preselectedSch,
}: Props) {
  const today = new Date().toISOString().slice(0, 7);
  const [schId, setSchId] = useState<number | null>(null);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState("2028-02");
  const [day, setDay] = useState("10");
  const [amt, setAmt] = useState(0);
  const [err, setErr] = useState("");

  const defaultId = useMemo(() => {
    if (preselectedSch) return preselectedSch.id;
    const candidates = [...schedules].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const firstUnlocked = candidates.find(
      (s) => canPayInto(s, schedules, payments).ok,
    );
    return firstUnlocked?.id ?? candidates[0]?.id ?? null;
  }, [open, preselectedSch, schedules, payments]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setSchId(defaultId);
      setStart(today);
      setEnd("2028-02");
      setDay("10");
      setAmt(0);
      setErr("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sch = schedules.find((s) => s.id === schId) ?? null;

  const submit = () => {
    if (!sch) return setErr("일정을 선택해 주세요");
    const lock = canPayInto(sch, schedules, payments);
    if (!lock.ok) return setErr(lock.reason);
    if (!start || !end) return setErr("시작/종료 월을 선택해 주세요");
    if (start > end) return setErr("시작 월이 종료 월보다 늦습니다");
    if (!amt || amt <= 0) return setErr("월 납부액을 입력해 주세요");

    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    const pays: BulkPay[] = [];
    let y = sy,
      m = sm;
    while (y < ey || (y === ey && m <= em)) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${day.padStart(2, "0")}`;
      if (dateStr < sch.date) {
        pays.push({
          schId: sch.id,
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
    if (pays.length === 0)
      return setErr("기준일 이전에 해당하는 날짜가 없어요");

    // 납부합 한도 검증 (납부 기준)
    const addedPaid = pays.reduce((s, p) => s + p.amt, 0);
    const current = paidFor(sch, payments);
    const overflow = current + addedPaid - sch.amt;
    if (overflow > 0.5) {
      return setErr(
        `${pays.length}회 일괄 시 납부합이 ${fmtWon(overflow)} 초과해요. 월 납부액이나 기간을 줄여주세요.`,
      );
    }

    onSubmit(pays);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="월 일괄 추가">
      <Field label={`${KIND_LABEL.principal} / ${KIND_LABEL.option} 선택`}>
        <ScheduleSelector
          schedules={schedules}
          payments={payments}
          value={schId}
          onChange={setSchId}
        />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="시작 월">
            <BigInput type="month" value={start} onChange={setStart} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="종료 월">
            <BigInput type="month" value={end} onChange={setEnd} />
          </Field>
        </div>
      </div>
      <Field label="매월 납부일">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DAY_OPTS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(String(d))}
              style={{
                flex: "1 0 calc(33% - 4px)",
                minWidth: 0,
                height: 44,
                border: "none",
                borderRadius: 12,
                background: day === String(d) ? "var(--pc)" : "#F2F4F6",
                color: day === String(d) ? "#fff" : "#4E5968",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 120ms",
              }}
            >
              {d}일
            </button>
          ))}
        </div>
      </Field>
      <Field
        label="월 납부액"
        hint={amt > 0 ? fmtShort(amt) + "원" : "예) 2,000,000"}
      >
        <BigInput
          inputMode="numeric"
          value={fmtAmtInput(amt)}
          onChange={(v) => setAmt(parseAmt(v))}
          placeholder="0"
          suffix="원"
        />
      </Field>
      <QuickAmt
        onPick={(n) => setAmt(amt + n)}
        items={[100_000, 500_000, 1_000_000]}
      />
      {err && (
        <div style={{ fontSize: 13, color: "#FF4D4F", marginTop: 4 }}>
          {err}
        </div>
      )}
      <div style={{ height: 12 }} />
      <PrimaryButton onClick={submit}>일괄 추가</PrimaryButton>
    </BottomSheet>
  );
}
