type Props = {
  onReset: () => void;
};

export function Header({ onReset }: Props) {
  return (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h2 className="text-[18px] font-medium">선납 할인 계산기</h2>
        <button
          className="reset-btn"
          onClick={() => {
            if (window.confirm("모든 입력을 초기화할까요?")) {
              onReset();
            }
          }}
        >
          초기화
        </button>
      </div>
      <div className="formula-box">
        <strong>적용 공식 (시행사 실제 방식)</strong>
        <br />
        수납인정금액 = 납부액 ÷ (1 − 연이율 × 선납일수/365)
        <br />
        할인액 = 수납인정금액 − 납부액
        <br />
        <span className="text-[11px]">
          ※ 할인율이 납부액이 아닌 수납인정금액(미래가치) 기준으로 적용되는 방식
          — 실효이율은 아래 참조
        </span>
      </div>
    </>
  );
}
