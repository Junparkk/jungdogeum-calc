import { useEffect, useState } from "react";
import type { Schedule } from "@/lib/calc";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Field } from "@/components/ui/Field";
import { BigInput } from "@/components/ui/BigInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { QuickAmt } from "@/components/ui/QuickAmt";
import { fmtAmtInput, fmtShort, parseAmt } from "@/lib/format";

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
  sch: Schedule | null;
};

export function AddPaymentSheet({ open, onClose, onSubmit, sch }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [amt, setAmt] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setDate(today);
      setAmt(0);
      setErr("");
    }
    // today은 매 렌더 새로 계산되므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = () => {
    if (!sch) return;
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
      {sch && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--pc-tint)",
            borderRadius: 12,
            marginBottom: 14,
            fontSize: 13,
            color: "var(--pc)",
            fontWeight: 600,
          }}
        >
          {sch.name} · 기준일 {sch.date}
        </div>
      )}
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
