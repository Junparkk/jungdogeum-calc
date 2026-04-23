import type { ReactNode } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";

type Props = {
  open: boolean;
  onClose: () => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#191F28",
          marginBottom: 6,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#4E5968",
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Term({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontWeight: 600,
        color: "#191F28",
      }}
    >
      {children}
    </span>
  );
}

export function HelpSheet({ open, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="도움말">
      <div
        style={{
          padding: "12px 14px",
          background: "#FFF9E6",
          border: "1px solid #FDE68A",
          borderRadius: 12,
          fontSize: 12,
          color: "#8B6914",
          lineHeight: 1.6,
          marginBottom: 18,
        }}
      >
        <b style={{ fontWeight: 700 }}>⚠️ 꼭 확인해 주세요</b>
        <br />
        이 앱의 계산 결과는 참고용이에요. 시행사마다 적용 방식 · 기준일
        처리 · 절사 규칙이 조금씩 다를 수 있으니, 실제 납부 전에 분양
        계약서와 시행사 안내를 반드시 확인하세요.
      </div>

      <Section title="이 앱은 뭐 하는 거예요?">
        분양 중도금이나 옵션비를 미리 납부할 때 받는{" "}
        <Term>선납 할인 금액</Term>을 계산하는 도구예요. 납부일과 기준일의
        차이로 얼마를 아꼈는지 한눈에 보여줍니다.
      </Section>

      <Section title="중도금 vs 옵션비, 왜 나누나요?">
        분양 계약은 보통 본 분양금(중도금)과 추가 옵션비가 별도로 책정돼요.
        앱에서는 두 가지를 따로 관리해서 진행률과 합계를 따로 볼 수
        있어요. 옵션이 없는 계약이라면 중도금만 등록하면 됩니다.
      </Section>

      <Section title="입력 순서">
        <div style={{ marginBottom: 4 }}>
          1. <Term>일정 추가</Term> — 회차별 기준일과 금액 등록
        </div>
        <div style={{ marginBottom: 4 }}>
          2. <Term>납부 추가</Term> — 실제 납부한 날짜와 금액 입력 (FAB +
          버튼이나 카드 안의 "+ 납부 추가")
        </div>
        <div>
          3. <Term>월 일괄</Term> — 매월 같은 날 같은 금액을 자동 생성
        </div>
      </Section>

      <Section title="순차 납부 규칙">
        같은 종류 안에서는 더 빠른 기준일이 충당 완료돼야 다음 회차에
        납부할 수 있어요. 예: 중도금 1차가 다 채워져야 2차에 납부 입력
        가능. 옵션비와 중도금 사이는 서로 독립이에요.
      </Section>

      <Section title="용어">
        <div style={{ marginBottom: 6 }}>
          <Term>충당액</Term> = 납부액에 선납 할인을 더한 금액. "이만큼이
          납부된 걸로 인정된다"는 뜻이에요.
          <br />
          공식: 납부액 ÷ (1 − 연이율 × 선납일수 / 365)
        </div>
        <div style={{ marginBottom: 6 }}>
          <Term>총 할인 금액</Term> = 충당액 − 실제 납부액. 선납으로 아낀 돈.
        </div>
        <div style={{ marginBottom: 6 }}>
          <Term>잔여액</Term> = 일정 금액 − 충당액. 앞으로 더 채워야 할 금액.
        </div>
        <div>
          <Term>표면 / 단리 / 복리 실효이율</Term> — 표면은 약정된 연이율
          그대로, 단리·복리는 "납부액 대비 실제로 얼마나 이득 봤는지" 환산한
          값이에요. 같은 표면이율이라도 미래가치 기준이라 단리가 살짝
          높습니다.
        </div>
      </Section>

      <Section title="만든이">
        <Term>Outback Studio</Term>
        <br />© 2026 All rights reserved.
      </Section>
    </BottomSheet>
  );
}
