import type { Payment, Schedule } from "@/lib/calc";
import { canPayInto, KIND_LABEL } from "@/lib/calc";
import { fmtShort } from "@/lib/format";

type Props = {
  schedules: Schedule[];
  payments: Payment[];
  rate: number;
  value: number | null;
  onChange: (id: number) => void;
};

export function ScheduleSelector({
  schedules,
  payments,
  rate,
  value,
  onChange,
}: Props) {
  const sorted = [...schedules].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  if (sorted.length === 0) {
    return (
      <div
        style={{
          padding: "12px 14px",
          background: "#F2F4F6",
          borderRadius: 14,
          fontSize: 13,
          color: "#8B95A1",
        }}
      >
        등록된 일정이 없어요
      </div>
    );
  }

  const allLocked = sorted.every(
    (s) => !canPayInto(s, schedules, payments, rate).ok,
  );

  if (allLocked) {
    return (
      <div
        style={{
          padding: "14px",
          background: "#FFFBEB",
          borderRadius: 14,
          fontSize: 13,
          color: "#8B6914",
          lineHeight: 1.5,
        }}
      >
        모든 일정이 충당 완료됐어요. 새 일정을 추가하거나 기존 납부를
        조정해주세요.
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      {sorted.map((s) => {
        const lock = canPayInto(s, schedules, payments, rate);
        const selected = value === s.id;
        const disabled = !lock.ok;
        const isOption = s.kind === "option";

        return (
          <button
            key={s.id}
            onClick={() => !disabled && onChange(s.id)}
            disabled={disabled}
            className="flex items-center text-left"
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: selected
                ? "1.5px solid var(--pc)"
                : "1.5px solid transparent",
              background: disabled
                ? "#F8F9FA"
                : selected
                  ? "var(--pc-tint)"
                  : "#F2F4F6",
              cursor: disabled ? "not-allowed" : "pointer",
              gap: 10,
              opacity: disabled ? 0.6 : 1,
              transition: "all 120ms",
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: isOption ? "#FFF4E5" : "var(--pc-tint)",
                color: isOption ? "#F59E0B" : "var(--pc)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {isOption ? "옵션" : "중도"}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: disabled ? "#8B95A1" : "#191F28",
                  letterSpacing: -0.2,
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#8B95A1",
                  marginTop: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {disabled
                  ? lock.reason
                  : `${KIND_LABEL[s.kind]} · ${s.date} · ${fmtShort(s.amt)}원`}
              </div>
            </div>
            {selected && !disabled && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                className="flex-shrink-0"
              >
                <path
                  d="M4 9l3.5 3.5L14 6"
                  stroke="var(--pc)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
