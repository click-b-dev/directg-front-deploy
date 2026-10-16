/** legacy page_title switch (platform 코드 → 이름). 그 외 코드는 빈 문자열(legacy 미설정). */
const PLATFORM_NAMES: Record<string, string> = {
  "1": "Steam",
  "34": "Epic Games",
  "35": "Rockstar Games",
};

/** legacy switch 매핑. 미정의 코드는 "" (legacy는 page_title 미설정). */
export function platformName(platform: string): string {
  return PLATFORM_NAMES[platform] ?? "";
}

/**
 * legacy 기본 platform 결정.
 * `if(!platform && !platform_1 && !platform_34 && !platform_35) platform=1`.
 */
export function resolvePlatform(sp: Record<string, string | string[] | undefined>): string {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const platform = first(sp.platform);
  if (platform) return platform;
  const hasCheckbox = first(sp.platform_1) || first(sp.platform_34) || first(sp.platform_35);
  return hasCheckbox ? "" : "1";
}
