import type { MemberAccountInfo } from "@entities/mypage-account";

/** 계정 설정 mock. is_auth="N"으로 본인인증 버튼 플로우를 확인 가능하게 한다. */
export const mypageAccountFixture: MemberAccountInfo = {
  m_id: "tester@directg.net",
  name: "테스터",
  hp: "010-1234-5678",
  birth_day: "1990-01-01",
  is_auth: "N",
  mailling: "Y",
  email: "",
};
