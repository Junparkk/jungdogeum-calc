// 토스 인앱 광고 래퍼.
//
// 전면형은 v1 API (GoogleAdMob.load/showAppsInTossAdMob) 사용 — pet과 동일.
// v2 (loadFullScreenAd)는 토스앱 5.247.0+ 필요해서 지원 기기가 좁음.
//
// 전면형 가드 (모두 AND):
//  1. 의미있는 액션 2회 이상
//  2. 마지막 노출 후 30분 이상
//  3. 자연스러운 트리거 시점 (월 일괄/초기화/메뉴 닫힘)

import {
  GoogleAdMob,
  Storage,
  TossAds,
} from "@apps-in-toss/web-framework";

// production 빌드에서만 실 ID, dev에서는 테스트 ID
export const BANNER_AD_GROUP_ID = import.meta.env.PROD
  ? "ait.v2.live.bb5b6ebb4a694614"
  : "ait-ad-test-banner-id";
export const INTERSTITIAL_AD_GROUP_ID = import.meta.env.PROD
  ? "ait.v2.live.3e016592094a4a82"
  : "ait-ad-test-interstitial-id";

const LAST_SHOWN_KEY = "prepay:ads:lastInterstitial";
const CAP_MS = 30 * 60 * 1000; // 30분
const MIN_ACTIONS = 2;

let actionCount = 0;
let interstitialLoaded = false;
let interstitialCleanup: (() => void) | undefined;

export function isBannerSupported(): boolean {
  try {
    return TossAds.initialize.isSupported() === true;
  } catch {
    return false;
  }
}

export function isInterstitialSupported(): boolean {
  try {
    return GoogleAdMob.loadAppsInTossAdMob.isSupported() === true;
  } catch {
    return false;
  }
}

export function initAds() {
  actionCount = 0;
  preloadInterstitial();
}

function preloadInterstitial() {
  if (!isInterstitialSupported()) return;
  try {
    interstitialCleanup?.();
    interstitialCleanup = undefined;
    interstitialLoaded = false;

    interstitialCleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") {
          interstitialLoaded = true;
        }
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

function showSupported(): boolean {
  try {
    return GoogleAdMob.showAppsInTossAdMob.isSupported() === true;
  } catch {
    return false;
  }
}

export async function showInterstitialIfEligible(): Promise<boolean> {
  if (!showSupported()) return false;
  if (!interstitialLoaded) return false;

  if (actionCount < MIN_ACTIONS) return false;

  const now = Date.now();
  const last = await getLastShown();
  if (now - last < CAP_MS) return false;

  try {
    GoogleAdMob.showAppsInTossAdMob({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "dismissed" || event.type === "failedToShow") {
          interstitialLoaded = false;
          preloadInterstitial();
        }
      },
      onError: () => {
        interstitialLoaded = false;
        preloadInterstitial();
      },
    });
    await setLastShown(now);
    return true;
  } catch {
    return false;
  }
}
