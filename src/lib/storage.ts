import { Storage } from "@apps-in-toss/web-framework";

const KEY = "prepayment:state:v1";

// 토스 인앱의 Storage는 모바일 런타임에서만 동작. 로컬 브라우저 dev에서는 throw 하거나
// undefined를 반환하므로 try/catch로 감싸고 실패 시 localStorage로 폴백.

async function setRaw(value: string): Promise<void> {
  try {
    await Storage.setItem(KEY, value);
    return;
  } catch {
    // fall through to localStorage
  }
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // 저장 실패는 조용히 무시 (시크릿 모드 등)
  }
}

async function getRaw(): Promise<string | null> {
  try {
    const v = await Storage.getItem(KEY);
    if (v != null) return v;
  } catch {
    // fall through
  }
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

async function removeRaw(): Promise<void> {
  try {
    await Storage.removeItem(KEY);
  } catch {
    // ignore
  }
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export async function saveState<T>(state: T): Promise<void> {
  await setRaw(JSON.stringify(state));
}

export async function loadState<T>(): Promise<T | null> {
  const raw = await getRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearState(): Promise<void> {
  await removeRaw();
}
