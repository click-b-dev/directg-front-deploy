# 어드민 — 파트너 · 퍼블리셔/코드 · 중국

> 대상: `legacy-project/pc/_Admin_/` 의 `partner/`, `code/`, `publisher/`, `china/` 영역.
> 원본은 읽기 전용. 본 문서는 화면·데이터·플로우 계약을 1:1 이관하기 위한 기반 정의다.
> 공통 인프라(세션 `$_SESSION['admin']`, 2 DB `$conn`/`$conn_dgkr`, admin_head+topbar+sidebar+footer 레이아웃, jQuery/Bootstrap5)는 이미 파악된 것으로 보고 반복 서술하지 않는다.

## 개요

이 영역은 **내부 관리자(tbl_admin, dgkr)가 파트너/배급사·정산·중국결제를 관리**하는 화면이다.
배급사가 자기 매출/환불을 직접 조회하는 **퍼블리셔 포털(`_Admin2_`, 계정 tbl_admin_publisher)** 과는 별개 시스템이며, 여기서는 그 포털에서 배급사가 볼 데이터(리포트·계정·정산 파라미터)를 **관리자가 생성/설정**한다.

핵심 도메인 개념:

- **파트너 = 배급사(publisher)**: 코드상 "파트너"와 "퍼블리셔"는 사실상 동의어. 식별자는 `publisher_code`. 파트너 마스터는 `tbl_partner`(메인DB `directgames`), 공급처 마스터는 `tbl_publisher`(메인/구DB 이중화). 파트너는 공급처(`tbl_publisher`) 중 정산 대상으로 등록된 부분집합이다.
- **리포트 주기(report_term)**: `M`=월별, `T`=분기별. 파트너별 설정.
- **파트너 시스템 사용(is_system)**: `Y`/`N`. `Y`이면 퍼블리셔 포털에서 리포트를 노출("상용화") — `report_list_use.php`가 `is_system='Y'` 전용.
- **정산 상세 로직(SRP/rate/PG fee/revenue share/royalty)**은 `PARTNER-SETTLEMENT.md`가 단일 진실 원천. 본 문서는 화면·파라미터·데이터소스만 기술하고 계산식은 교차링크한다. (→ `docs/PARTNER-SETTLEMENT.md`)
- **파트너 계정의 조회범위**: 퍼블리셔 포털 계정(`tbl_admin_publisher`)에 지역(`kr`/`jp`)·`start_date`·`publisher_code`가 저장되어 배급사가 볼 수 있는 데이터 범위를 결정. (→ `ADMIN-AUTHORIZATION.md` 퍼블리셔 포털 4장)

**china 영역 정체(코드 확인)**: 중국 지역 배급사(성(省) 단위 거래처, 이메일로 식별)를 대상으로 한 **수동 인보이스 주문서 발행/결제요청/결제완료 처리 + 매출·주문 통계**. 일반 스토어프론트 주문과 별개 테이블(`tbl_invoice_*`) 사용. 결제는 KCP 로그(`tbl_kcp_log_invoice`)와 연동되고, 매출통계는 구DB(`$dsn_dgkr`)에서 조회. 사이드바 상 "중국 결제 관리".

**code 영역 정체**: `code/` 는 사이드바가 `sidebar_goods.php`(상품 > 코드 관리)이고 `$topmenu['goods']`로 설정 — 실제로는 **상품 코드/공급처 관리** 영역이다. `publisher_list.php`(공급처 설정)만 파트너/퍼블리셔 관리와 직접 연결되고, 나머지(카테고리·플랫폼·장르·프랜차이즈·배송방법)는 상품 코드 마스터다. `code/publisher_list.php`·`code/publisher_ps.php`는 **공급처 등록이 admin_level=="99"(슈퍼) 서버측 차단** 대상이다.

---

## 파트너 (partner/)

### 메뉴 트리 (sidebar_partner.php)

topbar 진입점: `partner/partner_list.php` (`$topmenu['partner']='active'`).

```
파트너 관리
├─ 파트너 현황            partner/partner_code.php
├─ 파트너 계정 관리       partner/partner_list.php
├─ 파트너 PG수수료 관리   partner/partner_pg_fee.php
└─ 파트너 알림 주소록 관리 partner/partner_email.php
리포트 관리
├─ Sales list 동기화     partner/sales_list.php
├─ Refund list 동기화    partner/refund_list.php
├─ 리포트 생성           partner/report_register.php
└─ 리포트 내역           partner/report_list.php
```

주의: 사이드바 라벨 "파트너 현황"의 링크는 `partner_code.php`(=파트너 코드 관리)로 연결된다. 코드상 페이지 타이틀은 "파트너 코드 관리".

### 페이지별 정의

#### 파트너 코드 관리 — `partner/partner_code.php`
- 유형: `*_list` + 등록/수정 모달(AJAX)
- 기능: `tbl_partner` 목록(파트너 코드·이름·리포트주기·시스템사용). 필터: `search_publisher_name`(LIKE), `report_term`(M/T), `is_system`(Y/N). 파트너 추가(공급처 중 미등록분에서 선택), 리포트주기 수정, is_system 토글(스위치).
- 정책·규칙: 등록 시 공급처 목록은 `getSupplierList()`(tbl_publisher 중 tbl_partner에 없는 것). is_system 토글/주기수정/추가 모두 `partner_ps.php`로 AJAX POST.
- 데이터소스: `AdminPartner->getPartnerList()`, `getSupplierList()` / `tbl_partner`, `tbl_publisher`
- 파라미터: GET `page,search_publisher_name,report_term,is_system` / 페이지당 50
- 연계: → `partner_ps.php`(mode: partner_add/partner_config/partner_report_config)
- 참조: 정산 주기 개념 → PARTNER-SETTLEMENT

#### 파트너 계정 관리 — `partner/partner_list.php`
- 유형: `*_list`
- 기능: 퍼블리셔 포털 계정(`tbl_admin_publisher`) 목록. 컬럼: 파트너명·담당자명·담당자계정(id=이메일)·접속상태(flag)·정보수정. 담당자계정 클릭 시 `partner_member_view.php`.
- 정책·규칙: `getPartnerMemberList()`가 `tbl_admin_publisher a inner join tbl_partner b`. **여기서 조회하는 것은 퍼블리셔 포털용 계정** — 관리자가 배급사 포털 로그인 계정을 관리하는 화면.
- 데이터소스: `getPartnerMemberList()`, `getSupplierList()` / `directgames.tbl_admin_publisher`, `tbl_partner`
- 파라미터: GET `page,search_publisher_name,report_term,is_system`(필터 UI는 없고 코드만 존재) / orderby `a.idx desc` / 50
- 연계: → `partner_member_register.php`, `partner_member_view.php`

#### 파트너 계정 등록 — `partner/partner_member_register.php`
- 유형: `*_form`
- 기능: 퍼블리셔 포털 계정 신규 등록 폼. 필드: 파트너(select), 담당자명, 아이디(=이메일), 비밀번호, 접속상태(flag Y/N), 조회지역(kr/jp 체크박스), 조회 시작일자(datepicker).
- 정책·규칙: 조회지역·시작일자가 배급사의 데이터 노출 범위를 결정(포털 격리). 파트너 목록은 `getPartnerListAll('')`.
- 데이터소스: `getPartnerListAll('')` / `tbl_partner`
- 연계: → `partner_member_ps.php`(mode=register)

#### 파트너 계정 정보보기 — `partner/partner_member_view.php`
- 유형: `*_view` (읽기전용, 수정 폼 아님)
- 기능: `tbl_admin_publisher` 단건 표시(publisher_code, name, id, flag, kr, jp, start_date). 비밀번호는 표시 안 함.
- 데이터소스: `getPartnerMemberView($idx)` / `directgames.tbl_admin_publisher`
- 파라미터: GET `idx`

#### 파트너 계정 처리 — `partner/partner_member_ps.php`
- 유형: `*_ps`
- 기능: mode별 — `register`(계정 insert, `pwd=password(:pwd)` MySQL PASSWORD() 해시), `edit`(수정+선택적 비번변경 `isModManagerPw=='y'`), `delete`(빈 구현), `chk_id`(아이디 중복검사 JSON).
- 정책·규칙: register 성공 시 `alert` 후 `HTTP_REFERER`로 리다이렉트. `edit`/`chk_id`의 `$id` 변수는 미정의(레거시 버그 — id 파라미터 미수신). **동작 그대로 이관, 임의 수정 금지.**
- 데이터소스: `directgames.tbl_admin_publisher`

#### 파트너 PG수수료 관리 — `partner/partner_pg_fee.php`
- 유형: `*_list` + 등록/수정/삭제(AJAX)
- 기능: 파트너별 PG 수수료율(Account/Credit Card/Mobile Payment, %) 목록·인라인 수정·삭제. 등록 모달(미등록 파트너 선택).
- 데이터소스: `getPartnerPGFeeList()`, `getNonPgfeePartner()` / `directgames.tbl_pg_fee` inner join `tbl_partner`
- 파라미터: GET `page,search_publisher_name` / orderby `b.publisher_name asc` / 30
- 연계: → `partner_pg_fee_ps.php`(mode: register/modify/delete/select). 이 수수료율은 리포트 생성 시 결제수수료 기본값으로 사용(report_register).
- 참조: PG fee 적용 계산 → PARTNER-SETTLEMENT

#### 파트너 PG수수료 처리 — `partner/partner_pg_fee_ps.php`
- 유형: `*_ps`
- 기능: `register`/`modify`/`delete`/`select`(JSON) on `directgames.tbl_pg_fee`. `publisher_code`는 INT sanitize, 수수료는 FLOAT.
- 주의: 상단에 `print_r($_POST)` 디버그 출력이 남아 있음(레거시 그대로).

#### 파트너 알림 주소록 관리 — `partner/partner_email.php`
- 유형: `*_list` + 등록 모달
- 기능: 파트너별 알림 이메일 주소록(`tbl_publisher_email`). `email` 컬럼은 JSON 배열, textarea에 줄바꿈으로 표시.
- 정책·규칙: 목록 상단 `$add_where`/`$param`/`$orderby` 미정의 상태로 메서드 호출(레거시 — 필터 미구현). 수정/삭제 버튼 핸들러 없음. 등록 모달 form action이 잘못 `partner_pg_fee_ps.php`를 가리킴(레거시 버그). **처리용 `partner_email_ps.php`는 사실상 빈 파일(1줄)** — 등록 기능 미완성. 동작 그대로 이관.
- 데이터소스: `getPartnerNotificationEmail()`, `getNonEmailPartner()` / `directgames.tbl_publisher_email` inner join `tbl_partner`
- 파라미터: GET `page` / 20

#### Sales list 동기화 — `partner/sales_list.php`
- 유형: `*_list` + 동기화(AJAX) + 엑셀
- 기능: 선택 파트너·년월의 판매집계 조회(옵션상품별 SRP/판매수량/합계). "Sales list 동기화" 버튼 → `report_ps.php`(mode=report_batch, 저장프로시저 `sp_sales_publisher_insert_batch` 호출). 엑셀 다운로드는 화면 HTML을 POST하여 `excel_sales_ps.php`가 xls로 반환.
- 데이터소스: `getPartnerSalesList(code,start,end)` / `tbl_sales_publisher`(집계, `cdt<>'1970-01-01 09:00:00'` 제외). `getPartnerListAll('')`.
- 파라미터: GET `search_publisher_code,search_year,search_month`(기본: 올해/전월)
- 연계: → `report_ps.php`(report_batch), `excel_sales_ps.php`

#### Refund list 동기화 — `partner/refund_list.php`
- 유형: Sales list와 동형(환불 버전)
- 기능: 파트너·년월 환불집계(status='9'). 동기화 → `report_ps.php`(mode=refund_batch, `sp_sales_publisher_refund_batch`). 엑셀 → `excel_refund_ps.php`.
- 데이터소스: `getPartnerRefundList(code,search_date)` / `tbl_sales_publisher`(canceldt 기준 월, status='9')
- 파라미터: GET `search_publisher_code,search_year,search_month`

#### 리포트 생성 — `partner/report_register.php`
- 유형: `*_form`(미리보기) + 생성/동기화(AJAX/POST)
- 기능: 정산 리포트 미리보기·생성. 필터: 리포트주기(M/T), 년/월(또는 분기), 파트너, 환율(currency_converter USD/EUR/JPY + royalty + royalty_info), 결제수수료(account/card/mobile %). 미리보기 시 `setPartnerReport()`로 상품별 매출/환불 집계 후 화면에서 SRP·rate·PG fee·gross/net sales·revenue share·Royalty payable을 계산 표시. "리포트 생성" 버튼 → JSON 직렬화하여 `report_ps.php`(mode=report_register)로 저장. 월별+파트너+년월 지정 시에만 동기화 버튼 노출(`$show_sync_btn`).
- 정책·규칙: PG fee 기본값은 `getPartnerPGFee()`에서 선로딩. rate/revenue_share 계산식은 화면 PHP + JS에 존재하나 **정산 정확성이 핵심** — 계산식 계약은 PARTNER-SETTLEMENT를 기준으로 이관·검증.
- 데이터소스: `setPartnerReport()`(메인DB `tbl_sales_publisher`+`tbl_goods_item`+`tbl_platform`, 구DB 분기는 `dgkrshop.*`), `getPartnerPGFee()`, `getPartnerListAll('')`
- 파라미터: GET(미리보기) 다수. POST(저장) report_data(JSON) 등.
- 연계: → `report_ps.php`(report_register/report_batch/refund_batch/revenue_edit)
- 참조: **PARTNER-SETTLEMENT (계산식·라운딩·VAT·환율)**

#### 리포트 처리 — `partner/report_ps.php`
- 유형: `*_ps`
- 기능: mode별 —
  - `report_register`: `tbl_report_config`(부모) upsert + `tbl_report`(자식, 상품행) 전체 재삽입(delete→insert). 저장 후 `report_list.php`로 이동.
  - `report_batch` / `refund_batch`: 저장프로시저 호출로 `tbl_sales_publisher` 동기화.
  - `revenue_edit`: `tbl_goods_item`의 `product_rs`(revenue share %)·`product_srp` 수정.
  - `email_notice`: `tbl_report_config.status='notice'`로 갱신(`$idx` 미정의 — 레거시).
- 데이터소스: `directgames.tbl_report_config`, `directgames.tbl_report`, `tbl_goods_item`, 프로시저 `sp_sales_publisher_insert_batch`/`sp_sales_publisher_refund_batch`

#### 리포트 내역 — `partner/report_list.php`
- 유형: `*_list`
- 기능: 생성된 리포트(`tbl_report_config`) 목록. 필터: 리포트주기(M/T)·년·월(분기)·파트너. 컬럼: 파트너·리포트제목·수량·합계(KRW)·Royalty Payable(=total×royalty)·상태·상세보기·엑셀 다운로드.
- 정책·규칙: `search_publisher_code` 지정 시 `search_month=""`로 전체월 조회. 하단 합계행. 다운로드 버튼 → `report_download.php`(POST idx).
- 데이터소스: `getPartnerReportList(code,term,year,month,'')` / `directgames.tbl_report_config` inner join `tbl_partner`
- 연계: → `report_view.php?idx=`, `report_download.php`

#### 리포트 내역 (상용화) — `partner/report_list_use.php`
- 유형: `*_list` (report_list.php의 is_system='Y' 전용 변형)
- 기능: report_list.php와 동일 구조. 차이: `$is_system='Y'` 고정으로 **퍼블리셔 포털에 노출되는(상용화된) 파트너의 리포트만** 조회. `getPartnerReportList(..., $is_system)`, `getPartnerListAll('Y')`.
- 참조: 퍼블리셔 포털 연계 → ADMIN-AUTHORIZATION 퍼블리셔 포털 장

#### 리포트 상세보기 — `partner/report_view.php`
- 유형: `*_view`
- 기능: 단건 리포트 상세(설정헤더: Period/Royalty/PG fee, 상품행 테이블, Royalty Payable 합계). 상단 "알림메일발송" 버튼(data-idx/publisher/year/month) — 발송 핸들러는 화면 JS에 미포함(레거시). 생성일/수정일/발송일/승인일/상태 표시.
- 데이터소스: `getPartnerReportInfo($idx)`(`tbl_report_config` inner join `directgames.tbl_publisher` on publisher_code=idx), `getPartnerReportData($idx)`(`tbl_report`+`tbl_goods_item`+`tbl_platform` 집계)
- 파라미터: GET `idx`

#### 리포트 다운로드 — `partner/report_download.php`
- 유형: `*_excel`(xls HTML)
- 기능: POST `idx`로 리포트를 xls 형식 HTML로 출력(H2 Interactive 주소 헤더 포함, ROYALTY REPORT). 파일명 `report_DGKR_{publisher}_{year}-{month|Qn}`. gross_units_sold<>0 행만 출력, Royalty Payable = revenue_share 합계×royalty.
- 데이터소스: `getPartnerReportInfo`, `getPartnerReportData`
- 참조: 출력 포맷·회계값 → PARTNER-SETTLEMENT

#### 매출 엑셀 처리 — `partner/excel_sales_ps.php`
- 유형: `*_excel`
- 기능: `sales_list.php`가 POST한 `data`(URL-encoded HTML)를 그대로 디코드하여 xls로 반환. 자체 쿼리 없음(화면 HTML 재출력).

#### 환불 엑셀 처리 — `partner/excel_refund_ps.php`
- 유형: `*_excel`
- 기능: POST(publisher_code/year/month)로 `tbl_sales_publisher`(status='9', canceldt 월) 재조회하여 xls 테이블 출력. 세션 가드 존재(`$_SESSION['admin']['admin_id']==""` → index로).
- 데이터소스: `tbl_sales_publisher`

---

## 퍼블리셔/코드 (code/, publisher/)

> **admin_level=="99" 서버차단 명시**: `code/publisher_ps.php`는 mode=register 처리 시작에서 `$_SESSION['admin']['admin_level'] != "99"`이면 `권한이 없습니다` JSON 반환 후 `exit`. `code/publisher_list.php`는 "공급처 등록" 버튼과 등록 모달 자체를 `admin_level=="99"`일 때만 렌더링(서버측 조건부 출력). 마이그레이션 시 이 서버측 권한 게이트를 반드시 재현할 것(클라이언트 숨김만으로는 불충분).

`code/`는 사이드바 `sidebar_goods.php`, `$topmenu['goods']`(상품 > 코드 관리) 영역. 담당 범위 중 파트너/퍼블리셔와 직접 관련된 것은 공급처 화면이고, 나머지는 상품 코드 마스터(목록 위주, 대부분 읽기전용)다.

### 페이지별 정의

#### 공급처 설정 — `code/publisher_list.php`
- 유형: `*_list` + 등록(AJAX, 99 전용)
- 기능: 공급처(`tbl_publisher`, is_view='Y') 목록. 컬럼: 공급처코드·명·사용여부·홈페이지·로고이미지·옵션상품수. 검색(publisher_name LIKE). 등록 모달은 **admin_level=99에서만** 출력(코드 자동생성).
- 정책·규칙: 등록 버튼/모달 모두 `if($_SESSION['admin']['admin_level']=="99")` 조건부. `registerPublisher()` → `publisher_ps.php`.
- 데이터소스: `Admin->getPublisherList()`, `getPublisherGoodsItemCount()` / `tbl_publisher`
- 파라미터: GET `page,search_type,search_value` / orderby publisher_name asc / 30
- 연계: → `publisher_ps.php`(mode=register)

#### 공급처 처리 — `code/publisher_ps.php`
- 유형: `*_ps`(JSON)
- 기능: mode=register — **구DB(`$dsn_dgkr`, DGKR)** `tbl_publisher`에 insert 후 lastInsertId를 publisher_code로 삼아 **리뉴얼DB(`$dsn`)** `tbl_publisher`에도 insert(2 DB 동기 등록). 성공/실패 JSON.
- 정책·규칙: **admin_level != "99" 이면 `권한이 없습니다` 반환 후 exit** (서버측 차단). 구DB 등록 성공(rowCount>0) 시에만 리뉴얼DB 등록.
- 데이터소스: DGKR `tbl_publisher`, 메인 `tbl_publisher`

#### 공급처 현황 — `publisher/publisher_list.php`
- 유형: `*_list` + 등록 모달
- 기능: `code/publisher_list.php`의 초기/단순 버전. `tbl_publisher` 목록(번호·코드·명·대표상품수·옵션상품수, 뒤 두 컬럼 미채움). 등록 모달(공급처코드 수동입력) 존재하나 버튼 핸들러(`btn_publisher_register`) 미구현, form action=`publisher_ps.php`. **주의: 같은 폴더에 `publisher_ps.php`가 없음** — 등록 미완성(레거시). `admin_level` 게이트 없음.
- 데이터소스: `Admin->getPublisherList()` / `tbl_publisher`
- 파라미터: GET `page` / orderby publisher_name asc / 20
- 비고: `code/publisher_list.php`가 후속·정식 버전으로 보임(추정). 이관 시 중복 화면 여부 확인 필요.

#### 프랜차이즈 관리 — `code/franchise_list.php`
- 유형: `*_list`(읽기전용)
- 기능: `getFranchiseList()` 목록(고유코드·프랜차이즈명·상품수 컬럼). 상품수 집계 로직(`getGoodsFranchiseCount`)은 주석 처리 — 상품수 컬럼 미채움. 검색 UI 비어있음(퍼블리셔 select 미구현).
- 데이터소스: `Admin->getFranchiseList()`

#### 카테고리 설정 — `code/category_list.php`
- 유형: `*_list` + 등록 모달
- 기능: `tbl_category`(depth 1/2/3=대/중/소분류) 목록·전체경로 표시. 등록 모달 → `category_ps.php`(mode=register). depth별 상위 경로 조합(`getCategoryInfo`).
- 데이터소스: `AdminGoods->getCategoryList()`, `getCategoryInfo()` / `tbl_category`
- 연계: → `category_ps.php`

#### 카테고리 처리 — `code/category_ps.php`
- 유형: `*_ps`
- 기능: mode=register — `tbl_category` insert(depth/code/name) 후 `category_list.php`로 이동. (수정/삭제 없음)

#### 플랫폼 설정 — `code/platform_list.php`
- 유형: `*_list`(읽기전용)
- 기능: `tbl_platform` 목록(플랫폼코드·명·사용여부). 등록/수정 없음.
- 데이터소스: `Admin->getPlatformList()`

#### 장르 현황 — `code/genre_list.php`
- 유형: `*_list`(읽기전용)
- 기능: Steam 장르 목록(장르코드·명·대표상품수).
- 데이터소스: `Admin->getSteamGenreList()`

#### 배송방법 설정 — `code/delivery_method.php`
- 유형: `*_list`(읽기전용)
- 기능: 배송방법 마스터 목록(코드·명·유형·기본배송비·무료조건·추적여부·평균기간·마감시간·도서산간·반품비·사용여부).
- 데이터소스: `Admin->getDeliveryMethodList()`

---

## 중국 (china/)

### 메뉴 트리 (sidebar_china.php)

topbar 진입점: `china/invoice_list.php` (`$topmenu['china']='active'`). 사이드바 그룹 "중국 결제 관리" (8 href — 지시서상 11은 실제 8개 링크).

```
중국 결제 관리
├─ 중국 결제자 리스트    china/invoice_member.php
├─ 중국 결제 상품리스트  china/invoice_goods.php
├─ 중국 결제 주문서 작성 china/invoice_register.php
├─ 중국 결제요청 리스트  china/invoice_request.php
├─ 중국 결제완료 리스트  china/invoice_list.php
├─ 중국 누적매출 현황    china/sales_china_year.php
├─ 중국 월별매출 현황    china/sales_china_month.php
└─ 중국 월별주문 현황    china/order_china_month.php
```

메뉴 미노출(직접/링크 진입) 파일: `invoice_view.php`, `invoice_modify.php`, `invoice_address_ps.php`, `invoice_email_send.php`, `invoice_ps.php`, `invoice_goods_ps.php`, `invoice_member_ps.php`, `invoice_print.php`.

공통 데이터모델: 결제자 `tbl_invoice_member`, 상품 `tbl_invoice_goods`, 주문 `tbl_invoice_order`(+ `tbl_invoice_order_item`), 배송지 `tbl_invoice_address`, 결제로그 `tbl_kcp_log_invoice`(모두 `directgames`). 주문 상태: `step='1'`=결제요청(대기), `step='2'`=결제완료. 결제자는 이메일로 식별하며 통계에서 지역(성)으로 매핑.

### 페이지별 정의

#### 중국 결제자 리스트 — `china/invoice_member.php`
- 유형: `*_list` + 등록 모달 + 비번초기화(AJAX)
- 기능: `tbl_invoice_member`(flag='Y') 목록(이메일=아이디·이름·마지막접속·비번초기화). 등록 모달(email/name/pwd). 비번초기화 버튼 → 오늘날짜(Ymd)로 초기화.
- 데이터소스: `China->getChinaInvoiceMember()` / `directgames.tbl_invoice_member`
- 파라미터: GET `page,search_name,search_email`
- 연계: → `invoice_member_ps.php`(register/pwd_reset/delete)

#### 중국 결제자 처리 — `china/invoice_member_ps.php`
- 유형: `*_ps`
- 기능: `register`(insert, `pwd=password(:pwd)`), `pwd_reset`(pwd=오늘날짜 PASSWORD()), `delete`(체크박스 배열 `chk[]`). 등록 후 `invoice_member.php`로 이동.
- 데이터소스: `directgames.tbl_invoice_member`

#### 중국 결제 상품 리스트 — `china/invoice_goods.php`
- 유형: `*_list` + 등록/수정/삭제 모달(AJAX)
- 기능: `tbl_invoice_goods`(플랫폼·상품명·판매가) 목록. 플랫폼 select(PS4/PS5/XB1/XBX/NSW/NSW2 — NSW2 value가 "NSW"로 잘못됨, 레거시). 등록/수정 동일 모달, 삭제 확인.
- 데이터소스: `China->getChinaInvoiceGoods()` / `directgames.tbl_invoice_goods`
- 파라미터: GET `page,search_name,search_platform`
- 연계: → `invoice_goods_ps.php`

#### 중국 결제 상품 처리 — `china/invoice_goods_ps.php`
- 유형: `*_ps`
- 기능: `register`/`modify`/`delete` on `tbl_invoice_goods`. `invoice_goods_search`(주문서 작성용 — 플랫폼+상품명 LIKE 검색결과를 `<tr>` HTML로 반환, 수량 입력+"상품 추가" 버튼 포함).
- 데이터소스: `directgames.tbl_invoice_goods`

#### 중국 결제 주문서 작성 — `china/invoice_register.php`
- 유형: `*_form`(신규) — mode 파라미터에 따라 modify 데이터 로드도 지원하나 실제 수정은 `invoice_modify.php` 사용
- 기능: 수동 주문서 작성. 좌: 주문자(결제자 조회 모달로 선택→name/email 채움), 결제분할(settle_count), 결제이력(빈 표). 우: 주문상품 설정(상품검색 모달→행 추가, 합계 자동계산), 주문정보(결제번호 `settleNo()` 자동생성, 주문일자, 결제금액), 배송지(빈 표). 저장 → `invoice_ps.php`(mode=register).
- 정책·규칙: settle_no는 `China->settleNo()`로 신규 채번. 상품 추가는 클라이언트에서 hidden input 배열(platform[]/goods_nm[]/qty[]/price[]) 누적.
- 데이터소스: `tbl_invoice_member`(결제자 목록 직접 쿼리), `China->settleNo()`
- 연계: → `invoice_ps.php`(register), `invoice_goods_ps.php`(invoice_goods_search)

#### 중국 결제 주문서 수정 — `china/invoice_modify.php`
- 유형: `*_form`(수정)
- 기능: `invoice_register.php`와 동형이나 GET settle_no로 기존 주문/상품/로그/배송지 로드, form mode=modify. 저장 → `invoice_ps.php`(mode=modify).
- 정책·규칙: 주문자명/이메일 초기값을 `$order_data['orderName']`/`['orderEmail']`로 읽으나 실제 컬럼은 `name`/`email`(레거시 불일치 — 빈값 표시 가능). 그대로 이관.
- 데이터소스: `directgames.tbl_invoice_order`, `tbl_invoice_order_item`, `tbl_kcp_log_invoice`, `tbl_invoice_address`, `tbl_invoice_member`
- 파라미터: GET `mode,settle_no`

#### 중국 결제 처리 — `china/invoice_ps.php`
- 유형: `*_ps`
- 기능: `register`(주문 insert + 상품행 insert, orddt=now), `modify`(주문 update + 상품행 upsert `ON DUPLICATE KEY`), `invoice_delete`(주문+상품행 삭제), `order_item_delete`, `delete`(상품 삭제). 처리 후 modify면 `invoice_register.php?mode=modify`로, 아니면 `invoice_request.php`로 이동.
- 정책·규칙: 리다이렉트 조건 `if($mode="modify")` — **대입 연산자(=) 사용으로 항상 참**(레거시 버그, 항상 modify 분기). register도 상품행에서 `$ea` 미정의 사용(qty 대신). `print_r` 디버그 출력 잔존. **동작 그대로 이관.**
- 데이터소스: `directgames.tbl_invoice_order`, `tbl_invoice_order_item`, `tbl_invoice_goods`

#### 중국 결제요청 리스트 — `china/invoice_request.php`
- 유형: `*_list`
- 기능: 결제대기(step='1', flag N/null) 주문 목록. 컬럼: 주문일자·결제번호(→invoice_view)·주문자·이메일·결제금액·결제일자·결제상태("결제대기")·수정(→invoice_modify)·삭제(AJAX invoice_delete).
- 데이터소스: `China->getChinaInvoiceRequest()` / `tbl_invoice_order` (step='1' and (flag='N' or flag is null))
- 파라미터: GET `page,search_year(기본 올해),search_settle_no,search_name,search_email` / orderby settle_no desc

#### 중국 결제완료 리스트 — `china/invoice_list.php`
- 유형: `*_list` (topbar 진입점)
- 기능: 결제완료(step='2', flag='Y') 주문 목록. 컬럼 동일하되 상태="결제완료", 수정 버튼 비활성(핸들러 없음).
- 데이터소스: `China->getChinaInvoiceList()` / `tbl_invoice_order` (step='2' and flag='Y')
- 파라미터: request와 동일

#### 주문서 상세보기 — `china/invoice_view.php`
- 유형: `*_view`
- 기능: 단건 주문 상세(주문자/상품/결제정보 결제예정·완료·남은금액·횟수·상태/결제상세로그 KCP/배송지). settle_no로 4개 테이블 직접 조회.
- 데이터소스: `tbl_invoice_order`, `tbl_invoice_order_item`, `tbl_kcp_log_invoice`, `tbl_invoice_address`
- 파라미터: GET `settle_no`

#### 배송지 처리 — `china/invoice_address_ps.php`
- 유형: `*_ps`
- 기능: mode=modify — `tbl_invoice_address`(name/zipcode/address/tel) update. 후 `invoice_member.php`로 이동. (등록/삭제 없음)

#### 인보이스 메일발송 — `china/invoice_email_send.php`
- 유형: 처리(메일)
- 기능: GET idx로 주문 조회 후 HTML 템플릿(결제요청 안내, Payment Link `https://directg.net/invoice/login.html`)을 치환하여 `Mail` 클래스로 발송. 제목 `#INVOICE {year}-{idx} Payment Request`. From `directg@h2int.com`, euckr 인코딩.
- 정책·규칙: 템플릿의 [pwd]/[email]/[link] 등 일부 치환자 미치환(레거시). 발송 결과 echo.
- 데이터소스: `tbl_invoice_order`

#### 중국 결제 주문서 출력 — `china/invoice_print.php`
- 유형: `*_print`(추정) — **파일 내용 1줄뿐(사실상 빈 파일)**. 인쇄 화면 미구현. 이관 시 스텁 처리.

#### 중국 누적매출 현황 — `china/sales_china_year.php`
- 유형: `*_list`(통계 매트릭스)
- 기능: 지역(성)×연도 매출 매트릭스(2016~올해). 지역은 **하드코딩 이메일 매핑**: 산시성/안후이성/저장성/허난성 각 1개 이메일. 셀=해당 이메일 결제자의 해당연도 매출, 우측/하단 합계.
- 정책·규칙: **구DB(`$dsn_dgkr`)** 연결. 검색필터 UI는 `d-none`(숨김).
- 데이터소스: `China->getSalesByYear($email,$year)` / (DGKR) `tbl_invoice_order` inner join `tbl_invoice_order_item`
- 참조: 지역 매핑 이메일은 상수처럼 하드코딩 — 이관 시 설정값 분리 여부는 사용자 확인 대상.

#### 중국 월별매출 현황 — `china/sales_china_month.php`
- 유형: `*_list`(통계 매트릭스)
- 기능: 선택 연도의 지역×월(1~12) 매출 매트릭스. 동일 4지역 하드코딩. 연도 select onchange 자동제출.
- 데이터소스: `China->getSalesByMonth($email,$year,$month)` / (DGKR)
- 파라미터: GET `search_year`(기본 올해)

#### 중국 월별주문 현황 — `china/order_china_month.php`
- 유형: `*_list`(통계 매트릭스) + CSV/엑셀 다운로드
- 기능: 선택 년월의 타이틀(상품명×플랫폼×단가)별 × 지역(수량/금액) 주문 매트릭스 + 총합계. `mode=excel`이면 같은 테이블을 xls로 출력(BOM+mso 스타일). `include_table_template()` 함수로 화면/엑셀 공용.
- 데이터소스: `China->getOrderByMonthTitles($year,$month)`(타이틀 목록), `getSalesByMonth(..., add_where)`(셀별 재집계) / (DGKR)
- 파라미터: GET `search_year,search_month,mode`
- 주의: 셀 재집계에서 상품명/플랫폼/단가를 문자열 보간으로 `add_where` 구성(SQL 인젝션 위험 — 레거시). 동작은 재현하되 이관 시 파라미터 바인딩 검토는 보안 관점 별도 판단.

---

## 변형/테스트 파일

- `partner/report_list_use.php` — `report_list.php`의 is_system='Y'(상용화/포털노출) 전용 변형.
- `partner/partner_email_ps.php` — 사실상 빈 파일(1줄). 알림 주소록 처리 미완성.
- `china/invoice_print.php` — 사실상 빈 파일(1줄). 인쇄 미구현.
- `publisher/publisher_list.php` — `code/publisher_list.php`의 구/단순 버전(등록 핸들러 미구현, 처리 파일 부재). 중복 화면 정리 대상(추정).
- 명시적 test/tmp/bak 파일은 이 4개 폴더에 없음.

---

## 마이그레이션 유의점

1. **admin_level=99 서버측 차단(P0 재현 필수)**: `code/publisher_ps.php`(register 시작에서 `!= "99"` → exit)와 `code/publisher_list.php`(등록 버튼·모달 서버측 조건부 렌더링). 클라이언트 숨김만으로 이관하면 회귀. 서버(라우트 핸들러) 레벨에서 동일 게이트 구현.
2. **정산 정확성**: 리포트 생성/상세/다운로드의 SRP·rate·PG fee·VAT(÷1.1)·revenue share·royalty 계산은 화면 PHP+JS에 흩어져 있음. **PARTNER-SETTLEMENT를 계약 원천으로** 계산식을 옮기고, 라운딩(round)·정수형 캐스팅·통화(currency_converter USD/EUR/JPY) 동작을 legacy와 수치 대조 검증.
3. **퍼블리셔 포털 연계**: `partner_member_*`가 관리하는 `tbl_admin_publisher`(id·pwd `password()`·kr/jp·start_date)는 `_Admin2_` 포털의 로그인/조회범위를 결정. 포털 이관과 필드·해시(PASSWORD()) 계약을 맞출 것.
4. **2 DB 동기 등록**: `code/publisher_ps.php`는 DGKR→lastInsertId→메인 순으로 2 DB에 insert. 정산 리포트/중국통계도 구DB(`dgkrshop`/`$dsn_dgkr`)를 조회. DB 분리·동기 트랜잭션 경계 재현.
5. **저장프로시저 의존**: sales/refund 동기화가 `sp_sales_publisher_insert_batch`·`sp_sales_publisher_refund_batch`에 의존. 프로시저 이관/대체 로직 확보 필요.
6. **중국 지역 하드코딩**: 통계 3화면의 지역-이메일 매핑(산시/안후이/저장/허난 각 1 이메일)이 소스 상수. 이관 시 동일 값 유지(설정 분리는 사용자 확인).
7. **레거시 버그(그대로 이관, 임의 수정 금지)**: `invoice_ps.php`의 `if($mode="modify")`(항상 참) 및 `$ea` 미정의; `partner_member_ps.php`의 `$id` 미정의; `partner_email.php` form action 오류; NSW2 option value="NSW"; report_list.php의 `$partner_member_list->links_html`(미정의) 등. 회귀 방지를 위해 동작 동일성 우선, 개선 필요 시 사용자에게 문의.
8. **엑셀/인쇄 출력**: `.xls`는 HTML+mso 스타일 방식(실 xlsx 아님). `excel_sales_ps.php`는 화면 HTML 재출력, `report_download.php`/`order_china_month.php(mode=excel)`는 자체 렌더. 출력 포맷·파일명 규칙 동일 재현.
9. **SQL 인젝션 표면**: 다수 목록이 검색값을 문자열 보간으로 WHERE에 삽입(partner 목록, invoice 목록, order_china_month add_where 등). 동작 재현 시 파라미터 바인딩 전환은 보안 개선이므로 사용자 판단 하에 진행.
