// legacy korean_patch.php — 한글패치 현황(getKoreanPatchList, 필터·페이지네이션 없음).

export type KoreanPatchItem = {
  idx: number; // korean_patch_auth 드롭다운 value
  goods_nm: string;
  prefix_text: string; // 암호화 key
  encode_type: string; // 인코딩 방식(base64/md5 등) — auth 계산용
};

export type KoreanPatchListResponse = {
  items: KoreanPatchItem[];
};

// legacy korean_patch_auth.php — 한글패치 인증정보 확인.
export type KoreanPatchAuthSearch = {
  search_m_id: string;
  search_patch_goods: string; // 선택 patch idx
  patch_goods: string; // 선택 patch name
  prefix_text: string;
  encode_type: string;
};
export type KoreanPatchAuthResult = {
  password: string; // patchEncDataAdmin 결과(백엔드 계산)
};
