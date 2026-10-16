import type { SupplyContentItem } from "@entities/mypage-supply-content";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/supply-content`) 준비 전 주입.
 * legacy 프로시저 merge/dedup + patchEncDataMember 결과 형태. auth_password는 백엔드 인코딩 결과.
 */
export const mypageSupplyContentFixture: SupplyContentItem[] = [
  {
    supply_content_type: "P",
    supply_content: "프레이(Prey) 한글패치",
    is_encode: "Y",
    auth_password: "a1b2c3d4e5f6",
    supply_content_url: "https://directg.diskn.com/patch/prey_kr_patch.zip",
    ordno: "20260815-0001",
  },
  {
    supply_content_type: "C",
    supply_content: "디스아너드2 아트북 PDF",
    is_encode: "N",
    auth_password: "",
    supply_content_url: "https://directg.diskn.com/content/do2_artbook.pdf",
    ordno: "20260720-0042",
  },
];
