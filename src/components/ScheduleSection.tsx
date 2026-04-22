import { useState } from "react";
import type { Schedule, Payment } from "@/lib/calc";
import { calcCredit, daysBetween, fmt } from "@/lib/calc";

type Props = {
  schedules: Schedule[];
  payments: Payment[];
  rate: number; // 퍼센트 값 (예: 5 = 5%)
  onAdd: (name: string, date: string, amt: number) => string | null;
  onRemove: (id: number) => void;
  onRateChange: (rate: number) => void;
};

export function ScheduleSection({
  schedules,
  payments,
  rate,
  onAdd,
  onRemove,
  onRateChange,
}: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("2028-03-20");
  const [amt, setAmt] = useState("");
  const [warn, setWarn] = useState("");

  const showWarn = (msg: string) => {
    setWarn(msg);
    setTimeout(() => setWarn(""), 3000);
  };

  const handleAdd = () => {
    const n = name.trim();
    const a = parseFloat(amt);
    if (!n) return showWarn("중도금 이름을 입력해주세요.");
    if (!date) return showWarn("기준일을 선택해주세요.");
    if (!a || a <= 0) return showWarn("금액을 입력해주세요.");
    const err = onAdd(n, date, a);
    if (err) return showWarn(err);
    setName("");
    setAmt("");
  };

  return (
    <>
      <div className="section-title">중도금 일정 설정</div>
      <div
        className="mb-2 grid items-end gap-2.5"
        style={{ gridTemplateColumns: "1.2fr 1fr 1fr auto" }}
      >
        <div className="field">
          <label>중도금 이름</label>
          <input
            className="pc-input"
            type="text"
            placeholder="예: 중도금 1차"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>기준일 (납부 예정일)</label>
          <input
            className="pc-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>금액 (원)</label>
          <input
            className="pc-input"
            type="number"
            placeholder="예: 38789000"
            step="100000"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />
        </div>
        <button className="add-btn sm" onClick={handleAdd}>
          + 추가
        </button>
      </div>
      <div className="warning">{warn}</div>

      <div className="mb-4 flex flex-col gap-2">
        {schedules.length === 0 ? (
          <div className="py-2 text-[13px] text-[color:var(--color-text-secondary)]">
            중도금 일정을 추가해주세요.
          </div>
        ) : (
          schedules.map((s) => {
            const rateDec = rate / 100;
            const schPays = payments.filter((p) => p.schId === s.id);
            const totalCredit = schPays.reduce((sum, p) => {
              const days = daysBetween(p.date, s.date);
              return sum + calcCredit(p.amt, days, rateDec);
            }, 0);
            const pct = Math.min(100, (totalCredit / s.amt) * 100);
            const remain = Math.max(0, s.amt - totalCredit);
            return (
              <div key={s.id} className="sch-card">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="sch-badge">{s.name}</span>
                  <span className="sch-meta">
                    기준일: {s.date} &nbsp;|&nbsp; {fmt(s.amt)}
                  </span>
                  <button
                    className="del-btn ml-auto"
                    onClick={() => onRemove(s.id)}
                  >
                    ✕
                  </button>
                </div>
                <div className="sch-progress">
                  <div
                    className="sch-fill"
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
                <div className="sch-nums">
                  <span>충당 {pct.toFixed(1)}%</span>
                  <span>잔여 {fmt(remain)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-[13px] text-[color:var(--color-text-secondary)]">
          연 할인율
        </span>
        <input
          className="pc-input"
          type="number"
          step="0.1"
          min="0"
          max="100"
          style={{ width: 80 }}
          value={rate}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onRateChange(isNaN(v) ? 0 : v);
          }}
        />
        <span className="text-[13px] text-[color:var(--color-text-secondary)]">
          %
        </span>
      </div>
    </>
  );
}
