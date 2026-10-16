import { permanentRedirect } from "next/navigation";

/**
 * 모바일 main/main.html — legacy는 무조건 301 → `/index.php`(홈).
 * 관측 동작(홈으로 영구 리다이렉트)만 재현. 타겟 홈은 `/`(Next 308≈301).
 */
export default function MobileMainMainPage() {
  permanentRedirect("/");
}
