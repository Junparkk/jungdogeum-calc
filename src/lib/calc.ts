export type Schedule = {
  id: number;
  name: string;
  date: string;
  amt: number;
};

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
