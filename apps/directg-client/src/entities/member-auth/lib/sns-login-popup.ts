import { postSnsLoginUrl } from "../api/post-sns-login-url";
import type { SnsProvider } from "../model/types";

/** SNS 팝업 치수 — legacy 그대로(카카오 창 이름도 legacy 버그 `login_naver` 유지). */
const SNS_POPUP: Record<SnsProvider, { name: string; height: number; width: number }> = {
  naver: { name: "login_naver", height: 700, width: 500 },
  kakao: { name: "login_naver", height: 700, width: 500 },
  payco: { name: "login_payco", height: 560, width: 500 },
};

/**
 * SNS 간편로그인/간편가입 팝업 열기 (legacy login.html·join_step1.html 공통).
 * `POST /api/member/sns/{provider}/login-url` → `window.open`. 팝업 차단 시 alert.
 */
export async function openSnsLoginPopup(provider: SnsProvider): Promise<void> {
  const top = (screen.availHeight - 600) / 2;
  const left = (screen.availWidth - 455) / 2;
  try {
    const { url } = await postSnsLoginUrl(provider);
    const { name, height, width } = SNS_POPUP[provider];
    const features = `height=${height}, width=${width}, top=${top}, left=${left}, toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no`;
    const loginpop = window.open(url, name, features);
    if (!loginpop) {
      window.alert("팝업이 차단되어있습니다.\n로그인 하시려면 팝업 차단을 해제해주시기 바랍니다.");
    }
  } catch {
    window.alert("로그인 처리 중 오류가 발생했습니다.");
  }
}
