// legacy partner/partner_list.php — 파트너 계정 관리(AdminPartner::getPartnerMemberList, a.idx desc, 50/page).
// 검색 파라미터는 코드에만 존재하고 화면 폼은 없음(URL 전용). getSupplierList()는 dead fetch.

export type PartnerMemberListSearch = {
  page: number;
  search_publisher_name: string; // 파트너명 부분일치(publisher_name LIKE '%v%')
  report_term: string; // 리포트주기 등호(M/T)
  is_system: string; // 시스템 사용 등호(Y/N)
};

export type PartnerMemberItem = {
  idx: number;
  id: string; // 담당자 계정(=이메일, partner_member_view 링크)
  name: string; // 담당자명
  flag: string; // 계정상태(Y=접속가능, else=접속불가)
  publisher_code: number;
  publisher_name: string; // 파트너명
};

export type PartnerPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type PartnerMemberListResponse = {
  items: PartnerMemberItem[];
  pagination: PartnerPagination;
};

// legacy partner/partner_code.php — 파트너 코드 관리(AdminPartner::getPartnerList, tbl_partner,
// publisher_name asc, 50/page). 검색필터 폼 존재(파트너명 LIKE·report_term·is_system 등호).
export type PartnerListSearch = {
  page: number;
  search_publisher_name: string; // 파트너명 부분일치
  report_term: string; // 리포트주기 등호(M/T)
  is_system: string; // 시스템 사용 등호(Y/N)
};

export type PartnerListItem = {
  publisher_code: number;
  publisher_name: string;
  report_term: string; // M=월별, else=분기별
  is_system: string; // Y=사용
};

export type PartnerListResponse = {
  items: PartnerListItem[];
  pagination: PartnerPagination;
};

// legacy getSupplierList() — tbl_partner에 미등록된 공급처(추가 모달 select용).
export type PartnerSupplierItem = {
  publisher_code: number;
  publisher_name: string;
};

// legacy partner_ps.php — 모두 plain text 응답(alert). china/genba 선례대로 {message} JSON 계약.
export type PartnerMutationResult = { message: string };

// mode=partner_add — tbl_partner insert(flag='Y').
export type PartnerAddRequest = {
  publisher_code: number;
  publisher_name: string;
  report_term: string;
};

// mode=partner_config — is_system 토글 update.
export type PartnerConfigRequest = {
  publisher_code: number;
  is_system: string;
};

// mode=partner_report_config — report_term update.
export type PartnerReportConfigRequest = {
  publisher_code: number;
  report_term: string;
};

// legacy partner/partner_pg_fee.php — 파트너 PG수수료 관리(tbl_pg_fee⋈tbl_partner,
// b.publisher_name asc, 30/page). 검색필터 파트너명 LIKE 단일.
export type PartnerPgFeeSearch = {
  page: number;
  search_publisher_name: string;
};

export type PartnerPgFeeItem = {
  publisher_code: number;
  publisher_name: string;
  account: string; // %(raw 값, 인라인 편집)
  credit_card: string;
  mobile_payment: string;
};

export type PartnerPgFeeListResponse = {
  items: PartnerPgFeeItem[];
  pagination: PartnerPagination;
};

// legacy getNonPgfeePartner() — 수수료 미등록 파트너(등록 모달 select).
export type PartnerPgFeeCandidate = {
  publisher_code: number;
  publisher_name: string;
};

// legacy partner_pg_fee_ps.php mode=register — tbl_pg_fee insert.
export type PartnerPgFeeRegisterRequest = {
  publisher_code: number;
  account: string;
  credit_card: string;
  mobile_payment: string;
};

// mode=modify — 수수료 3종 update.
export type PartnerPgFeeModifyRequest = PartnerPgFeeRegisterRequest;

// mode=delete — publisher_code 삭제.
export type PartnerPgFeeDeleteRequest = {
  publisher_code: number;
};

// legacy partner/partner_email.php — 파트너 알림 주소록(tbl_publisher_email⋈tbl_partner,
// b.publisher_name asc, 20/page). 등록/수정/삭제 UI는 legacy 미완성(dead) — 읽기 전용.
export type PartnerEmailSearch = {
  page: number;
};

export type PartnerEmailItem = {
  publisher_code: number;
  publisher_name: string;
  email: string[]; // legacy email 컬럼(JSON 배열)을 백엔드가 파싱, textarea에 줄바꿈 표시
};

export type PartnerEmailListResponse = {
  items: PartnerEmailItem[];
  pagination: PartnerPagination;
};

// legacy getNonEmailPartner() — 이메일 미등록 파트너(등록 모달 select 후보).
export type PartnerEmailCandidate = {
  publisher_code: number;
  publisher_name: string;
};

// legacy partner/sales_list.php — Sales list 동기화(tbl_sales_publisher 월간 집계).
// URL 파라미터명은 legacy 유지(search_*). publisher_code 미지정 시 조회 안 함.
export type PartnerSalesListSearch = {
  search_publisher_code: string;
  search_year: string;
  search_month: string;
};

export type PartnerSalesItem = {
  publisher_code: number;
  publisher_name: string; // legacy getPartnerName N+1 → 서버 join
  product_code: string;
  product_nm: string;
  order_srp: number;
  cc: number; // 판매수량 count(*)
  sum_settleprice: number; // 합계 sum(qty*order_srp)
};

export type PartnerSalesListResponse = {
  items: PartnerSalesItem[];
  total_sold: number; // Σcc
  total_price: number; // Σsum_settleprice
};

// legacy getPartnerListAll('') — 전체 파트너(sales/refund/report 공통 select).
export type PartnerListAllItem = {
  publisher_code: number;
  publisher_name: string;
  report_term: string;
};

// legacy report_ps.php mode=report_batch — sp_sales_publisher_insert_batch 실행.
export type PartnerSalesSyncRequest = {
  publisher_code: number;
  year: string;
  month: string;
};

// legacy partner/refund_list.php — Refund list 동기화(tbl_sales_publisher status='9', canceldt 월).
// sales_list와 구조 동일, 환불(취소일 기준) 차이. URL 파라미터명 legacy 유지.
export type PartnerRefundListSearch = {
  search_publisher_code: string;
  search_year: string;
  search_month: string;
};

export type PartnerRefundItem = {
  publisher_code: number;
  publisher_name: string;
  product_code: string;
  product_nm: string;
  order_srp: number;
  cc: number;
  sum_settleprice: number;
};

export type PartnerRefundListResponse = {
  items: PartnerRefundItem[];
  total_sold: number;
  total_price: number;
};

// legacy report_ps.php mode=refund_batch — sp_sales_publisher_refund_batch 실행.
export type PartnerRefundSyncRequest = {
  publisher_code: number;
  year: string;
  month: string;
};

// legacy partner/report_register.php — 리포트 생성(정산 미리보기 + 생성).
// URL 파라미터명 legacy 유지. account_fee 등은 pg_fee override 대상.
export type PartnerReportSearch = {
  publisher_code: string;
  search_report_term: string; // M(월별) | T(분기별)
  search_year: string;
  search_month: string; // 월별 01~12
  search_month_term: string; // 분기별 1~4
  currency_converter: string; // USD | EUR | JPY
  account_fee: string;
  card_fee: string;
  mobile_fee: string;
  royalty: string; // 환율값
  royalty_info: string;
};

// legacy setPartnerReport() 결과 — 정산 raw(계산은 프론트에서).
export type PartnerReportRawItem = {
  product_code: string;
  product_nm: string;
  product_name_en: string;
  order_srp: number;
  settlekind: string; // Account | Credit | Mobile
  price: number;
  status: string; // '2'(판매) | '9'(환불)
  cc: number; // gross units sold(환불은 음수)
  sum_settleprice: number;
  product_srp: number;
  product_ppr: number;
  product_rs: string; // revenue %("0"이면 ppr 기반 계산)
  platform: string;
  product_platform: number;
};

// legacy getPartnerPGFee() — 단건 PG 수수료(결제수수료 override).
export type PartnerReportPgFee = {
  account: string;
  credit_card: string;
  mobile_payment: string;
};

export type PartnerReportPreviewResponse = {
  items: PartnerReportRawItem[];
  pg_fee: PartnerReportPgFee | null;
};

// fetcher 요청(정규화된 파라미터).
export type PartnerReportPreviewParams = {
  publisher_code: string;
  report_term: string;
  year: string;
  month: string;
};

// legacy btn_report listArray 각 행 — tbl_report insert용.
export type PartnerReportLine = {
  product_code: string;
  product_nm_en: string;
  platform_code: string;
  balence: string;
  rate: string;
  payment_gateway: string;
  publisher_srp: string;
  sales_price: string;
  publisher_price: string;
  product_cost: string;
  gross_units_sold: string;
  gross_sales_in_vat: string;
  gross_sales_ex_vat: string;
  payment_gateway_fee: string;
  net_sales: string;
  revenue: string;
  revenue_share: string;
};

// legacy report_ps.php mode=report_register — tbl_report_config + tbl_report.
export type PartnerReportCreateRequest = {
  publisher_code: string;
  report_term: string;
  currency_converter: string;
  account_fee: string;
  card_fee: string;
  mobile_fee: string;
  royalty: string;
  royalty_info: string;
  search_year: string;
  search_month: string;
  report_data: PartnerReportLine[];
};

// legacy report_ps.php mode=revenue_edit — tbl_goods_item product_rs/product_srp.
export type PartnerRevenueEditRequest = {
  product_code: string;
  revenue: string;
  goods_srp: string;
  publisher_price: string;
  sales_price: string;
};

// legacy partner/report_list.php — 리포트 내역(tbl_report_config 목록).
// URL 파라미터명 legacy 유지. publisher_code 있으면 month 무시.
export type PartnerReportListSearch = {
  search_publisher_code: string;
  search_report_term: string; // M | T
  search_year: string;
  search_month: string;
  search_month_term: string;
};

export type PartnerReportListItem = {
  idx: number;
  publisher_name: string;
  report_year: string;
  report_month: string;
  report_term: string; // M | T
  total: number; // Σrevenue_share(KRW)
  royalty: number; // 환율값
  currency_converter: string;
  total_sold: number; // Σgross_units_sold
  status: string; // 한글(대기/통보/확인/송금완료)
};

export type PartnerReportListResponse = {
  items: PartnerReportListItem[];
  total_sold: number;
  total_price: number;
};

// fetcher 요청(정규화 파라미터).
export type PartnerReportListParams = {
  publisher_code: string;
  report_term: string;
  year: string;
  month: string;
};

// legacy partner/report_view.php — 리포트 상세보기(read-only).
export type PartnerReportViewSearch = {
  idx: string;
};

// legacy getPartnerReportInfo() — 리포트 설정 요약(status는 raw, 미변환).
export type PartnerReportConfig = {
  idx: number;
  publisher: string; // tbl_publisher.publisher(퍼블리셔명)
  publisher_code: number;
  currency_converter: string;
  account_fee: string;
  card_fee: string;
  mobile_fee: string;
  report_year: string;
  report_month: string;
  report_term: string; // M | T
  royalty: number;
  royalty_info: string;
  reg_date: string;
  update_date: string;
  notice_date: string;
  approval_date: string;
  status: string; // raw(ready/notice/approval/transfer)
};

// legacy getPartnerReportData() — 리포트 통계 행.
export type PartnerReportDataItem = {
  product_code: string;
  product_nm_en: string;
  publisher_srp: number;
  rate: string; // % (표시/계산)
  publisher_price: number;
  product_cost: number;
  gross_units_sold: number;
  gross_sales_ex_vat: number;
  payment_gateway_fee: number;
  net_sales: number;
  revenue_share: number;
  platform: string;
  payment_gateway: string;
};

export type PartnerReportViewResponse = {
  config: PartnerReportConfig;
  items: PartnerReportDataItem[];
};
