import { effectiveSimple } from "@/lib/calc";
import { fmtNum, fmtShort } from "@/lib/format";

type Totals = {
  totalPaid: number;
  totalCredit: number;
  totalScheduled: number;
  totalDiscount: number;
  avgDays: number;
};

type Props = {
  totals: Totals;
  rate: number;
  onRateClick: () => void;
};

function SubMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{
        minWidth: 0,
        padding: "10px 12px",
        background: "#F2F4F6",
        borderRadius: 12,
        gap: 2,
      }}
    >
      <span style={{ fontSize: 11, color: "#8B95A1", fontWeight: 500 }}>
        {label}
      </span>
      <span
        className="overflow-hidden text-ellipsis whitespace-nowrap"
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#191F28",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -0.3,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function Hero({ totals, rate, onRateClick }: Props) {
  const { totalPaid, totalCredit, totalScheduled, totalDiscount, avgDays } =
    totals;
  const hasData = totalPaid > 0;
  const effS = effectiveSimple(avgDays || 0, rate);
  // Hero 진행률은 충당(=실납입+할인) 기준 — 잔여 칩과 합산이 100%로 떨어져야 자연스러움
  const pct =
    totalScheduled > 0 ? Math.min(100, (totalCredit / totalScheduled) * 100) : 0;
  const realRemain = Math.max(0, totalScheduled - totalCredit);

  return (
    <div
      style={{
        padding: "4px 20px 20px",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#4E5968",
          letterSpacing: -0.2,
          marginBottom: 8,
        }}
      >
        지금까지 아낀 돈
      </div>

      <div
        className="flex items-baseline"
        style={{
          gap: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span
          style={{
            fontSize: hasData ? 42 : 34,
            fontWeight: 800,
            color: "#191F28",
            letterSpacing: -1.5,
            lineHeight: 1.05,
          }}
        >
          {hasData ? fmtNum(totalDiscount) : "0"}
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#191F28",
            letterSpacing: -0.6,
          }}
        >
          원
        </span>
      </div>

      {/* 진행률 */}
      <div style={{ marginTop: 18 }}>
        <div
          className="flex justify-between whitespace-nowrap"
          style={{
            gap: 8,
            fontSize: 12,
            color: "#8B95A1",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            충당 {totalScheduled > 0 ? pct.toFixed(1) : "0.0"}%
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            {fmtShort(totalCredit)}
            {totalScheduled > 0 ? " / " + fmtShort(totalScheduled) : ""}
          </span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "#E5E8EB",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: pct + "%",
              background: "var(--pc)",
              borderRadius: 999,
              transition: "width 400ms ease",
            }}
          />
        </div>
      </div>

      {/* 서브 메트릭 + 이율 */}
      <div className="flex" style={{ gap: 10, marginTop: 16 }}>
        <SubMetric label="실납입" value={fmtShort(totalPaid) + "원"} />
        <SubMetric
          label="잔여"
          value={totalScheduled > 0 ? fmtShort(realRemain) + "원" : "—"}
        />
        <button
          onClick={onRateClick}
          className="flex flex-1 flex-col overflow-hidden text-left"
          style={{
            minWidth: 0,
            padding: "10px 12px",
            background: "var(--pc-tint)",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            gap: 2,
            position: "relative",
          }}
        >
          <span
            className="flex items-center"
            style={{
              fontSize: 11,
              color: "var(--pc)",
              fontWeight: 600,
              gap: 3,
            }}
          >
            연 할인율
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M8.5 2l1.5 1.5-6 6-2 .5.5-2 6-6z"
                stroke="var(--pc)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className="overflow-hidden text-ellipsis whitespace-nowrap"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#191F28",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: -0.3,
            }}
          >
            {(rate * 100).toFixed(1)}%
          </span>
          {effS != null && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "var(--pc)",
                opacity: 0.75,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              실효 {(effS * 100).toFixed(1)}%
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
