import type { Payment, Schedule } from "@/lib/calc";
import {
  calcCredit,
  daysBetween,
  effectiveSimple,
} from "@/lib/calc";

type Props = {
  schedules: Schedule[];
  payments: Payment[];
  rate: number; // 퍼센트 값 (예: 5 = 5%)
  onRemove: (id: number) => void;
  onClearAll: () => void;
};

export function PaymentsTable({
  schedules,
  payments,
  rate,
  onRemove,
  onClearAll,
}: Props) {
  const rateDec = rate / 100;
  return (
    <>
      <div className="mb-2 flex justify-end">
        <button
          className="del-btn text-[12px]"
          onClick={() => {
            if (payments.length === 0) return;
            if (window.confirm("납부 내역을 전체 삭제할까요?")) onClearAll();
          }}
        >
          납부 내역 전체 삭제
        </button>
      </div>
      <table className="pc-table">
        <thead>
          <tr>
            <th>중도금</th>
            <th>납부일</th>
            <th>납부액</th>
            <th>선납 일수</th>
            <th>할인 금액</th>
            <th>충당액</th>
            <th>실효이율</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={8} className="pc-empty">
                납부 내역이 없습니다.
              </td>
            </tr>
          ) : (
            payments.map((p) => {
              const sch = schedules.find((s) => s.id === p.schId);
              const dueDate = sch ? sch.date : "";
              const days = dueDate ? daysBetween(p.date, dueDate) : 0;
              const c = calcCredit(p.amt, days, rateDec);
              const disc = c - p.amt;
              const effS = effectiveSimple(days, rateDec);
              const effStr =
                effS != null ? (effS * 100).toFixed(3) + "%" : "-";
              return (
                <tr key={p.id}>
                  <td>
                    <span className="chip">{p.schName}</span>
                  </td>
                  <td>
                    {p.date}
                    {p.bulk ? <span className="bulk-tag">일괄</span> : null}
                  </td>
                  <td>{Math.round(p.amt).toLocaleString("ko-KR")}원</td>
                  <td>
                    <span className="chip">{days}일</span>
                  </td>
                  <td style={{ color: "#3B6D11" }}>
                    +{Math.round(disc).toLocaleString("ko-KR")}원
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {Math.round(c).toLocaleString("ko-KR")}원
                  </td>
                  <td style={{ color: "#185FA5", fontSize: 12 }}>{effStr}</td>
                  <td>
                    <button className="del-btn" onClick={() => onRemove(p.id)}>
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
}
