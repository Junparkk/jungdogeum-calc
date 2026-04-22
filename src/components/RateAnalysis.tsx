type Props = {
  nominalRate: number;
  simpleRate: number | null;
  compoundRate: number | null;
};

function pct(v: number | null) {
  if (v == null) return "-";
  return (v * 100).toFixed(3) + "%";
}

export function RateAnalysis({
  nominalRate,
  simpleRate,
  compoundRate,
}: Props) {
  return (
    <>
      <div className="section-title">
        실효이율 분석{" "}
        <span className="text-[10px] font-normal text-[color:var(--color-text-secondary)]">
          (납부 내역 기준)
        </span>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rate-card">
          <div className="rlabel">표면 할인율</div>
          <div className="rvalue">{(nominalRate * 100).toFixed(3)}%</div>
        </div>
        <div className="rate-card">
          <div className="rlabel">단리 환산 실효이율</div>
          <div className="rvalue">{pct(simpleRate)}</div>
        </div>
        <div className="rate-card">
          <div className="rlabel">연복리 환산 실효이율</div>
          <div className="rvalue">{pct(compoundRate)}</div>
        </div>
      </div>
    </>
  );
}
