export type ScheduleKind = "principal" | "option";

export type Schedule = {
  id: number;
  name: string;
  date: string;
  amt: number;
  kind: ScheduleKind;
};

export const KIND_LABEL: Record<ScheduleKind, string> = {
  principal: "중도금",
  option: "옵션비",
};

// 한 일정에 대한 실제 납부액 합계
export function paidFor(sch: Schedule, payments: Payment[]): number {
  return payments
    .filter((p) => p.schId === sch.id)
    .reduce((sum, p) => sum + p.amt, 0);
}

// 한 일정에 대한 충당액(납부 + 선납 할인) 합계
export function creditFor(
  sch: Schedule,
  payments: Payment[],
  rate: number,
): number {
  return payments
    .filter((p) => p.schId === sch.id)
    .reduce(
      (sum, p) =>
        sum + calcCredit(p.amt, daysBetween(p.date, sch.date), rate),
      0,
    );
}

// 이 일정에 추가할 수 있는 최대 납부액 (납부 기준).
// 일정 명목 금액을 그대로 한도로 사용 — 사용자가 "1차 4천만"으로 인식한
// 그 금액까지만 입력 가능. 할인은 별도 누적이라 한도 계산엔 영향 없음.
export function maxPayInto(sch: Schedule, payments: Payment[]): number {
  return Math.max(0, sch.amt - paidFor(sch, payments));
}

// 같은 종류(kind) 안에서 기준일이 더 빠른 일정이 채워져야
// 다음 일정에 납부할 수 있다. 채움 = 납부합 >= 일정 금액 (납부 기준).
// 대상이 이미 가득 찼으면 추가 납부 불가.
export function canPayInto(
  target: Schedule,
  schedules: Schedule[],
  payments: Payment[],
): { ok: true } | { ok: false; reason: string } {
  // 1. 대상 자체가 이미 가득 찬 경우
  if (paidFor(target, payments) + 0.5 >= target.amt) {
    return { ok: false, reason: "이미 납부가 완료됐어요" };
  }

  // 2. 같은 종류의 더 빠른 일정이 채워졌는지
  const earlierSameKind = schedules
    .filter(
      (s) =>
        s.kind === target.kind &&
        s.id !== target.id &&
        s.date < target.date,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const s of earlierSameKind) {
    if (paidFor(s, payments) + 0.5 < s.amt) {
      return {
        ok: false,
        reason: `먼저 ${KIND_LABEL[s.kind]} '${s.name}'을(를) 채워주세요`,
      };
    }
  }
  return { ok: true };
}

export type Payment = {
  id: number;
  schId: number;
  schName: string;
  date: string;
  amt: number;
  bulk: boolean;
};

export function daysBetween(d1: string, d2: string): number {
  return Math.round(
    (new Date(d2).getTime() - new Date(d1).getTime()) / 86_400_000,
  );
}

// 핵심 공식: 수납인정금액 = 납부액 / (1 − r·t)
// rate는 연이율 소수 (예: 0.05 = 5%)
export function calcCredit(amt: number, days: number, rate: number): number {
  const t = days / 365;
  const rt = rate * t;
  if (rt >= 1) return amt;
  return amt / (1 - rt);
}

export function effectiveSimple(days: number, rate: number): number | null {
  const t = days / 365;
  const rt = rate * t;
  if (rt >= 1) return null;
  return rate / (1 - rt);
}

export function effectiveCompound(days: number, rate: number): number | null {
  const t = days / 365;
  const rt = rate * t;
  if (rt >= 1 || t <= 0) return null;
  return Math.pow(1 / (1 - rt), 1 / t) - 1;
}
