/**
 * Splide @4.1.4 는 CDN(`<Script>`)으로 로드되어 전역 `window.Splide`로 노출된다.
 * (legacy pc/index.php와 동일 방식 — npm 미설치, CDN 그대로)
 */
declare global {
  interface SplideInstance {
    mount(): SplideInstance;
    destroy(completely?: boolean): void;
  }

  interface Window {
    Splide: {
      new (target: string | HTMLElement, options?: Record<string, unknown>): SplideInstance;
    };
  }
}

export {};
