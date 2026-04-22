import { useState } from "react";
import type { Payment, Schedule } from "@/lib/calc";
import { calcCredit, daysBetween } from "@/lib/calc";
import { fmtNum, fmtShort } from "@/lib/format";
import { GhostButton } from "@/components/ui/GhostButton";

type Props = {
  sch: Schedule;
  payments: Payment[];
  rate: number;
  defaultOpen?: boolean;
  onAddPay: (sch: Schedule) => void;
  onAddBulk: (sch: Schedule) => void;
  onRemoveSch: (id: number) => void;
  onRemovePay: (id: number) => void;
};

export function ScheduleCard({
  sch,
  payments,
  rate,
  defaultOpen = false,
  onAddPay,
  onAddBulk,
  onRemoveSch,
  onRemovePay,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const isOption = sch.kind === "option";

  const schPays = payments
    .filter((p) => p.schId === sch.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const totalPaid = schPays.reduce((s, p) => s + p.amt, 0);
  const totalCredit = schPays.reduce((s, p) => {
    const days = daysBetween(p.date, sch.date);
    return s + calcCredit(p.amt, days, rate);
  }, 0);
  const discount = Math.max(0, totalCredit - totalPaid);
  const pct = Math.min(100, (totalCredit / sch.amt) * 100);
  const remain = Math.max(0, sch.amt - totalCredit);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        margin: "0 16px 12px",
        overflow: "hidden",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.03), 0 4px 14px rgba(17,24,39,0.04)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center text-left"
        style={{
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          gap: 12,
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: isOption ? "#FFF4E5" : "var(--pc-tint)",
          }}
        >
          {isOption ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12l-8 8a2.83 2.83 0 0 1-4 0L3 15a2.83 2.83 0 0 1 0-4l8-8h9v9z"
                stroke="#F59E0B"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="15.5" cy="8.5" r="1.5" fill="#F59E0B" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="3"
                stroke="var(--pc)"
                strokeWidth="1.8"
              />
              <path
                d="M3 10h18M8 3v4M16 3v4"
                stroke="var(--pc)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="flex items-center"
            style={{ gap: 6, minWidth: 0 }}
          >
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#191F28",
                letterSpacing: -0.3,
                minWidth: 0,
              }}
            >
              {sch.name}
            </span>
            <span
              className="flex-shrink-0"
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 999,
                background: isOption ? "#FFF4E5" : "var(--pc-tint)",
                color: isOption ? "#F59E0B" : "var(--pc)",
              }}
            >
              {isOption ? "옵션" : "중도"}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#8B95A1",
              marginTop: 2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            기준일 {sch.date} · {fmtShort(sch.amt)}원
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--pc)",
            fontVariantNumeric: "tabular-nums",
            marginRight: 6,
          }}
        >
          {pct.toFixed(0)}%
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="flex-shrink-0"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 220ms ease",
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="#8B95A1"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {/* progress bar */}
      <div style={{ padding: "0 18px 14px" }}>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "#F2F4F6",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: pct + "%",
              background: pct >= 100 ? "var(--success)" : "var(--pc)",
              borderRadius: 999,
              transition: "width 400ms ease, background 200ms",
            }}
          />
        </div>
        <div
          className="flex whitespace-nowrap"
          style={{
            justifyContent: "space-between",
            gap: 8,
            marginTop: 8,
            fontSize: 12,
            color: "#4E5968",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            할인{" "}
            <b style={{ color: "var(--discount)", fontWeight: 700 }}>
              +{fmtShort(discount)}원
            </b>
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            잔여 {fmtShort(remain)}원
          </span>
        </div>
      </div>

      {/* expanded body */}
      <div
        style={{
          maxHeight: open ? 2000 : 0,
          overflow: "hidden",
          transition: "max-height 360ms ease",
        }}
      >
        <div
          style={{
            borderTop: "1px solid #F2F4F6",
            padding: "14px 18px 16px",
            background: "#FAFBFC",
          }}
        >
          {schPays.length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: "#8B95A1",
                padding: "10px 0",
                textAlign: "center",
              }}
            >
              아직 납부 내역이 없어요
            </div>
          ) : (
            <Timeline
              sch={sch}
              pays={schPays}
              rate={rate}
              onRemove={onRemovePay}
            />
          )}

          <div className="flex" style={{ gap: 8, marginTop: 12 }}>
            <GhostButton
              onClick={() => onAddPay(sch)}
              style={{
                flex: 1,
                background: "var(--pc-tint)",
                color: "var(--pc)",
              }}
            >
              + 납부 추가
            </GhostButton>
            <GhostButton onClick={() => onAddBulk(sch)} style={{ flex: 1 }}>
              월 일괄
            </GhostButton>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `'${sch.name}'을(를) 삭제할까요?\n관련 납부 내역도 함께 지워집니다.`,
                  )
                )
                  onRemoveSch(sch.id);
              }}
              style={{
                width: 44,
                height: 44,
                border: "none",
                borderRadius: 12,
                background: "#FFF1F0",
                color: "#FF4D4F",
                fontSize: 16,
                cursor: "pointer",
              }}
              aria-label="중도금 삭제"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline({
  sch,
  pays,
  rate,
  onRemove,
}: {
  sch: Schedule;
  pays: Payment[];
  rate: number;
  onRemove: (id: number) => void;
}) {
  return (
    <div style={{ position: "relative", paddingLeft: 20 }}>
      <div
        style={{
          position: "absolute",
          left: 5,
          top: 6,
          bottom: 6,
          width: 2,
          background:
            "linear-gradient(180deg, var(--pc) 0%, #E5E8EB 100%)",
          borderRadius: 999,
        }}
      />
      {pays.map((p, i) => {
        const days = daysBetween(p.date, sch.date);
        const c = calcCredit(p.amt, days, rate);
        const disc = c - p.amt;
        return (
          <div
            key={p.id}
            style={{
              position: "relative",
              marginBottom: i === pays.length - 1 ? 0 : 12,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -20,
                top: 5,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#fff",
                border: "2.5px solid var(--pc)",
              }}
            />
            <div
              className="flex items-start"
              style={{ gap: 8 }}
            >
              <div className="min-w-0 flex-1">
                <div
                  className="flex items-center"
                  style={{
                    gap: 6,
                    fontSize: 13,
                    color: "#4E5968",
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span>{p.date.slice(5).replace("-", "/")}</span>
                  <span style={{ color: "#D1D6DB" }}>·</span>
                  <span style={{ color: "#8B95A1", fontSize: 12 }}>
                    D-{days}
                  </span>
                  {p.bulk && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--pc)",
                        background: "var(--pc-tint)",
                        padding: "1px 6px",
                        borderRadius: 999,
                      }}
                    >
                      일괄
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#191F28",
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: -0.3,
                  }}
                >
                  {fmtNum(p.amt)}
                  <span
                    style={{
                      fontSize: 13,
                      color: "#8B95A1",
                      fontWeight: 500,
                    }}
                  >
                    원
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--discount)",
                    fontWeight: 600,
                    marginTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  + {fmtNum(disc)}원 할인
                </div>
              </div>
              <button
                onClick={() => onRemove(p.id)}
                className="flex-shrink-0"
                style={{
                  width: 30,
                  height: 30,
                  border: "none",
                  borderRadius: 999,
                  background: "transparent",
                  color: "#B0B8C1",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
