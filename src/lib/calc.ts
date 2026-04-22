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

// 같은 종류(kind) 안에서 기준일이 더 빠른 일정이 충족되어야
// 다음 일정에 납부할 수 있다. 충족 = 충당액 >= 일정 금액.
// 납부 가능 여부 + 막힌 이유를 반환.
export function canPayInto(
  target: Schedule,
  schedules: Schedule[],
  payments: Payment[],
  rate: number,
): { ok: true } | { ok: false; reason: string } {
  const earlierSameKind = schedules
    .filter(
      (s) =>
        s.kind === target.kind &&
        s.id !== target.id &&
        s.date < target.date,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const s of earlierSameKind) {
    const credit = payments
      .filter((p) => p.schId === s.id)
      .reduce(
        (sum, p) => sum + calcCredit(p.amt, daysBetween(p.date, s.date), rate),
        0,
      );
    if (credit + 0.5 < s.amt) {
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
