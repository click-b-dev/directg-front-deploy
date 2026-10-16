import type { SnsLoginConnection } from "@entities/mypage-sns-login";

/** 간편로그인 연결 mock. PAYCO/NAVER 연결, KAKAO 미연결 상태로 3행 분기 확인. */
export const mypageSnsLoginFixture: SnsLoginConnection[] = [
  {
    sns_type: "PAYCO",
    sns_connect_date: "2026-08-20 10:12:33",
    sns_id: "payco-mock-1001",
    sns_name: "테스터",
    email: "tester-payco@example.com",
  },
  {
    sns_type: "NAVER",
    sns_connect_date: "2026-08-21 15:44:02",
    sns_id: "naver-mock-1001",
    sns_name: "테스터",
    email: "tester-naver@example.com",
  },
];
