import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Field } from "@/components/ui/Field";
import { BigInput } from "@/components/ui/BigInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Props = {
  open: boolean;
  onClose: () => void;
  rate: number;
  onChange: (rate: number) => void;
};

const PRESETS = [3, 4, 5, 6, 7];

export function RateSheet({ open, onClose, rate, onChange }: Props) {
  const [val, setVal] = useState((rate * 100).toFixed(1));

  useEffect(() => {
    if (open) setVal((rate * 100).toFixed(1));
  }, [open, rate]);

  const num = parseFloat(val) || 0;

  return (
    <BottomSheet open={open} onClose={onClose} title="연 할인율 설정">
      <div
        style={{
          padding: "18px 16px",
          background: "#F9FAFB",
          borderRadius: 14,
          textAlign: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "var(--pc)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -1,
          }}
        >
          {num.toFixed(1)}
          <span style={{ fontSize: 26 }}>%</span>
        </div>
      </div>
      <Field label="직접 입력">
        <BigInput
          value={val}
          onChange={setVal}
          inputMode="decimal"
          suffix="%"
        />
      </Field>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setVal(p.toFixed(1))}
            style={{
              flex: 1,
              height: 40,
              border: "none",
              borderRadius: 10,
              background:
                Math.abs(num - p) < 0.05 ? "var(--pc)" : "#F2F4F6",
              color: Math.abs(num - p) < 0.05 ? "#fff" : "#4E5968",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {p}%
          </button>
        ))}
      </div>
      <div
        style={{
          padding: "12px 14px",
          background: "#FFF9E6",
          borderRadius: 12,
          fontSize: 12,
          color: "#8B6914",
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        <b>공식</b> 수납인정금액 = 납부액 ÷ (1 − 연이율 × 선납일수 / 365)
        <br />
        할인율이 미래가치 기준이라 실효이율은 표면이율보다 살짝 높아요.
      </div>
      <PrimaryButton
        onClick={() => {
          onChange(num / 100);
          onClose();
        }}
      >
        적용하기
      </PrimaryButton>
    </BottomSheet>
  );
}
