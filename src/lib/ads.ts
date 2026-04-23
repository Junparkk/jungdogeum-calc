// 토스 인앱 광고 래퍼. SDK가 알아서 환경 감지(isSupported)를 해주므로
// 추가적인 환경 체크 없이 그대로 호출하고 결과만 본다.
//
// 전면형 가드 (모두 AND):
//  1. 세션 시작 후 60초 이상
//  2. 의미있는 액션 2회 이상
//  3. 마지막 노출 후 2시간 이상
//  4. 자연스러운 트리거 시점 (월 일괄/초기화/메뉴 닫힘)

import {
  Storage,
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";

// production 빌드에서만 실 ID, dev에서는 테스트 ID
export const BANNER_AD_GROUP_ID = import.meta.env.PROD
  ? "ait.v2.live.bb5b6ebb4a694614"
  : "ait-ad-test-banner-id";
export const INTERSTITIAL_AD_GROUP_ID = import.meta.env.PROD
  ? "ait.v2.live.3e016592094a4a82"
  : "ait-ad-test-interstitial-id";

const LAST_SHOWN_KEY = "prepay:ads:lastInterstitial";
const CAP_MS = 2 * 60 * 60 * 1000; // 2시간
const MIN_SESSION_MS = 60 * 1000; // 60초
const MIN_ACTIONS = 2;

let sessionStart = Date.now();
let actionCount = 0;
let interstitialLoaded = false;

export function isBannerSupported(): boolean {
  try {
    return TossAds.initialize.isSupported() === true;
  } catch {
    return false;
  }
}

export function isInterstitialSupported(): boolean {
  try {
    return loadFullScreenAd.isSupported() === true;
  } catch {
    return false;
  }
}

export function initAds() {
  sessionStart = Date.now();
  actionCount = 0;
  preloadInterstitial();
}

function preloadInterstitial() {
  if (!isInterstitialSupported()) return;
  try {
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
  if (!isInterstitialSupported()) return false;
  if (!interstitialLoaded) return false;

  const now = Date.now();
  if (now - sessionStart < MIN_SESSION_MS) return false;
  if (actionCount < MIN_ACTIONS) return false;

  const last = await getLastShown();
  if (now - last < CAP_MS) return false;

  try {
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
