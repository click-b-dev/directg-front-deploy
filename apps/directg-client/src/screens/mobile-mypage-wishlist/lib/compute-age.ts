/**
 * 회원 나이 계산 (legacy `mobile/mypage/mypage_wishlist.html` PHP 로직 재현).
 * is_auth≠"Y"면 0. birth_day 6자리(yymmdd)면 date('y') 비교로 19xx/20xx 세기 판정, 8자리(yyyymmdd)면 앞 4자리.
 * 월/일 보정은 legacy에서 주석처리 → 미적용(연도 차이만).
 */
export function computeMemberAge(birthDay: string, isAuth: string): number {
  if (isAuth !== "Y") {
    return 0;
  }
  const currentYear = new Date().getFullYear();
  if (birthDay.length === 6) {
    const yy = Number(birthDay.slice(0, 2));
    const currentYY = currentYear % 100; // date('y')
    return currentYY > yy
      ? currentYear - Number(`20${birthDay.slice(0, 2)}`)
      : currentYear - Number(`19${birthDay.slice(0, 2)}`);
  }
  return currentYear - Number(birthDay.slice(0, 4));
}
