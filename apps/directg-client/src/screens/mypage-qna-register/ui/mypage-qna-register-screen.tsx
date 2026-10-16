import { MypageAside } from "@widgets/mypage-aside";

import { QnaRegisterForm } from "./qna-register-form";

/**
 * 문의 하기 (legacy `pc/mypage/mypage_qna_register.html`). 세션 폼. aside + 등록 폼(client).
 * 가드는 route(requireMemberSession).
 */
export function MypageQnaRegisterScreen() {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="qna_ragister" />
        <section id="content" className="content rounded-0 font-14">
          <QnaRegisterForm />
        </section>
      </main>
    </div>
  );
}
