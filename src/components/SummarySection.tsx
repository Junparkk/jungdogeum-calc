import { fmt } from "@/lib/calc";

type Props = {
  totalPaid: number;
  totalCredit: number;
  totalDiscount: number;
  totalRemain: number;
  hasSchedule: boolean;
};

export function SummarySection({
  totalPaid,
  totalCredit,
  totalDiscount,
  totalRemain,
  hasSchedule,
}: Props) {
  return (
    <>
      <div className="section-title">전체 요약</div>
      <div className="mb-4 grid grid-cols-4 gap-2.5">
        <div className="metric">
          <div className="mlabel">실제 납부액 합계</div>
          <div className="mvalue">{fmt(totalPaid)}</div>
        </div>
        <div className="metric">
          <div className="mlabel">할인 적용 후 충당액</div>
          <div className="mvalue blue">{fmt(totalCredit)}</div>
        </div>
        <div className="metric">
          <div className="mlabel">총 할인 금액</div>
          <div className="mvalue green">{fmt(totalDiscount)}</div>
        </div>
        <div className="metric">
          <div className="mlabel">전체 잔여액</div>
          <div className="mvalue red">
            {hasSchedule ? fmt(totalRemain) : "-원"}
          </div>
        </div>
      </div>
    </>
  );
}
