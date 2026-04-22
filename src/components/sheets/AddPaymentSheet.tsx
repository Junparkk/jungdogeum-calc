import { useEffect, useMemo, useState } from "react";
import type { Payment, Schedule } from "@/lib/calc";
import { canPayInto, KIND_LABEL } from "@/lib/calc";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Field } from "@/components/ui/Field";
import { BigInput } from "@/components/ui/BigInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { QuickAmt } from "@/components/ui/QuickAmt";
import { fmtAmtInput, fmtShort, parseAmt } from "@/lib/format";
import { ScheduleSelector } from "./ScheduleSelector";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (pay: {
    schId: number;
    schName: string;
    date: string;
    amt: number;
    bulk: false;
  }) => void;
  schedules: Schedule[];
  payments: Payment[];
  rate: number;
  preselectedSch: Schedule | null;
};

export function AddPaymentSheet({
  open,
  onClose,
  onSubmit,
  schedules,
  payments,
  rate,
  preselectedSch,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [schId, setSchId] = useState<number | null>(null);
  const [date, setDate] = useState(today);
  const [amt, setAmt] = useState(0);
  const [err, setErr] = useState("");

  // 시트 열릴 때 기본값 세팅: 지정된 sch 있으면 그걸로, 없으면 가장 빠른 미충족
  const defaultId = useMemo(() => {
    if (preselectedSch) return preselectedSch.id;
    const candidates = [...schedules].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const firstUnlocked = candidates.find(
      (s) => canPayInto(s, schedules, payments, rate).ok,
    );
    return firstUnlocked?.id ?? candidates[0]?.id ?? null;
  }, [open, preselectedSch, schedules, payments, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setSchId(defaultId);
      setDate(today);
      setAmt(0);
      setErr("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sch = schedules.find((s) => s.id === schId) ?? null;

  const submit = () => {
    if (!sch) return setErr("일정을 선택해 주세요");
    const lock = canPayInto(sch, schedules, payments, rate);
    if (!lock.ok) return setErr(lock.reason);
    if (!date) return setErr("납부일을 선택해 주세요");
    if (!amt || amt <= 0) return setErr("납부액을 입력해 주세요");
    if (date >= sch.date)
      return setErr("납부일은 기준일보다 이전이어야 해요");
    onSubmit({
      schId: sch.id,
      schName: sch.name,
      date,
      amt,
      bulk: false,
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="납부 추가">
      <Field label={`${KIND_LABEL.principal} / ${KIND_LABEL.option} 선택`}>
        <ScheduleSelector
          schedules={schedules}
          payments={payments}
          rate={rate}
          value={schId}
          onChange={setSchId}
        />
      </Field>
      <Field label="납부일">
        <BigInput type="date" value={date} onChange={setDate} />
      </Field>
      <Field
        label="납부액"
        hint={amt > 0 ? fmtShort(amt) + "원" : "예) 3,000,000"}
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
        items={[100_000, 1_000_000, 10_000_000]}
      />
      {err && (
        <div style={{ fontSize: 13, color: "#FF4D4F", marginTop: 4 }}>
          {err}
        </div>
      )}
      <div style={{ height: 12 }} />
      <PrimaryButton onClick={submit}>추가하기</PrimaryButton>
    </BottomSheet>
  );
}
