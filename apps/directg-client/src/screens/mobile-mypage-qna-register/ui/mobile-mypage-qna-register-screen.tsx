import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileQnaRegisterForm } from "./mobile-qna-register-form";

/**
 * 모바일 마이페이지 - 문의 하기 (legacy `mobile/mypage/mypage_qna_register.html`).
 * MobileSubHeader("문의 하기") + section-title "문의하기"(표기 불일치 보존) + wide-block 폼.
 */
export function MobileMypageQnaRegisterScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="문의 하기" />
      <div id="appCapsuleSub">
        <div className="section full mt-2 mb-2">
          <div className="section-title">문의하기</div>
          <div className="wide-block pb-1 pt-2">
            <MobileQnaRegisterForm />
          </div>
        </div>
      </div>
    </>
  );
}
