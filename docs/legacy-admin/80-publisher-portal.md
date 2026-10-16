# 어드민 — 퍼블리셔(배급사) 포털 (_Admin2_)

> **대상**: `pc/_Admin2_/publisher/` (게임 배급사 전용 셀프서비스 리포트 포털, `directgames Partners`).
> **성격**: 내부 어드민 `_Admin_`·`_Admin2_`(운영자용)과 **계정·세션·DB 접근·인증 흐름이 완전히 분리된 별개 시스템**이다. 퍼블리셔(예: 2K, Rockstar, Gearbox)가 로그인해 자사 매출·환불·재고·로열티 리포트를 조회한다.
> 상세 인증 정책은 `docs/ADMIN-AUTHORIZATION.md` 4장(퍼블리셔 포털), 정산·로열티 계산 규칙은 `docs/PARTNER-SETTLEMENT.md`를 단일 진실 원천으로 참조한다. 본 문서는 화면·라우트·데이터소스·스코핑 계약만 정리한다.

이 문서는 `docs/legacy-admin/00~70` 묶음의 후속편이며 동일 템플릿을 따른다.

---

## 개요

### 포털 정체
게임 배급사가 자사 판매 실적을 직접 조회하는 리포트 포털. 판매·환불 원장은 스토어 운영 DB의 배치 프로시저로 `tbl_sales_publisher`에 미리 집계되어 있고, 포털은 이를 세션 퍼블리셔로 스코핑해 조회·차트화·엑셀화한다. 신규 원장 쓰기는 하지 않으며, 쓰기 동작은 (1) 비밀번호 변경, (2) T2 short item code 저장/삭제, (3) 재고 배치 갱신, (4) 리포트 승인 4가지뿐이다.

### KR/JP 이중화
화면이 **KR판**(`main.php`, `title_sales_list.php` …)과 **JP판**(`_jp` 접미)으로 쌍을 이룬다.
- **DB 분리**: KR판은 스토어 메인 DB(`lib/lib.php`의 `DB_*`, `directgames.*`), JP판은 별도 일본 DB(`_engine/dbconn_jp.php`의 `DBJP_HOST/DB/USER/PASSWORD`)를 연결한다. 스키마도 다르다 — KR은 `tbl_goods_item`/`tbl_goods_item_delivery`, JP는 `tbl_goods`/`tbl_goods_stock`을 쓴다.
- **계약기간·코드 분리**: KR은 세션 `publisher`(=`publisher_code`)·`start_date`/`end_date`, JP는 `publisher_jp`(=`publisher_code_jp`)·`start_date_jp`/`end_date_jp`를 쓴다. Take-Two 통합 코드도 KR은 12/14/**321**, JP는 12/14/**317**로 다르다.
- JP 메뉴 노출 조건: 세션 `jp=="Y"` 또는 전체관리자(`admin_level=="99"`).

### T2(Take-Two) 변형
Take-Two 계열 퍼블리셔(12=2K, 14=Rockstar, 321=Gearbox / JP는 317)는 리포트 상세를 전용 템플릿(`report_view_t2.php`, `report_excel_t2.php`)으로 본다. 일반 퍼블리셔 리포트와 달리 **T2 short item code**(퍼블리셔가 직접 매핑하는 자체 상품코드)를 컬럼에 노출한다. `report_list.php`가 세션 퍼블리셔가 12/14/321이면 상세 링크를 `report_view_t2.php`로, 아니면 `report_view.php`로 분기한다.

### 데이터 격리 / 스코핑 모델 (서버 강제)
거의 모든 페이지 상단에 동일 스코핑 블록이 인라인 반복된다:
- `admin_level=="99"` → **전체관리자**: `search_publisher` 파라미터로 임의 퍼블리셔 조회 가능. 미지정 시 세션 `publisher`로 폴백.
- 그 외 → **퍼블리셔 관리자**: `search_publisher`를 무시하고 세션 `publisher`로 **강제 고정**. 단 세션 퍼블리셔가 `12`(Take-Two)면 12/14/321 사이 전환만 허용(그 외 값이 오면 세션값으로 되돌림).
- 조회 WHERE는 항상 이 스코핑된 `search_publisher`(= `publisher_code`/`supplier_code`)로 건다.
- 추가로 **계약기간 클램프**: 조회 기간이 세션 `start_date`~`end_date`(JP는 `_jp`) 밖으로 나가면 계약기간 경계로 잘라낸다(`view_start_date`/`view_end_date`). 계약 시작일 이전 데이터는 볼 수 없다.

### 전월 디폴트
대부분의 조회 화면은 기간 미지정 시 **전월 1일 ~ 전월 말일**을 기본값으로 잡는다(`mktime(1일) → -1 month → Y-m-01 ~ Y-m-t`). 예외: `title_stock_list.php`(재고, 당월 1일~오늘)와 `report.php`(당월). 대시보드 차트의 6개월 막대그래프는 6개월 전~전월.

---

## 인증 · 세션

> 상세는 `ADMIN-AUTHORIZATION.md` 4장 참조. 아래는 요약이며 각 페이지에서 반복 서술하지 않는다.

- **부트스트랩**: 각 페이지가 `$_SERVER["DOCUMENT_ROOT"].'/lib/lib.php'`(어드민 lib가 아니라 **스토어 pc/lib**)를 include. 세션 가드는 페이지 상단 인라인 `if($_SESSION['publisher']['admin_id']==""){ go("./index.php"); }`. (일부 처리 핸들러는 `go("../index.php")`.)
- **로그인**: `login.html`(폼: `managerId`/`managerPw` + reCAPTCHA v2) → `login_proc.php`.
  - reCAPTCHA: siteKey `6LfP…oh17`, secretKey `6LfP…3jZv` **하드코딩**. 서버가 `siteverify` 호출로 검증.
  - IP 화이트리스트(`211.118.10.11`)는 **주석 처리(비활성)**.
  - 계정 조회: 메인 DB `directgames.tbl_admin_publisher`에서 `id=:id and pwd=password(:pwd)` — MySQL `PASSWORD()` **레거시 해시**.
  - 승인 게이트: `flag<>'Y'` → "승인되지 않은 계정입니다". 실패 시 "아이디 또는 비밀번호 오류입니다".
  - 성공 시 세션 `$_SESSION['publisher']` = `{publisher, publisher_jp, start_date, end_date, start_date_jp, end_date_jp, admin_id, admin_name, admin_level, kr, jp}` 저장 + `log_date`/`ip` 갱신.
  - **로그인 시 당월 동기화**: `date('Y-m-01')~오늘` 구간을 `Partner::setPartnerSalesDataBatch`(`call sp_sales_publisher_insert_batch`)·`setPartnerRefundDataBatch`(`call sp_sales_publisher_refund_batch`)로 재집계. **`publisher_code=="12"`(Take-Two)는 12·14·321을 각각 3회씩 동기화** → 로그인 부하 큼(마이그레이션 유의점 참조).
- **로그아웃**: `logout.php` → `$_SESSION=array()` + `session_destroy()` → `index.php`.
- **index.php**: 로그인 폼 뷰(`login.html`과 사실상 동일한 마크업, `login_proc.php`로 POST).

---

## 메뉴 트리 (`inc/left_new.php` 기준)

레이아웃 partial: 상단 `inc/top_new.php`(사용자 드롭다운 — Profile / Sign out), 좌측 `inc/left_new.php`. UI는 AdminLTE(Bootstrap 3.3.7) + morris/chart.js/daterangepicker/datatables 등. 구 partial `inc/top.php`/`inc/left.php`는 일부 구화면(`sales_list.php`, `report.php`, `profile.php`)에서 아직 include됨.

메뉴는 세션 값에 따라 조건부 노출:

**DG KR** (항상)
- Dashboard → `main.php`
- Stock List → `title_stock_list.php`
- Title Sales List → `title_sales_list.php`
- Report List → `report_list.php` *(단 세션 `publisher`가 273/229/22면 숨김)*
- T2 Short item code → `t2_short_item_code.php` *(세션 12/14/321 또는 admin_level 99일 때만)*

**DG JP** (`jp=="Y"` 또는 `admin_level=="99"`일 때만)
- Dashboard → `dashboard_jp.php`
- Stock List → `title_stock_list_jp.php`
- Title Sales List → `title_sales_list_jp.php`
- Report List → `report_list_jp.php` *(세션 `publisher`가 12/14/317/43/94/70/112/136 중 하나 또는 admin 99일 때만)*
- T2 Short item code → `t2_short_item_code_jp.php` *(세션 12/14/317 또는 admin 99일 때만)*

**Console** (세션 `publisher==136` 또는 admin 99일 때만)
- Console → 외부 링크 `http://report.h2int.com/login/login.html` (새 창)

---

## 페이지별 정의 (KR/JP 묶음)

### Dashboard — `main.php` (+ JP: `dashboard_jp.php`)
- **유형**: 대시보드(집계 카드 + 차트).
- **기능**: 상단 4개 카드(Total Units / Total Gross Sales / Total Refund Unit / Total Refund) + 일자별 판매 선그래프(morris) + 결제수단별 판매건수 도넛(chart.js) + 최근 6개월 매출/환불 막대그래프 2종(morris) + Sales/Refund Rank Top 10 테이블. 랭크 하단에 KR/JP 각각의 상세 목록(`sales_list.php`/`refund_list.php`, JP는 `_jp`)으로 More Info 링크.
- **정책**: 전월 디폴트, 계약기간 클램프. daterange 선택은 **최대 90일**(KR 대시보드 JS 검증), 그 외 목록은 제약 완화.
- **데이터소스(KR)**: `tbl_sales_publisher` ⨝ `tbl_goods_item` ⨝ `directgames.tbl_platform`. 판매는 `ord_ymd` 기준, 환불은 `status='9' and canceldt` 기준(특정 product_code 제외: `10001410`/`10001130`/`10000011`). 결제수단은 `settlekind` 코드를 Credit/Account/Mobile로 매핑해 집계. 퍼블리셔 셀렉트 목록은 `directgames.tbl_publisher`(flag='Y', del='0').
- **데이터소스(JP)**: 별도 JP DB, `tbl_goods`(`goods_code`/`goods_nm_en`)·`tbl_platform`(`platform_code`) 사용, `publisher_jp` 스코핑.
- **파라미터**: `search_publisher`, `start_dt`, `end_dt`, `search_game`, `search_date`.
- **연계**: 차트는 ajax(`bar_graph_json.php`, `bar_graph_json2.php`, `line_graph_json.php` / JP는 `_jp`)로 데이터 로드. 도넛은 서버렌더 `$pie_graph_json`.
- **참조**: 로열티/PG 수수료율은 랭크 계산에서만 부분 사용, 정식 산정은 `PARTNER-SETTLEMENT.md`.

### Title Sales List — `title_sales_list.php` (+ JP: `title_sales_list_jp.php`)
- **유형**: 목록(페이지네이션 50/page) + 게임 드롭다운 필터 + 엑셀.
- **기능**: 선택 게임(`search_game`)의 일자별 판매(SRP·수량·매출). **게임을 선택해야만** 쿼리 실행(`if($search_game)`).
- **데이터소스**: `tbl_sales_publisher` ⨝ `tbl_goods_item` ⨝ `tbl_platform`, `ord_ymd` 기준 그룹. 퍼블리셔 셀렉트는 `tbl_partner`(`publisher_code`/`publisher_name`).
- **연계**: 게임 드롭다운은 ajax `publisher_game_list_ajax.php`(JP `_jp`)로 채움. 엑셀은 `title_sales_excel.php`(JP `_jp`)로 POST.
- **폼필드**: `search_publisher`, `search_game`, `start_dt`, `end_dt`, hidden `goods_code`/`publisher`/`game`.

### Sales List — `sales_list.php` (+ JP: `sales_list_jp.php`)
- **유형**: 목록(50/page) + 엑셀. 대시보드 랭크의 "More Info(KR/JP)" 목적지.
- **기능**: 기간 내 상품코드·SRP별 판매 집계(수량·매출). Title Sales List와 달리 게임 선택 없이 전체 상품 나열.
- **데이터소스**: `tbl_sales_publisher` ⨝ `tbl_goods_item` ⨝ `tbl_platform`. daterange 기본 선택은 최근 29일(엄밀 디폴트는 전월).
- **연계**: 엑셀 `sales_list_excel.php`(JP `_jp`). *(주의: 구 partial `inc/top.php` include.)*

### Refund List — `refund_list.php` (+ JP: `refund_list_jp.php`)
- **유형**: 목록(50/page) + 엑셀.
- **기능**: 기간 내 환불 집계(`status='9'`, `canceldt` 기준). **PAYCO 가상계좌 미입금 제외 로직**: 일반 환불(`step<>'99'`, `settlekind<>'PAYCO'`)과 PAYCO 환불(`settlekind='PAYCO'`)을 `union all`로 합산.
- **데이터소스**: `tbl_sales_publisher` ⨝ `tbl_goods_item` ⨝ `tbl_platform`.
- **연계**: 엑셀 `refund_list_excel.php`(JP `_jp`).

### Stock List — `title_stock_list.php` (+ JP: `title_stock_list_jp.php`)
- **유형**: 재고 목록(50/page) + 재고 배치 실행 버튼.
- **기능(KR)**: 자사 상품 재고 조회. "last update" = `tbl_admin_publisher.stock_update`. **Stock Update** 버튼 클릭 시 로딩 오버레이 후 ajax `stock_update_batch.php` 호출, 완료되면 새로고침.
- **데이터소스(KR)**: `tbl_goods_item_delivery a` ⨝ `tbl_goods_item b`(`b.supplier_code`=퍼블리셔, `order_system='1'`, `status='0'`) ⨝ `tbl_platform`. 재고 낮은 순 정렬.
- **데이터소스(JP)**: `tbl_goods_stock a` ⨝ `tbl_goods b`(`asset_id` 조인, `flag in('0','9')`, `del_flag='0'`, `prod_tp in('1','7')`) ⨝ `tbl_platform`. last update = `stock_update_jp`.
- **연계**: `stock_update_batch.php`(JP `_jp`), 엑셀 `stock_list_excel.php`(폼만 존재).

### Report List — `report_list.php` (+ JP: `report_list_jp.php`)
- **유형**: 월/분기 로열티 리포트 목록(50/page) + 연/월/퍼블리셔 필터.
- **기능**: `tbl_report_config` 기준 리포트 목록(연월·퍼블리셔·판매수량·로열티·상태). 상태 `ready`는 퍼블리셔 관리자에게 숨김(admin 99만 전체). `report_term=="T"`면 "Quarterly"(분기), 아니면 "Monthly". 상세 링크는 T2/일반 분기.
- **데이터소스**: `directgames.tbl_report_config a` ⨝ `directgames.tbl_publisher b`. 퍼블리셔 셀렉트 및 `report_term`은 `tbl_partner`.
- **상세 링크 분기**: 세션 12/14/321 → `report_view_t2.php`, 그 외 → `report_view.php`.
- **참조**: 로열티/환율/수수료 계약은 `PARTNER-SETTLEMENT.md`.

### Report View — `report_view.php` (+ 변형: `report_view_t2.php`, JP: `report_view_jp.php`, `report_view_jp_t2.php`)
- **유형**: 리포트 상세(로열티 인보이스 뷰) + Approval + 엑셀 다운로드.
- **기능**: `?idx=`로 특정 리포트 조회. `tbl_report_config`(환율·수수료율·로열티·상태) + `tbl_report`(상품별 집계: 판매수량·순매출·수익배분)를 보여줌. 상태가 `notice`면 **Approval** 버튼 노출 → ajax `report_ps.php`(mode=approval)로 승인. 승인 완료면 승인일 표시. **Download Excel** → `report_excel.php`(T2는 `report_excel_t2.php`)로 POST.
- **T2 차이**: `report_view_t2.php`는 `tbl_report_t2code.short_item_code` 컬럼을 조인·노출(퍼블리셔 자체 상품코드). 조인 기준이 platform 중심으로 다름.
- **데이터소스**: `directgames.tbl_report_config`, `directgames.tbl_report`(`parent_idx=idx`), `tbl_goods_item`, `tbl_platform`, (T2) `tbl_report_t2code`.

### Report 승인 처리 — `report_ps.php`
- **유형**: 처리 핸들러(뷰 없음).
- **기능**: POST `mode=approval`, `idx` 수신 → `tbl_report_config`에 `approval_date=now(), status='approval'` UPDATE. 승인 알림 메일(`DirectSendMail::sendMailPublisher`)을 `mojh@h2int.com,directgames@h2int.com`으로 발송(제목 euc-kr 인코딩).

### Report (구 인보이스) — `report.php`
- **유형**: 구형 인보이스 화면(전체관리자 전용, `admin_level<>"99"`이면 `main.php`로 리다이렉트).
- **특이**: 다른 페이지와 달리 `session_start()`+`config.php`+`_engine/dbconn.php`를 직접 include(공통 lib 부트스트랩 미사용). 원장을 `tbl_order`/`tbl_order_item`/`tbl_goods`에서 **실시간 계산**(PG 수수료·VAT·수익배분), 로열티 환율 `0.0009` 하드코딩. `inc/left.php`(구 메뉴) include. **구 메뉴에서만 도달 가능 → 사실상 레거시/미노출**(현행 `left_new.php`엔 링크 없음).
- **참조**: 산식은 `PARTNER-SETTLEMENT.md`.

### T2 Short item code — `t2_short_item_code.php` (+ JP: `t2_short_item_code_jp.php`)
- **유형**: 매핑 관리 목록(50/page) + 인라인 저장/삭제 + 상품명 검색.
- **기능**: Take-Two 리포트 대상 상품별로 퍼블리셔가 **short item code**를 입력·저장·삭제. `is_t2_code` 플래그(코드 없으면 0)로 미매핑 우선 정렬. Publisher/Platform 코드 → 라벨 하드코딩(12=2K/14=Rockstar Games/321=Gearbox Publishing; platform 1=Steam/34=Epic/27=Rockstar Warehouse/35=Rockstar Games Launcher).
- **데이터소스**: `directgames.tbl_report`(publisher_code in 12/14/321 distinct 상품) LEFT JOIN `directgames.tbl_report_t2code`.
- **연계**: 저장/삭제 ajax → `t2_short_item_code_ps.php`(JP `_ps_jp`). 엑셀 버튼은 폼만 존재(`t2_short_item_excel.php`는 **0바이트 미구현**).

### T2 code 저장 처리 — `t2_short_item_code_ps.php` (+ JP: `t2_short_item_code_ps_jp.php`)
- **유형**: 처리 핸들러(뷰 없음).
- **기능**: POST `mode`(save/delete), `goods_code`, `short_item_code`.
  - `save`: `directgames.tbl_report_t2code`에 `INSERT … ON DUPLICATE KEY UPDATE short_item_code`.
  - `delete`: `product_code`로 DELETE.

### Profile — `profile.php` / `profile_proc.php`
- **유형**: 내정보(비밀번호 변경 전용).
- **기능**: ID/Name은 읽기전용 표시, 비밀번호만 변경. JS 검증(6~12자, 소문자+숫자+특수문자 포함, 공백 불가, 확인일치). `inc/left.php`(구 메뉴) include.
- **처리(`profile_proc.php`)**: `tbl_admin_publisher`에 `pwd=password(:pwd)`(레거시 해시), `ip`, `re_pwd_date=now()` UPDATE → `main.php`.

### Stock 배치 처리 — `stock_update_batch.php` (+ JP: `stock_update_batch_jp.php`)
- **유형**: 처리 핸들러(ajax 대상, 뷰 없음).
- **기능**: `Asset::runAssetSoldOutBatch($thr)`(임계치 `thr`, Stock List에서 `1000` 전달)로 외부 자산 재고를 조회 → `directgames.tbl_goods_stock`에 `INSERT … ON DUPLICATE KEY UPDATE stock,batch_date`. 재고 0이면 `tbl_goods_soldout_log` 기록. 완료 후 `tbl_admin_publisher.stock_update=now()` 갱신.

---

## 보조 리소스 (차트 json · 엑셀 · ajax 매핑표)

| 리소스 | 유형 | 부모 화면 | 역할 / 데이터 |
|--------|------|-----------|---------------|
| `bar_graph_json.php` / `_jp` | ajax(JSON) | Dashboard | 최근 6개월 월별 총매출/수량 막대(morris). `target=gross_sales`면 매출, 아니면 수량. |
| `bar_graph_json2.php` / `_jp` | ajax(JSON) | Dashboard | 최근 6개월 월별 환불 막대. |
| `line_graph_json.php` / `_jp` | ajax(JSON) | Dashboard | 기간 내 일자별 순매출(매출−환불) 선그래프. 없는 날짜는 0 채움. |
| `publisher_game_list_ajax.php` / `_jp` | ajax(HTML `<option>`) | Title Sales List | 세션/선택 퍼블리셔의 판매중 게임 목록(`tbl_goods_item`, `status='0'`)을 옵션으로 반환. |
| `title_sales_excel.php` / `_jp` | 엑셀(.xls) | Title Sales List | 일자·상품별 판매. 퍼블리셔 30/322면 BASE SRP·할인율(Rate) 컬럼 추가. |
| `sales_list_excel.php` / `_jp` | 엑셀 | Sales List / Report List | 판매 원장 다운로드. |
| `refund_list_excel.php` / `_jp` | 엑셀 | Refund List | 환불 원장 다운로드. |
| `report_excel.php` / `_jp` / `_t2` / `_jp_t2` | 엑셀 | Report View | 리포트 상세 엑셀. T2 변형은 short item code 포함. |
| `stock_list_excel.php` | 엑셀 | Stock List | 폼만 존재(파일 미확인). |

> 모든 보조 리소스도 페이지 상단 세션 가드 + 동일 스코핑 블록을 반복 적용한다(퍼블리셔 격리는 서버에서 강제).

---

## 변형 / 구메뉴 / 비활성 파일

| 파일 | 상태 | 비고 |
|------|------|------|
| `report.php` | 구화면(사실상 미노출) | 전체관리자 전용 실시간 인보이스. `left_new.php`에 링크 없음, `inc/left.php`(구 메뉴)에서만 도달. |
| `campaings.php` | **비활성/미완성** | 쿼리 `$query=""` 빈 상태. `left.php`에서 admin 99에게만, 그나마 주석 처리. `left_new.php`엔 없음. |
| `exchange_rate.php` | **부재** | `left.php`에 주석으로만 남음, 실제 파일 없음. |
| `t2_short_item_excel.php` | **미구현** | 0바이트 스텁. |
| `inc/left.php` / `inc/top.php` | 구 partial | 일부 구화면(`sales_list`, `report`, `profile`)이 아직 include. 현행 표준은 `_new` 버전. |
| `_t2` 계열 (`report_view_t2`, `report_excel_t2`, `_jp_t2`) | 활성 | Take-Two 전용 리포트 템플릿(short item code 노출). |
| `pages/`, `plugins/`, `dist/`, `bootstrap/`, `documentation/`, `build/` | 벤더/템플릿 | AdminLTE 원본 데모·에셋. 문서화 대상 아님. |

---

## 마이그레이션 유의점

1. **데이터 격리는 서버에서 강제되어야 한다.** 퍼블리셔 관리자는 `search_publisher`를 조작해도 세션 `publisher`로 되돌려진다(Take-Two 12/14/321 예외 포함). 이 스코핑 로직이 거의 모든 페이지·ajax·엑셀에 인라인 반복되므로, Next로 옮길 때 **공통 스코핑 가드(미들웨어/서버함수)**로 1회 구현하고 전 엔드포인트에 강제한다. 계약기간 클램프(`start_date~end_date`, JP는 `_jp`)도 동일하게 서버 강제.
2. **KR/JP는 물리적으로 다른 DB**다(`DB_*` vs `DBJP_*`). 스키마·컬럼명·테이블도 다름(`tbl_goods_item`/`tbl_goods_item_delivery` vs `tbl_goods`/`tbl_goods_stock`, `product_code` vs `goods_code` 등). 단일 코드 공유가 아니라 커넥션·쿼리 매핑을 분기해야 한다.
3. **T2 변형·JP 변형은 부모 화면 로직의 중복 복제**다(코드 12/14/**321** vs 12/14/**317**, short item code 컬럼 유무만 차이). 옮길 때 한 컴포넌트 + 변형 플래그로 합치되, **동작 동일성**(정렬·필터·라벨 하드코딩) 우선.
4. **reCAPTCHA·시크릿 하드코딩**: siteKey/secretKey가 `login.html`/`login_proc.php`에 그대로 박혀 있다. IP 화이트리스트는 주석 비활성. 이관 시 시크릿은 환경변수로 분리하되 **검증 동작(성공 시에만 로그인 진행)은 동일**하게.
5. **레거시 비밀번호 해시**: 로그인·비밀번호변경 모두 MySQL `PASSWORD()` 사용. 이관 후에도 기존 계정 인증을 유지하려면 이 해시 검증을 재현하거나 마이그레이션 시점에 재해싱 전략을 별도 결정(사용자 확인 필요).
6. **로그인 시 동기화 부하**: 로그인마다 당월치를 `sp_sales_publisher_insert_batch`/`_refund_batch` 프로시저로 재집계한다. Take-Two(코드 12) 계정은 12·14·321 3세트를 각각 sales+refund 6회 호출 → 로그인 지연 가능. 이관 시 이 배치를 로그인 경로에 그대로 둘지, 비동기/스케줄로 분리할지 결정(동작 변경이면 사용자 확인).
7. **외부 Console 연계**: `publisher==136`/admin 99에게만 노출되는 `http://report.h2int.com/login/login.html` 외부 링크. 포털 외부 시스템이므로 그대로 링크 이관.
8. **엑셀은 서버렌더 HTML-as-xls**(`Content-Type: application/vnd.ms-excel`) 방식. 인코딩·파일명 규칙(`report_{publisher} ({start}~{end}).xls`)과 조건부 컬럼(퍼블리셔 30/322 BASE SRP)까지 동일 재현.
9. **미완성/비활성 화면**(`campaings.php` 빈 쿼리, `exchange_rate.php` 부재, `t2_short_item_excel.php` 0바이트, `report.php` 구메뉴)은 이관 대상에서 제외 후보. 실제 트래픽·요구를 사용자와 확인.
