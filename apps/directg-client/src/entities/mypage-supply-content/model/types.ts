/**
 * 제공콘텐츠 (legacy sp_supply_goods_chk4 + sp_supply_content_chk merge/dedup + patchEncDataMember).
 * 계약: `GET /api/mypage/supply-content`, `POST /api/mypage/supply-content/log`.
 * 문서: docs/migration/storefront/mypage/supply-content.md
 */
export interface SupplyContentItem {
  /** "P" 한글패치 / "C" 콘텐츠. */
  supply_content_type: string;
  supply_content: string;
  /** "Y"면 한글패치 인증정보(아이디/비밀번호) 표시. */
  is_encode: string;
  /** patchEncDataMember 결과(백엔드 인코딩). is_encode=Y일 때만 의미. */
  auth_password: string;
  supply_content_url: string;
  ordno: string;
}

export interface SupplyContentResponse {
  list: SupplyContentItem[];
}
