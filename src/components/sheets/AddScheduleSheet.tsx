import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Field } from "@/components/ui/Field";
import { BigInput } from "@/components/ui/BigInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { QuickAmt } from "@/components/ui/QuickAmt";
import { fmtAmtInput, fmtShort, parseAmt } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (sch: { name: string; date: string; amt: number }) => void;
};

export function AddScheduleSheet({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("2028-03-20");
  const [amt, setAmt] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setAmt(0);
      setErr("");
    }
  }, [open]);

  const submit = () => {
    if (!name.trim()) return setErr("중도금 이름을 입력해 주세요");
    if (!date) return setErr("기준일을 선택해 주세요");
    if (!amt || amt <= 0) return setErr("금액을 입력해 주세요");
    onSubmit({ name: name.trim(), date, amt });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="중도금 추가">
      <Field label="이름">
        <BigInput
          value={name}
          onChange={setName}
          placeholder="예) 중도금 1차"
        />
      </Field>
      <Field label="기준일 (납부 예정일)">
        <BigInput type="date" value={date} onChange={setDate} />
      </Field>
      <Field
        label="금액"
        hint={amt > 0 ? fmtShort(amt) + "원" : "예) 38,789,000"}
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
        <div
          style={{
            fontSize: 13,
            color: "#FF4D4F",
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          {err}
        </div>
      )}
      <div style={{ height: 12 }} />
      <PrimaryButton onClick={submit}>추가하기</PrimaryButton>
    </BottomSheet>
  );
}
