export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export function fmtWon(n: number): string {
  return fmtNum(n) + "원";
}

// "3,800만" / "1.2억" 같은 축약. 원 단위 미포함.
export function fmtShort(n: number): string {
  const abs = Math.abs(Math.round(n));
  if (abs >= 100_000_000) {
    const eok = abs / 100_000_000;
    return eok.toFixed(eok >= 10 ? 1 : 2).replace(/\.?0+$/, "") + "억";
  }
  if (abs >= 10_000) {
    const man = Math.round(abs / 10_000);
    return man.toLocaleString("ko-KR") + "만";
  }
  return abs.toLocaleString("ko-KR");
}

export function parseAmt(str: string): number {
  const s = String(str).replace(/[^0-9]/g, "");
  return s ? parseInt(s, 10) : 0;
}

export function fmtAmtInput(n: number): string {
  if (!n) return "";
  return n.toLocaleString("ko-KR");
}
