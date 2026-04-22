import { useEffect, useState } from "react";
import type { ScheduleKind } from "@/lib/calc";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Field } from "@/components/ui/Field";
import { BigInput } from "@/components/ui/BigInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { QuickAmt } from "@/components/ui/QuickAmt";
import { fmtAmtInput, fmtShort, parseAmt } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (sch: {
    name: string;
    date: string;
    amt: number;
    kind: ScheduleKind;
  }) => void;
};

export function AddScheduleSheet({ open, onClose, onSubmit }: Props) {
  const [kind, setKind] = useState<ScheduleKind>("principal");
  const [name, setName] = useState("");
  const [date, setDate] = useState("2028-03-20");
  const [amt, setAmt] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setKind("principal");
      setName("");
      setAmt(0);
      setErr("");
    }
  }, [open]);

  const submit = () => {
    if (!name.trim()) return setErr("이름을 입력해 주세요");
    if (!date) return setErr("기준일을 선택해 주세요");
    if (!amt || amt <= 0) return setErr("금액을 입력해 주세요");
    onSubmit({ name: name.trim(), date, amt, kind });
    onClose();
  };

  const placeholder =
    kind === "principal" ? "예) 중도금 1차" : "예) 옵션비 1차";

  return (
    <BottomSheet open={open} onClose={onClose} title="일정 추가">
      <div className="flex" style={{ gap: 6, marginBottom: 14 }}>
        {(["principal", "option"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            style={{
              flex: 1,
              height: 40,
              border: "none",
              borderRadius: 12,
              background: kind === k ? "var(--pc)" : "#F2F4F6",
              color: kind === k ? "#fff" : "#4E5968",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {k === "principal" ? "중도금" : "옵션비"}
          </button>
        ))}
      </div>
      <Field label="이름">
        <BigInput value={name} onChange={setName} placeholder={placeholder} />
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
