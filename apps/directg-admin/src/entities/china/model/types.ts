// legacy china/invoice_list.php — 중국 결제완료 리스트(China::getChinaInvoiceList, 20/page).

export type ChinaInvoiceListSearch = {
  page: number;
  search_year: string; // 연도(ord_ymd BETWEEN year-01-01~year-12-31, 빈값→서버 현재년)
  search_settle_no: string; // 결제번호(등호)
  search_name: string; // 주문자명(부분일치)
  search_email: string; // 주문자이메일(등호)
};

export type ChinaInvoiceItem = {
  ord_ymd: string; // 주문일자
  settle_no: string; // 결제번호(invoice_view 링크)
  name: string; // 주문자명
  email: string; // 주문자이메일
  settle_price: number; // 결제금액
  cdt: string; // 결제일자
};

export type ChinaPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type ChinaInvoiceListResponse = {
  items: ChinaInvoiceItem[];
  pagination: ChinaPagination;
};

// legacy china/invoice_member.php — 중국 결제자 리스트(China::getChinaInvoiceMember, idx desc, 20/page).
export type ChinaMemberListSearch = {
  page: number;
  search_name: string; // 이름(부분일치)
  search_email: string; // 이메일(등호)
};

export type ChinaMemberItem = {
  idx: number;
  email: string; // 이메일(아이디)
  name: string;
  login_date: string; // 마지막 접속일자
};

export type ChinaMemberListResponse = {
  items: ChinaMemberItem[];
  pagination: ChinaPagination;
};

// legacy invoice_member_ps.php mode=pwd_reset — 비밀번호 초기화(pwd=password(오늘 Ymd)).
// 성공 시 legacy는 빈 응답 → alert(빈문자열)·목록 미갱신(invalidate 없음).
export type ChinaMemberPwdResetRequest = { idx: number };
export type ChinaMemberPwdResetResult = { message: string };

// legacy invoice_member_ps.php mode=register — 결제자 등록(email/name/pwd 필수).
export type ChinaMemberRegisterRequest = { email: string; name: string; pwd: string };
export type ChinaMemberRegisterResult = { success: boolean; message: string };

// legacy china/invoice_goods.php — 중국 결제 상품 리스트(China::getChinaInvoiceGoods, platform·goods_nm asc, 20/page).
export type ChinaGoodsListSearch = {
  page: number;
  search_name: string; // 상품명(goods_nm 부분일치)
  search_platform: string; // 플랫폼(등호)
};

export type ChinaGoodsItem = {
  idx: number;
  platform: string;
  goods_nm: string;
  price: number; // 판매가(number_format)
};

export type ChinaGoodsListResponse = {
  items: ChinaGoodsItem[];
  pagination: ChinaPagination;
};

// legacy 플랫폼 옵션(quirk: NSW2 option의 value가 "NSW" — 원문 버그 이식).
export const CHINA_GOODS_PLATFORM_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "PS4", label: "PS4" },
  { value: "PS5", label: "PS5" },
  { value: "XB1", label: "XB1" },
  { value: "XBX", label: "XBX" },
  { value: "NSW", label: "NSW" },
  { value: "NSW", label: "NSW2" },
];

// legacy invoice_goods_ps.php mode=register|modify — 상품 등록/수정(공유 폼).
export type ChinaGoodsSaveRequest = {
  mode: "register" | "modify";
  idx: number; // register 시 0
  platform: string;
  goods_nm: string;
  price: string; // 텍스트 입력(raw)
};
export type ChinaGoodsSaveResult = { message: string };

// legacy invoice_goods_ps.php mode=delete — 상품 삭제.
export type ChinaGoodsDeleteRequest = { idx: number };
export type ChinaGoodsDeleteResult = { message: string };

// legacy china/invoice_register.php — 중국 결제 주문서 작성(register).
// 결제자 전체(모달, idx desc, 페이징 없음): select idx,name,email from tbl_invoice_member.
export type ChinaMemberOption = { idx: number; name: string; email: string };
export type ChinaMemberAllResponse = { items: ChinaMemberOption[] };

// 주문상품 검색(invoice_goods_ps.php mode=invoice_goods_search).
export type ChinaGoodsSearchQuery = { search_platform: string; search_value: string };
export type ChinaGoodsSearchItem = { platform: string; goods_nm: string; price: number };
export type ChinaGoodsSearchResponse = { items: ChinaGoodsSearchItem[] };

// 주문상품 라인(추가된 항목). qty는 텍스트 입력(raw).
export type ChinaOrderLineItem = { platform: string; goods_nm: string; qty: string; price: number };

// 주문서 저장(invoice_ps.php mode=register).
export type ChinaOrderRegisterRequest = {
  settle_no: string;
  ord_ymd: string;
  settle_price: number;
  orderName: string;
  orderEmail: string;
  settlekind: string; // legacy hidden 빈값
  settle_count: string;
  items: ChinaOrderLineItem[];
};
export type ChinaOrderRegisterResult = { success: boolean; settle_no: string };

// legacy china/invoice_request.php — 중국 결제요청(결제대기) 리스트.
// 검색/아이템/응답 shape는 #218(invoice_list)과 동일 → ChinaInvoiceListSearch/Item/Response 재사용.
// legacy invoice_ps.php mode=invoice_delete — 주문서 삭제(order + item, settle_no).
export type ChinaOrderDeleteRequest = { settle_no: string };
export type ChinaOrderDeleteResult = { success: boolean };

// legacy china/sales_china_year.php — 중국 누적매출 현황(연도×지역 매트릭스).
// amounts[i]는 regions[i]에 대응. total=연도별 4지역 합, region_totals=지역별 전연도 합.
export type ChinaSalesYearRow = { year: number; amounts: number[]; total: number };
export type ChinaSalesYearResponse = {
  regions: string[];
  rows: ChinaSalesYearRow[];
  region_totals: number[];
  grand_total: number;
};

// legacy china/sales_china_month.php — 중국 월별매출 현황(선택연도 월×지역 매트릭스).
export type ChinaSalesMonthSearch = { search_year: string };
export type ChinaSalesMonthRow = { month: number; amounts: number[]; total: number };
export type ChinaSalesMonthResponse = {
  year: number;
  regions: string[];
  rows: ChinaSalesMonthRow[];
  region_totals: number[];
  grand_total: number;
};

// legacy china/order_china_month.php — 중국 월별주문 현황(타이틀별 × 지역별 수량/금액).
export type ChinaOrderMonthSearch = { search_year: string; search_month: string };
export type ChinaOrderMonthCell = { qty: number; amount: number };
export type ChinaOrderMonthTitle = {
  product_nm: string;
  platform: string;
  price: number;
  cells: ChinaOrderMonthCell[]; // regions[i] 대응
  row_qty: number;
  row_amount: number;
};
export type ChinaOrderMonthResponse = {
  year: number;
  month: number;
  regions: string[];
  titles: ChinaOrderMonthTitle[];
  region_totals: ChinaOrderMonthCell[];
  total_all_qty: number;
  total_all_amount: number;
};

// legacy china/invoice_view.php — 주문서 상세보기(읽기전용).
export type ChinaOrderDetailSearch = { settle_no: string };
export type ChinaOrderDetailInfo = {
  name: string;
  email: string;
  ord_ymd: string;
  settle_price: number;
  amount_paid: number;
  settle_count: string;
  step: string; // 1 결제대기 | 2 결제완료
};
export type ChinaOrderDetailItem = {
  product_nm: string;
  platform: string; // invoice_modify 상품 표시용(invoice_view는 미사용)
  price: number;
  qty: number;
};
export type ChinaOrderDetailLog = {
  settle_count: number;
  pg_provider: string;
  status: string; // paid → 결제완료
  imp_uid: string;
  pg_tid: string;
  paid_amount: number;
  reg_date: string;
};
export type ChinaOrderDetailAddress = {
  name: string;
  zipcode: string;
  address: string;
  tel: string;
};
export type ChinaOrderDetailResponse = {
  order: ChinaOrderDetailInfo | null;
  items: ChinaOrderDetailItem[];
  logs: ChinaOrderDetailLog[];
  address: ChinaOrderDetailAddress[];
};

// legacy china/invoice_modify.php + invoice_ps.php mode=modify — 주문 헤더 수정(상품 저장 dead).
export type ChinaOrderModifySearch = { settle_no: string };
export type ChinaOrderModifyRequest = {
  settle_no: string;
  settle_price: number;
  orderName: string;
  orderEmail: string;
  ord_ymd: string;
  settle_count: string;
};
export type ChinaOrderModifyResult = { success: boolean };
