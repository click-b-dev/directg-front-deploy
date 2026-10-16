import type { MemberAddress } from "@entities/mypage-address";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/address`) 준비 전 주입.
 * legacy `getMemberAddress` 응답 형태(등록된 배송지). 미등록 시 백엔드는 빈 문자열 필드 반환.
 */
export const mypageAddressFixture: MemberAddress = {
  name: "테스터",
  zipcode: "07583",
  address: "서울특별시 강서구 강서로56가길 35 (등촌동, 에이치투아이앤티빌딩)",
  address_detail: "5층",
  phone: "010-1234-5678",
  message: "부재 시 경비실에 맡겨주세요.",
};
