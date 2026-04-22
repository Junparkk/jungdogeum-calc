import { useState } from "react";
import type { Schedule } from "@/lib/calc";

type AddSingle = (
  schId: number,
  date: string,
  amt: number,
) => string | null;
type AddBulk = (
  schId: number,
  startMonth: string,
  endMonth: string,
  day: string,
  amt: number,
) => string | null;

type Props = {
  schedules: Schedule[];
  onAddSingle: AddSingle;
  onAddBulk: AddBulk;
};

export function PaymentSection({
  schedules,
  onAddSingle,
  onAddBulk,
}: Props) {
  const [tab, setTab] = useState<"single" | "bulk">("single");

  return (
    <>
      <div className="section-title">납부 내역 추가</div>
      <div className="mb-3 flex gap-1.5">
        <button
          className={`tab ${tab === "single" ? "active" : ""}`}
          onClick={() => setTab("single")}
        >
          날짜 직접 입력
        </button>
        <button
          className={`tab ${tab === "bulk" ? "active" : ""}`}
          onClick={() => setTab("bulk")}
        >
          월 단위 일괄 입력
        </button>
      </div>

      {tab === "single" ? (
        <SinglePanel schedules={schedules} onAdd={onAddSingle} />
      ) : (
        <BulkPanel schedules={schedules} onAdd={onAddBulk} />
      )}
    </>
  );
}

function SinglePanel({
  schedules,
  onAdd,
}: {
  schedules: Schedule[];
  onAdd: AddSingle;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [schId, setSchId] = useState("");
  const [date, setDate] = useState(today);
  const [amt, setAmt] = useState("");
  const [warn, setWarn] = useState("");

  const showWarn = (msg: string) => {
    setWarn(msg);
    setTimeout(() => setWarn(""), 3000);
  };

  const handleAdd = () => {
    const id = parseInt(schId);
    const a = parseFloat(amt);
    if (!id) return showWarn("중도금을 선택해주세요.");
    if (!date) return showWarn("납부일을 입력해주세요.");
    if (!a || a <= 0) return showWarn("납부액을 입력해주세요.");
    const err = onAdd(id, date, a);
    if (err) return showWarn(err);
    setAmt("");
  };

  return (
    <>
      <div
        className="grid items-end gap-2.5"
        style={{ gridTemplateColumns: "1.4fr 1fr 1.4fr auto" }}
      >
        <div className="field">
          <label>중도금 선택</label>
          <select
            className="pc-input"
            value={schId}
            onChange={(e) => setSchId(e.target.value)}
          >
            {schedules.length === 0 ? (
              <option value="">-- 중도금을 먼저 추가하세요 --</option>
            ) : (
              <>
                <option value="">-- 중도금 선택 --</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.date})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <div className="field">
          <label>납부일</label>
          <input
            className="pc-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>납부액 (원)</label>
          <input
            className="pc-input"
            type="number"
            placeholder="예: 3000000"
            step="100000"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={handleAdd}>
          + 추가
        </button>
      </div>
      <div className="warning">{warn}</div>
    </>
  );
}

function BulkPanel({
  schedules,
  onAdd,
}: {
  schedules: Schedule[];
  onAdd: AddBulk;
}) {
  const monthStr = new Date().toISOString().slice(0, 7);
  const [schId, setSchId] = useState("");
  const [start, setStart] = useState(monthStr);
  const [end, setEnd] = useState("2028-02");
  const [day, setDay] = useState("1");
  const [amt, setAmt] = useState("");
  const [warn, setWarn] = useState("");

  const showWarn = (msg: string) => {
    setWarn(msg);
    setTimeout(() => setWarn(""), 3000);
  };

  const handleAdd = () => {
    const id = parseInt(schId);
    const a = parseFloat(amt);
    if (!id) return showWarn("중도금을 선택해주세요.");
    if (!start || !end) return showWarn("시작/종료 월을 선택해주세요.");
    if (!a || a <= 0) return showWarn("납부액을 입력해주세요.");
    const err = onAdd(id, start, end, day, a);
    if (err) return showWarn(err);
  };

  return (
    <>
      <div
        className="grid items-end gap-2.5"
        style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto" }}
      >
        <div className="field">
          <label>중도금 선택</label>
          <select
            className="pc-input"
            value={schId}
            onChange={(e) => setSchId(e.target.value)}
          >
            {schedules.length === 0 ? (
              <option value="">-- 먼저 추가 --</option>
            ) : (
              <>
                <option value="">-- 선택 --</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.date})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <div className="field">
          <label>시작 월</label>
          <input
            className="pc-input"
            type="month"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="field">
          <label>종료 월</label>
          <input
            className="pc-input"
            type="month"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div className="field">
          <label>매월 납부일</label>
          <select
            className="pc-input"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {[1, 5, 10, 15, 20, 25].map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>월 납부액 (원)</label>
          <input
            className="pc-input"
            type="number"
            placeholder="예: 2000000"
            step="100000"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={handleAdd}>
          + 일괄
        </button>
      </div>
      <div className="warning">{warn}</div>
    </>
  );
}
