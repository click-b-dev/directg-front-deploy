// legacy grac/grac_list.php — 심의정보 현황(getGRACList, grac_list 원장, 50/page).

export type GracListSearch = {
  page: number;
  search_rateno: string; // 등급분류번호(앞일치)
  search_gametitle: string; // 게임물명(부분일치)
  search_entname: string; // 신청자(업체)명(부분일치)
  search_orgname: string; // 등급분류기관(등호, all/빈값 미적용)
  search_givenrate: string; // 결정등급(등호, all/빈값 미적용)
  search_platform: string; // 플랫폼(등호, all/빈값 미적용)
};

export type GracListItem = {
  rateno: string;
  gametitle: string;
  orgname: string;
  entname: string;
  givenrate: string;
  rateddate: string;
  descriptors: string; // 내용정보표시
  platform: string; // 게임플랫폼
  reg_date: string;
};

export type GracPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type GracListResponse = {
  items: GracListItem[];
  pagination: GracPagination;
};

// legacy grac/grac_batch.php — 심의정보 동기화(getGRACEntnameList, tcount>=9, tcount desc, 페이징 없음).
export type GracEntnameItem = {
  entname: string;
  tcount: number; // 게임수
  batch_date: string | null; // 동기화일자(미동기화 시 null)
};
export type GracEntnameListResponse = {
  items: GracEntnameItem[];
};

// legacy grac_ps.php mode=grac_batch — GRAC 웹서비스 동기화.
export type GracBatchRequest = { entname: string };
export type GracActionResult = { success: boolean };

// legacy grac_register.php + grac_ps.php mode=register — 심의정보 등록.
// descriptors[]는 배열 전송(백엔드 콤마 조인). mode는 rateno 유무로 register|modify.
export type GracRegisterRequest = {
  mode: "register" | "modify";
  rateno: string;
  gametitle: string;
  rateddate: string;
  orgname: string;
  entname: string;
  platform: string;
  givenrate: string;
  descriptors: string[];
};
