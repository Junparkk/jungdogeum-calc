// 토스 인앱 광고 래퍼. 웹/비-인앱 환경에선 전부 no-op.
//
// 전면형 타이밍 가드 (모두 AND):
//  1. 세션 시작 후 60초 이상 경과
//  2. 의미있는 액션 2회 이상
//  3. 마지막 노출 이후 2시간 이상 경과
//  4. 이 함수가 호출된 시점 (=월 일괄/초기화/메뉴 닫힘)

import {
  Storage,
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";

// 실제 운영 시 Toss 콘솔에서 발급받은 adGroupId로 교체
export const BANNER_AD_GROUP_ID = "ait-ad-test-banner-id";
export const INTERSTITIAL_AD_GROUP_ID = "ait-ad-test-interstitial-id";

const LAST_SHOWN_KEY = "prepay:ads:lastInterstitial";
const CAP_MS = 2 * 60 * 60 * 1000; // 2시간
const MIN_SESSION_MS = 60 * 1000; // 60초
const MIN_ACTIONS = 2;

let sessionStart = Date.now();
let actionCount = 0;
let tossAdsReady = false;
let interstitialLoaded = false;

export function isInToss(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      // 토스 네이티브 브릿지가 주입한 전역 필드로 감지
      // (로컬 dev / 일반 브라우저에선 없음)
      !!(window as unknown as { ReactNativeWebView?: unknown })
        .ReactNativeWebView
    );
  } catch {
    return false;
  }
}

export function initAds() {
  if (!isInToss()) return;
  sessionStart = Date.now();
  actionCount = 0;

  try {
    if (!TossAds?.initialize?.isSupported?.()) return;
    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          tossAdsReady = true;
          preloadInterstitial();
        },
        onInitializationFailed: () => {
          tossAdsReady = false;
        },
      },
    });
  } catch {
    // 구버전 토스앱이거나 권한 문제 — 조용히 넘김
  }
}

function preloadInterstitial() {
  if (!isInToss()) return;
  try {
    if (!loadFullScreenAd?.isSupported?.()) return;
    loadFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") interstitialLoaded = true;
      },
      onError: () => {
        interstitialLoaded = false;
      },
    });
  } catch {
    // noop
  }
}

export function noteAction() {
  actionCount += 1;
}

async function getLastShown(): Promise<number> {
  // 토스 Storage → localStorage 순으로 조회
  try {
    const v = await Storage.getItem(LAST_SHOWN_KEY);
    if (v) return parseInt(v, 10) || 0;
  } catch {
    // fall through
  }
  try {
    const v = window.localStorage.getItem(LAST_SHOWN_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

async function setLastShown(ts: number) {
  try {
    await Storage.setItem(LAST_SHOWN_KEY, String(ts));
  } catch {
    // ignore
  }
  try {
    window.localStorage.setItem(LAST_SHOWN_KEY, String(ts));
  } catch {
    // ignore
  }
}

export async function showInterstitialIfEligible(): Promise<boolean> {
  if (!isInToss()) return false;
  if (!tossAdsReady || !interstitialLoaded) return false;

  const now = Date.now();
  if (now - sessionStart < MIN_SESSION_MS) return false;
  if (actionCount < MIN_ACTIONS) return false;

  const last = await getLastShown();
  if (now - last < CAP_MS) return false;

  try {
    if (!showFullScreenAd?.isSupported?.()) return false;
    showFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "dismissed") {
          interstitialLoaded = false;
          preloadInterstitial();
        }
      },
      onError: () => {},
    });
    await setLastShown(now);
    return true;
  } catch {
    return false;
  }
}
