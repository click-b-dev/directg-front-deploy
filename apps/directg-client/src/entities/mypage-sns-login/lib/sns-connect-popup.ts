import { postSnsConnectUrl } from "../api/sns-login-actions";
import type { SnsConnectType } from "../model/types";

const POPUP: Record<SnsConnectType, { name: string; height: number; width: number }> = {
  PAYCO: { name: "connect_payco", height: 560, width: 500 },
  KAKAO: { name: "connect_kakao", height: 560, width: 500 },
  // legacy 버그: 네이버 연결 팝업 이름이 `connect_kakao`.
  NAVER: { name: "connect_kakao", height: 700, width: 500 },
};

const POPUP_BLOCKED_MESSAGE =
  "팝업이 차단되어있습니다.\n로그인 하시려면 팝업 차단을 해제해주시기 바랍니다.";

function isPopupBlocked(loginpop: Window | null): boolean {
  if (!loginpop) {
    return true;
  }
  return loginpop.outerHeight === 0;
}

/** 간편로그인 계정연결 팝업. legacy jQuery AJAX + window.open 흐름 재현. */
export async function openSnsConnectPopup(type: SnsConnectType): Promise<void> {
  const top = (screen.availHeight - 600) / 2;
  const left = (screen.availWidth - 455) / 2;
  try {
    const { url } = await postSnsConnectUrl(type);
    const { name, height, width } = POPUP[type];
    const features = `height=${height}, width=${width}, top=${top}, left=${left}, toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no`;
    const loginpop = window.open(url, name, features);
    if (isPopupBlocked(loginpop)) {
      window.alert(POPUP_BLOCKED_MESSAGE);
      loginpop?.close();
    }
  } catch {
    window.alert("[object Object]");
  }
}
