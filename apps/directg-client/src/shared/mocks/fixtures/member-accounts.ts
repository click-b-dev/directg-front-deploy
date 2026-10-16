import type { MemberSession } from "@entities/member-auth";

/** dev 로그인 mock 계정 (자격증명 + 세션 회원정보). 로그인/세션 핸들러가 공유. */
export interface MockAccount {
  m_id: string;
  m_pwd: string;
  member: MemberSession;
}

/**
 * dev 테스트 계정. 로그인은 이 목록의 (m_id, m_pwd) 일치 시에만 성공하고,
 * 세션 쿠키(`dg_member=<m_no>`)로 해당 회원을 판독한다.
 *
 * | 이메일 | 비밀번호 | 등급 |
 * |--------|----------|------|
 * | tester@directg.net | test1234! | 일반(P) |
 * | vip@directg.net    | vip1234!  | VIP(P)  |
 */
export const memberAccountsFixture: MockAccount[] = [
  {
    m_id: "tester@directg.net",
    m_pwd: "test1234!",
    member: {
      m_no: 1001,
      m_id: "tester@directg.net",
      name: "테스터",
      hp: "01012345678",
      nickname: "tester",
      mem_level: "1",
      visitorId: "mock-visitor-1001",
      mem_type: "P",
    },
  },
  {
    m_id: "vip@directg.net",
    m_pwd: "vip1234!",
    member: {
      m_no: 1002,
      m_id: "vip@directg.net",
      name: "브이아이피",
      hp: "01099998888",
      nickname: "vip",
      mem_level: "3",
      visitorId: "mock-visitor-1002",
      mem_type: "P",
    },
  },
];

/** 쿠키 문자열에서 로그인 회원 판독 (`dg_member=<m_no>`). 없거나 불일치 시 null. */
export function findAccountByCookie(cookie: string): MockAccount | null {
  const match = /dg_member=(\d+)/.exec(cookie);
  if (!match) {
    return null;
  }
  return memberAccountsFixture.find((account) => String(account.member.m_no) === match[1]) ?? null;
}
