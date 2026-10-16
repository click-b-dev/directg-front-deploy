/**
 * legacy mobile `Goods::getPlatform()` (src/classes/Goods.php L518) switch 매핑.
 * PC(`screens/game-platform`)의 정적 매핑과 **다르다**: mobile은 35="Rockstar Games Launcher"이고
 * 3/30/33 코드까지 매핑한다. 미정의 코드는 undefined → 빈 title(legacy와 동일).
 */
const PLATFORM_NAMES: Record<string, string> = {
  "1": "Steam",
  "3": "Origin",
  "34": "Epic Games",
  "30": "Ubisoft Connect",
  "35": "Rockstar Games Launcher",
  "33": "Bethesda",
};

/** legacy getPlatform switch. 미정의 코드는 "" (legacy는 $page_title 미설정 → 빈 출력). */
export function platformName(platform: string): string {
  return PLATFORM_NAMES[platform] ?? "";
}

/**
 * legacy mobile game_platform_thumb.html의 platform 파라미터 해석.
 * **PC와 달리 `platform=1` 기본 주입이 없다** — URL의 platform 값을 그대로 사용한다(없으면 빈 문자열).
 */
export function resolvePlatform(sp: Record<string, string | string[] | undefined>): string {
  const value = sp.platform;
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
