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

// 한 일정에 대한 충당액 합계
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

// 이 일정에 이 날짜로 추가할 수 있는 최대 납부액(원).
// 충당액이 일정 금액을 정확히 채우는 지점.
export function maxPayInto(
  sch: Schedule,
  payDate: string,
  payments: Payment[],
  rate: number,
): number {
  const current = creditFor(sch, payments, rate);
  const remainCredit = Math.max(0, sch.amt - current);
  const t = daysBetween(payDate, sch.date) / 365;
  const rt = rate * t;
  if (rt >= 1) return remainCredit;
  // amt / (1 - rt) = remainCredit → amt = remainCredit * (1 - rt)
  return Math.floor(remainCredit * (1 - rt));
}

// 같은 종류(kind) 안에서 기준일이 더 빠른 일정이 충족되어야
// 다음 일정에 납부할 수 있다. 충족 = 충당액 >= 일정 금액.
// 또한, 대상 일정이 이미 가득 찼으면 추가 납부 불가.
export function canPayInto(
  target: Schedule,
  schedules: Schedule[],
  payments: Payment[],
  rate: number,
): { ok: true } | { ok: false; reason: string } {
  // 1. 대상 자체가 이미 충당 완료인지
  if (creditFor(target, payments, rate) + 0.5 >= target.amt) {
    return { ok: false, reason: "이미 충당이 완료됐어요" };
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
    if (creditFor(s, payments, rate) + 0.5 < s.amt) {
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
