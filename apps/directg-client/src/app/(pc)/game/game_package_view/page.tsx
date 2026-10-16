import { permanentRedirect } from "next/navigation";

/**
 * legacy `pc/game/game_package_view.html`는 사무실 IP(112.216.231.146) 외 모든 방문자를
 * `https://directg.net/index.php`로 301 리다이렉트하는 비공개 WIP 화면.
 * 공개 관측 동작(홈 리다이렉트)만 재현한다(개발자 승인). Next permanentRedirect=308.
 */
export default function GamePackageViewPage(): never {
  permanentRedirect("/");
}
