// legacy title_option_register.php — 대표상품 관련상품(옵션) 7개 카테고리.

export type OptionCategory =
  | "game"
  | "edition"
  | "dlc"
  | "etc"
  | "holomodels"
  | "holomodelsdlc"
  | "holomodelsedition";

// legacy 판매상태: 0 판매중 / 1 판매중지 / 2 품절 / 9 승인대기 / 3 판매종료.
export type OptionStatus = "0" | "1" | "2" | "9" | "3";

// 진열 리스트 행(백엔드가 플랫폼/공급처/유형명 해석 완료).
export type OptionProduct = {
  product_code: string;
  product_name: string;
  product_name_en: string;
  platform: string;
  release_date: string;
  game_type: string; // 유형명
  display_type: string; // 진열유형명
  supplier: string; // 공급처(퍼블리셔)
  is_free: "Y" | "N";
  is_free_url: string;
  consumer_price: number;
  discount: number;
  price: number;
  status: OptionStatus;
};

// 검색 모달 후보 행.
export type OptionCandidate = {
  product_code: string;
  product_name: string;
  product_name_en: string;
  platform: string;
  publisher: string;
  game_type: string;
  bundle_type: string;
  status: OptionStatus;
};

export type TitleOptions = {
  title_id: number;
  title_name: string;
  title_name_en: string;
  categories: Record<OptionCategory, OptionProduct[]>;
};

export type OptionSearchQuery = { category: OptionCategory; value: string };
export type AddOptionRequest = { category: OptionCategory; product_code: string };
export type OptionMutationResponse = { success: boolean };
