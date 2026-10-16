# 어드민 — 프로모션 · 이벤트

> 대상: `pc/_Admin_/promotion/` (27 파일 + `promotion/tmp/`), `pc/_Admin_/event/` (15 파일)
> 사이드바: `inc/sidebar_promotion.php`, `inc/sidebar_event.php`
> 공통 인프라(세션가드·2개 DB·레이아웃·파일유형 규칙)는 별도 파악분이므로 반복하지 않는다.
> 도메인 규칙(프로모션 유형 체계·구매이벤트·추첨 비즈니스 룰)의 단일 진실 원천은
> `../legacy-project/docs/PROMOTION-EVENT-OPS.md` 및 `docs/BUSINESS-RULES.md`. 본 문서는 **어드민 화면의 설정 항목·검증·노출제어·데이터소스**만 문서화한다.

---

## 개요

### 프로모션 유형 체계 (어드민 화면 기준)

어드민 프로모션 메뉴는 서로 **독립된 4개 저장소**로 나뉜다 (각각 별도 테이블·별도 등록 방식).

| 화면 그룹 | 저장 테이블 | 등록 방식 | 성격 |
|-----------|-------------|-----------|------|
| 할인 프로모션 (승인대기/진행중/진행예정/종료) | `tbl_promotion_schedule` | 엑셀/CSV 파일 업로드 | 옵션상품 단위 할인율·기간을 대량 등록. 상태는 기간(promotion_start/end)과 `confirm` 플래그로 파생 |
| 주말특가 프로모션 | `tbl_promotion_weekend` | 폼 직접 입력 | 추천게임 4 + 인기게임 10 배치 큐레이션 페이지 |
| 대규모 프로모션 | `tbl_promotion_season` | 폼 직접 입력 | 배너·추천·인기·최대할인·가격대·추가적립·공지 배치 큐레이션 |
| 타임딜 | `tbl_promotion_schedule` (`promotion_gubun='31'`) | 등록 화면 없음(0B) | 사이드바에 `[X]` 라벨 — 비활성 |
| 오프라인 쿠폰 | `tbl_offline_coupon` / `tbl_offline_paper` (dgkr DB) | 폼 + 코드 자동생성 | 종이/오프라인 배포용 코드 발급·사용현황 |

> 주의: 할인 프로모션의 "진행중/진행예정/종료"는 **저장된 상태값이 아니라** 각 목록 페이지가 SQL WHERE 로 기간을 걸러 파생한다. 승인대기만 `confirm='N'` 플래그 기반.

`AdminPromotion::getPromotionLabel($promotion_type)` (line 154~)에 유형 라벨 매핑이 존재(문서 도메인 룰 참조). 사이드바에서 비활성/주석 처리된 메뉴: 할인 프로모션 등록(`promotion_register.php`), 프로모션 동기화(`promotion_list.php`), 쿠폰 관리(`coupon_*` — 파일 부재), 타임딜 2종.

### 이벤트 개념

이벤트는 두 계열로 나뉜다.

1. **이벤트 게시판** (`tbl_event`, 메인 DB) — 배너·마크다운 콘텐츠 + 이벤트 대상 옵션상품(`tbl_event_goods`) 묶음. `event_gubun`(구분)으로 예약구매/네이버페이/토스/포인트/당첨자발표/기타를 분류. 스토어프론트 이벤트 상세 노출용.
2. **추첨/사은품/구매 이벤트** (`tbl_event_lottery` 계열, **dgkr DB**) — 이벤트별 참여자·당첨자·사은품 발송·낙첨자 통계. 등록 화면은 사실상 비활성(주석 처리)이고, 실제 운영은 특정 idx 를 하드코딩한 전용 목록 화면(`event_fm26`, `event_list_202505`, `event_list_20250626`)으로 이루어진다.
3. **추가 포인트 지급 이벤트** (`tbl_event_point` 계열, 메인 DB) — 옵션상품별 구매 시 추가 포인트 적립(정액/정률). 조회 전용.

> "구매이벤트/추첨"의 상세 계약(대상금액·당첨확률·예산 산정)은 도메인 문서 참조. 여기서는 화면이 노출하는 컬럼·필터만 기술.

---

## 프로모션

### 메뉴 트리 (sidebar_promotion.php)

- **프로모션 대시보드** → `promotion/dashboard_promotion.php` (topbar 진입점)
- **할인 프로모션 관리**
  - 승인대기 할인 프로모션 → `promotion_ready.php`
  - 진행중인 할인 프로모션 → `promotion_ing.php`
  - 진행예정 할인 프로모션 → `promotion_upcoming.php`
  - 종료된 할인 프로모션 → `promotion_end.php`
  - (주석) 할인 프로모션 등록 → `promotion_register.php`
  - (주석) 프로모션 동기화 → `promotion_list.php`
- **주말특가 프로모션 관리**
  - 주말특가 프로모션 목록 → `promotion_weekend.php`
  - 주말특가 프로모션 등록 → `promotion_weekend_register.php`
- **대규모 프로모션 관리**
  - 대규모 프로모션 목록 → `promotion_season.php`
  - 대규모 프로모션 등록 → `promotion_season_register.php`
- **타임딜 관리** (전부 `[X]` 비활성)
  - `[X]` 타임딜 현황 → `timedeal_list.php`
  - `[X]` 타임딜 등록 → `timedeal_register.php` (0B)
- **(주석) 쿠폰 관리** → `coupon_config.php` / `coupon_list.php` / `coupon_register.php` (파일 부재)
- **오프라인 쿠폰 관리**
  - 오프라인 쿠폰 리스트 → `offline_coupon_list.php`
  - 오프라인 쿠폰 등록 → `offline_coupon_register.php`
  - (숨김) 오프라인 쿠폰 상세 → `offline_coupon_view.php`

메뉴에 없지만 파일로 존재: `promotion_group.php`, `promotion_group_upcoming.php`, `promotion_sync.php`, `promotion_ready_download.php`, `offline_coupon_download.php`, `offline_coupon_ps.php`, `promotion_ps.php`, `promotion_weekend_ps.php`, `promotion_season_ps.php`, `promotion_weekend_view.php`, `promotion_season_view.php`.

### 페이지별 정의

#### 프로모션 대시보드 — `promotion/dashboard_promotion.php`
- 유형: 대시보드(빈 스켈레톤)
- 기능: 연도 datepicker(minViewMode years) + apexcharts/jvectormap 자산만 로드. **실제 데이터 바인딩 없음**(주석만 `//진행중인 할인 프로모션`). topbar 진입점이지만 내용은 빈 껍데기.
- 데이터소스: 없음 (PDO 연결만 생성)
- 마이그레이션: 껍데기 그대로 이관하거나 진입 리다이렉트로 처리 검토.

#### 승인대기 할인 프로모션 — `promotion/promotion_ready.php` + `promotion_ps.php`
- 유형: 목록 + 파일업로드 폼 + AJAX 처리
- 기능:
  - 상단: 엑셀/CSV 업로드 폼 (`mode=file_register` → `promotion_ps.php`).
  - 하단: `confirm='N'` 인 대기 프로모션 목록. 버튼 3종 — 승인처리(전체), 전체삭제, 승인대기 다운로드.
  - 행별 삭제 버튼(AJAX `mode=delete&idx`).
- 정책·규칙:
  - 업로드 확장자 검증: MIME `type` 을 `/` 로 분해해 뒷부분이 `vnd.openxmlformats-...sheet`(xlsx) 또는 `csv` 만 허용, 그 외 "엑셀파일 확장자(xls,xlsx,csv)외에는 사용이 불가합니다." 후 exit.
  - 업로드 파일은 `promotion/tmp/` 에 `YmdHis.확장자` 로 저장 후 PHPExcel(`PHPExcel-1.8`)로 파싱.
  - 파싱: 2행부터 A~J 컬럼 고정 매핑 → `tbl_promotion_schedule` 에 `ON DUPLICATE KEY UPDATE`. 컬럼: A 시작일, B 종료일, C 옵션상품코드, D 옵션상품명, E 퍼블리셔 SRP, F 승인 SRP, G 퍼블리셔 승인 할인율, H DG 소비자가, I DG 할인판매가, J DGKR 할인율.
  - 할인율 저장 시 `round($x*100)`(엑셀 소수 → 정수 %). 퍼블리셔 코드는 `AdminGoods::getGoodsItemPublisher(product_code)` 로 조회 보강.
  - 승인처리: `update ... set confirm='Y' where confirm='N'` (선택 아님, 전체). 전체삭제: `delete ... where confirm='N'`.
- 데이터소스: `AdminPromotion::getPromotionReady()` → `tbl_promotion_schedule a inner join tbl_goods_item b`, `where a.confirm='N'`, 30개/페이지. `AdminGoods::getPublisherName()`.
- 폼필드: `promotion_file`(required), hidden `mode`.
- 연계: `promotion_ready_download.php`(POST, XLS 다운로드), `promotion_ps.php`.
- 참조: PROMOTION-EVENT-OPS(할인 프로모션 승인 플로우).

#### 진행중인 할인 프로모션 — `promotion/promotion_ing.php`
- 유형: 목록 + 검색필터
- 기능: 검색(옵션상품명/코드 + 승인여부 Y/N), 행별 삭제(AJAX).
- 정책: WHERE `timestampdiff(second,now(),promotion_start)<0 and timestampdiff(...,promotion_end)>=0` (현재가 기간 내). `search_confirm` → `a.confirm`. 정렬 `promotion_start desc`.
- 데이터소스: `AdminPromotion::getPromotionIng()` → 동일 join. (주의: 클래스 SQL 은 `where 1=1 + add_where`, 기간필터는 **페이지 쪽 `$where`** 에서 주입.)
- 참조: 승인대기와 동일 테이블.

#### 진행예정 할인 프로모션 — `promotion/promotion_upcoming.php`
- 유형: 목록 + 검색필터
- 정책: 클래스 SQL 자체가 `a.promotion_start>=now and a.promotion_end>=now`. 정렬 `promotion_start asc`. 컬럼에 프로모션 SRP·할인률·판매가 노출.
- 데이터소스: `AdminPromotion::getPromotionListUpcoming()`.

#### 종료된 할인 프로모션 — `promotion/promotion_end.php`
- 유형: 목록 + 검색필터 (삭제/처리 버튼 없음, 읽기전용)
- 정책: 페이지 `$where` 에 `a.promotion_start<now and a.promotion_end<now`.
- 데이터소스: `AdminPromotion::getPromotionListEnd()` (클래스는 `where 1=1`, 기간은 페이지 주입).

> 위 4개 목록은 표 구조·검색필터가 거의 동일. 차이는 WHERE 기간 조건과 노출 컬럼(승인SRP 표기 유무), 처리 버튼 유무뿐.

#### (비활성) 할인 프로모션 등록 — `promotion/promotion_register.php`
- 유형: 폼(파일업로드) — `promotion_ready.php` 상단 폼과 동일하게 `promotion_ps.php?mode=file_register` 로 전송. 사이드바 주석 처리됨.

#### (비활성) 프로모션 동기화 — `promotion/promotion_list.php` + `promotion_sync.php`
- 유형: 목록 + AJAX 동기화
- 기능: dgkr `getPromotionSchedule` 목록에서 "동기화" 버튼 → `promotion_sync.php?event_no&start_dt&end_dt`.
- `promotion_sync.php`: dgkr `tbl_event_goods` 의 상품을 메인 `tbl_promotion_schedule` 로 복사 삽입(`promotion_type='플래시'`, `promotion_gubun='22'`, `ON DUPLICATE KEY UPDATE`). `$consumer_price`/`$publisher_code` 미정의로 NULL 삽입되는 부분 존재(레거시 상태 그대로 이관).
- 사이드바 주석 처리됨.

#### 프로모션 다운로드 — `promotion/promotion_ready_download.php`
- 유형: `_excel` (application/vnd.ms-excel, `.xls` HTML 테이블 방식)
- 정책: `confirm='N'` 만, `tbl_promotion_schedule a join tbl_goods_item b join tbl_publisher c`. POST 로 호출.

#### 주말특가 프로모션 목록 — `promotion/promotion_weekend.php`
- 유형: 목록 + 검색필터
- 기능: 이름 검색 + 노출여부(`is_view`) 필터. 행별로 추천게임/인기게임을 `|` 분해 후 `AdminGoods::getGoodsOptionSearch()` 로 상품코드·명·게임타입 렌더. 수정 링크 → `promotion_weekend_register.php?mode=modify&idx`.
- 정책: 정렬 `promotion_week_start desc`. 기간은 unix timestamp 저장 → `date('Y-m-d H:i:s',...)` 표시.
- 데이터소스: `AdminPromotion::getPromotionWeekend()` → `tbl_promotion_weekend`.
- 참조: 상세보기 `promotion_weekend_view.php`.

#### 주말특가 프로모션 등록/수정 — `promotion/promotion_weekend_register.php` + `promotion_weekend_ps.php`
- 유형: 폼 + POST 처리 (`idx>0` 이면 modify)
- 폼필드(전부 required 표시):
  - `promotion_week_name`(이름), `promotion_week_start`/`_end`(input-mask `0000-00-00 00:00:00`), `promotion_week_banner_link`(배너 링크 URL)
  - 추천게임 4개: `promotion_week_recommand_1~4` (옵션상품코드)
  - 인기게임 10개: `promotion_week_best_1~10`
  - `is_view`(노출여부 Y/N radio)
  - 고정 표시: 주말 프로모션 URL `/promotion/promotion_weekend.html`
- 처리(`_ps`): 추천/인기 게임을 `|` 로 join 한 단일 문자열로 저장. 날짜는 `strtotime()` → int. register=insert / modify=update. delete case 는 빈 구현.
- 데이터소스: `tbl_promotion_weekend`.

#### 주말특가 프로모션 상세보기 — `promotion/promotion_weekend_view.php`
- 유형: 상세(스토어프론트 프리뷰 렌더)
- 기능: 저장된 추천/인기 상품코드로 `AdminGoods::getGoodsOptionTitleInfo()` + `getGoodsItemDetail()` 조회하여 실제 카드(할인율·판매가·에디션/번들/예약/특전 배지, game/dlc/bundle 별 view_url) 렌더. 인기게임은 앞 4개(대형카드)/나머지(소형카드)로 분리.
- 노출제어: `promotion['sale_price']>0` 이면 프로모션가/할인율/`bg-danger` 라벨 적용, 아니면 `bg-primary`.
- 데이터소스: `tbl_promotion_weekend` + AdminGoods 상세 조회. 배너 이미지 하드코딩(`image.directg.net/U84s2DngyK`).

#### 대규모 프로모션 목록 — `promotion/promotion_season.php`
- 유형: 목록(카드형, 페이지네이션)
- 기능: 프로모션별 카드에 PC/모바일 배너, 추천 및 특집, 역대 최대할인, 추가 포인트 적립, 인기게임, 5천원 미만, 1만원 미만 각 상품코드 그룹을 `|` 분해 후 `getGoodsOptionSearch()` 로 렌더. 공지(`notice_view='Y'`) 시 공지 제목·버튼 노출. 수정 링크.
- 데이터소스: `AdminPromotion::getPromotionSeason()` → `tbl_promotion_season`. 이름검색 `promotion_week_name`(주의: 컬럼명이 season 목록인데 필터는 week 명 사용 — 레거시 그대로), 노출 `is_view`.

#### 대규모 프로모션 등록/수정 — `promotion/promotion_season_register.php` + `promotion_season_ps.php`
- 유형: 폼(대형) + POST 처리
- 폼필드(전부 required 표시):
  - `promotion_season_name`, `promotion_season_start`/`_end`(input-mask)
  - 배너: `promotion_season_banner_pc`(1296×500), `_banner_mobile`(720×720), `_banner_link`, `_recommand_banner`(640×573)
  - 추천게임 4: `promotion_season_recommand_1~4`
  - 인기게임 10: `promotion_season_best_1~10`
  - 역대 최대할인 3 + 링크: `promotion_max_discount_1~3`, `promotion_max_discount_link`
  - 추가 포인트 적립 3 + 링크: `promotion_add_repay_1~3`, `promotion_add_repay_link`
  - 5천원 미만 5: `promotion_price_5000_1~5` / 1만원 미만 5: `promotion_price_10000_1~5`
  - `is_view`, 공지: `notice_title`, `notice_btn_title`, `notice_btn_url`, `notice_view`
- 처리(`_ps`): 각 그룹을 `|` join 후 저장. 날짜 `strtotime()`. **주의(레거시 버그)**: register 쿼리에 `is_view=:is_view,,notice_title=...` — 콤마 2개(`,,`) 존재로 register INSERT 는 SQL 오류 가능성. modify UPDATE 는 정상. 동작 동일성 원칙상 그대로 이관하되 마이그레이션 시 실제 동작 확인 필요(추정: register 는 실사용 안 되고 modify 위주 운영).
- 데이터소스: `tbl_promotion_season`.

#### 대규모 프로모션 상세보기 — `promotion/promotion_season_view.php`
- 유형: 상세(35KB, 스토어프론트 프리뷰) — 미정독. `idx` 로 `tbl_promotion_season` 조회 후 각 상품 그룹을 실제 카드로 렌더하는 대형 프리뷰로 추정(목록 카드 구조의 확장판). 마이그레이션 시 정독 필요.

#### (비활성) 할인 프로모션 그룹 — `promotion/promotion_group.php`, `promotion_group_upcoming.php`
- 유형: 목록(카드, 프리뷰) — 사이드바에 없음.
- 기능: 퍼블리셔별 프로모션 그룹(`getPromotionGroupList`/`getPromotionGroupUpcoming`)을 조회, 그룹 헤더 + 상품 카드(할인율·소비자가·판매가) 렌더. upcoming 은 `...ScheduleGameType` 사용(게임타입 구분).
- 데이터소스: `tbl_promotion_schedule` 기반 그룹 집계.

#### (비활성) 타임딜 현황 — `promotion/timedeal_list.php`
- 유형: 목록. 사이드바 `[X]`.
- 특이사항: 이 파일만 `$document_root="/backend"` + `/backend/conf/conf.php` + `/backend/lib/lib.php` 를 include(다른 경로 규약). `promotion_gubun='31'` 필터, `Admin::getPromotionList()` 사용. 주차 계산 `Admin::getWeek()`.
- `timedeal_register.php` 는 0B(빈 파일).

#### 오프라인 쿠폰 리스트 — `promotion/offline_coupon_list.php`
- 유형: 목록 + 검색필터 (**dgkr DB**)
- 기능: 쿠폰명/사용처 검색. 컬럼: 쿠폰명·등록일·사용처·사용기간(만료 시 빨강)·적립금·발급유형·발급수·사용수·발급상태·[발급내역관리]·[코드 다운로드]·[수정].
- 코드류 라벨: `code_type` = DOWNLOAD(다운로드)/STATIC(지정코드)/DYNAMIC(난수코드). `status` 0 발급대기·1 발급중·2 일시정지·3 발급종료.
- 데이터소스: `AdminPromotion::getOfflineCouponList()` → `tbl_offline_coupon toc`, 20개/페이지. 사용수 `getOfflineCouponUseCount(sno)`.
- 연계: `offline_coupon_view.php`(사용현황), `offline_coupon_download.php`(코드 txt), `offline_coupon_register.php?mode=update`. 목록 복귀용 `param`을 base64+urlencode 로 전달.

#### 오프라인 쿠폰 등록/수정 — `promotion/offline_coupon_register.php` + `offline_coupon_ps.php`
- 유형: 폼 + POST 처리 (dgkr DB). `mode=update` 시 수정.
- 폼필드:
  - 기본: `coupon_name`, `reason`(쿠폰 사유), `issueLimitCnt`(발행 수량), `sdate`/`edate`(datetime-local), `partner`(사용처)
  - 발급: `code_type`(STATIC 지정코드 / DYNAMIC 난수코드 radio, 수정 시 disabled), `promotion_code`(STATIC 일 때만 required — JS 토글), `issuePerPersonLimitYn`(발급무제한 Y / 발급제한 "")
  - 발급제한 필드(제한 선택 시 표시): `issuePerPersonLimitCnt`(기간전체), `dailyIssuePerPersonLimitCnt`(1일)
  - 포인트: `coupon_price`(원)
- 처리(`_ps`):
  - register: `INSERT ... currency='원', status=1, regdt=NOW()`. 삽입 후 `lastInsertId` 로 `AdminPromotion::setPaperCoupon(sno, issueLimitCnt, code_type, promotion_code)` 호출 → **발행수량만큼 실제 쿠폰번호 생성/발급**.
    - `setPaperCoupon`: STATIC → 지정코드 1건을 `tbl_offline_paper` 에 insert(반복문 주석 처리되어 사실상 1건). DYNAMIC → `makeCouponCodeV2(ea)` 로 난수 코드 ea개 생성 후 각각 insert. DOWNLOAD → 미구현.
  - update: 기존 행 UPDATE(코드 재발급 없음).
  - 완료 후 `go($_SERVER['HTTP_REFERER'])`, alert.
- 데이터소스: `tbl_offline_coupon`, `tbl_offline_paper`.

#### 오프라인 쿠폰 상세(사용현황) — `promotion/offline_coupon_view.php`
- 유형: 상세 + 목록 (dgkr DB). 사이드바 숨김(`d-none`).
- 기능: 쿠폰 기본정보 카드 + 사용현황 목록(회원아이디 검색). 컬럼: 번호·쿠폰번호·아이디·사용일자.
- 데이터소스: `getOfflineCouponInfo(sno)` + `getCouponCodeUsedList()` (`top.coupon_sno=sno and top.flag='Y'`, `tod.m_id` 검색).

#### 오프라인 쿠폰 코드 다운로드 — `promotion/offline_coupon_download.php`
- 유형: `_excel`류(text/plain txt 다운로드). `getCouponCodeList(sno)` 의 `number` 를 줄바꿈으로 이어 `쿠폰명_쿠폰코드_Ymd.txt` 반환.

---

## 이벤트

### 메뉴 트리 (sidebar_event.php)

- **이벤트 게시판 관리**
  - 이벤트 게시판 목록 → `event/event_board_list.php` (topbar 진입점)
  - 이벤트 게시판 작성 → `event_board_register.php`
- **이벤트 관리** (추첨/사은품 계열)
  - 이벤트 현황 → `event_lottery_list.php`
  - (숨김) 이벤트 현황 상세 → `event_lottery_success.php`
  - 2025 가정의달 이벤트 → `event_list_202505.php`
  - 2025 여름 프로모션 이벤트 → `event_list_20250626.php`
  - (주석) 추첨 이벤트 등록 → `event_lottery_register.php`
- **구매 이벤트 관리**
  - 풋볼 매니저 26 예약 구매 → `event_fm26.php`
  - (주석) 추첨 이벤트 등록
- **사은품 관리**
  - 사은품 이벤트 진행이력 → `event_gift_list.php`
  - (숨김) 진행이력 상세 → `event_gift_member.php`
  - 사은품 발송 현황 → `event_gift_request.php`
  - (주석) `[X]` 사은품 발송완료 현황 → `event_gift_end.php` (0B)
- **추가 포인트 지급 관리**
  - 포인트 지급 이벤트 → `event_point_list.php`

메뉴에 없지만 파일: `event_board_modify.php`, `event_board_ps.php`, `event_lottery_fail.php`(코드에서 링크되나 파일 미확인).

### 페이지별 정의

#### 이벤트 게시판 목록 — `event/event_board_list.php`
- 유형: 목록(카드형) + 필터 (메인 DB)
- 기능: 이벤트별 카드(노출기간·노출여부·프로모션 노출여부 배지, 배너 이미지+링크, 구분 배지, 제목, Parsedown 렌더 본문). 우측 사이드에 `is_view` 필터 select(onchange 자동 submit). 등록 버튼, 수정 링크(`event_board_modify.php?idx`).
- 정책: `event_gubun` 라벨 맵 — 1 예약구매·2 네이버페이 즉시할인·3 토스 즉시할인·4 네이버페이 포인트 쿠폰·5 당첨자발표·6 DGKR 포인트. `event_gubun<>'5'` 인 경우에만 "이벤트 통계" 링크(`../statistics/event/event_order_count.php`) 노출. 정렬 `is_view desc,start_date desc`.
- 데이터소스: `AdminBoard::getEventList()` → `tbl_event`. `Parsedown` 마크다운 렌더.
- 연계: 통계, 수정.

#### 이벤트 게시판 작성 — `event/event_board_register.php` + `event_board_ps.php`
- 유형: 폼 + 다목적 POST/AJAX 처리 (메인 DB). SimpleMDE 마크다운 에디터 사용.
- 폼필드:
  - `gubun`(구분 radio: 1/2/3/4/6/5/9=기타), `start_date`/`end_date`(이벤트 기간)
  - `subject`(제목), `contents`(SimpleMDE), `event_notes`(유의사항 SimpleMDE)
  - `event_banner`(배너 URL, required), `event_link_target`(_self/_blank), `event_link_url`(도메인 제외, required)
  - `is_view`(노출 Y/N), `show_promotion`(프로모션 노출 Y/N)
- 처리(`event_board_ps.php`) — `mode` 스위치:
  - `register`/`modify`: `tbl_event` insert/update. contents·event_notes 는 `<`,`>`,`&` 를 엔티티로 치환 저장. 날짜 `strtotime()`. admin_id 하드코딩 `admin@h2int.com`.
  - `delete`: `tbl_event` 삭제.
  - `goods_option_search`(AJAX): `tbl_goods_item` 에서 상품명/코드 검색, 이미 등록된(`getEventGoodsOption`) 옵션 제외, 상태 라벨(판매중/중지/종료/승인대기) 포함 tr HTML 반환.
  - `event_goods_add`/`event_goods_delete`(AJAX): `tbl_event_goods` 단건 추가/삭제.
  - `group_search`/`group_item_add`(AJAX): 그룹코드로 `getGroupItemList` 조회 → 전체추가(멀티 insert).
- 데이터소스: `tbl_event`, `tbl_event_goods`. `AdminEvent`, `AdminGoods`, `Admin`.
- 검증: register 폼에는 `show_promotion` radio 의 checked 바인딩 누락(등록화면 `$checked['show_promotion']` 미설정 — modify 에서만 세팅). 레거시 그대로 이관.

#### 이벤트 게시판 수정 — `event/event_board_modify.php`
- 유형: 폼 + 옵션상품 관리 UI (register 확장판)
- 추가 기능: 우측 패널에 배너 프리뷰, **이벤트 상품 목록**(`tbl_event_goods` 조회, 개별 삭제), 옵션상품 검색(모달), 그룹상품 가져오기. 모든 상품 조작은 `event_board_ps.php` AJAX(위 mode) 로 처리. hidden `mode=modify` 고정.
- 데이터소스: `tbl_event` + `tbl_event_goods`.

#### 이벤트 현황(추첨) — `event/event_lottery_list.php`
- 유형: 목록(통계 집계) (**dgkr DB**)
- 기능: 추첨 이벤트별 진행수량·기간·대상금액·대상자수·참여자수·참여횟수·당첨자수·참여율·당첨확률(참여율/확률은 `//` 주석 처리되어 미표시) + 당첨자현황/낙첨자현황 링크.
- 데이터소스: `AdminEvent::getEventLotteryList()` + 행별 `getEventLotteryMemberCount`, `getEventLotteryJoinCount`, `getEventLotteryItem`.
- 연계: `event_lottery_success.php`(당첨자), `event_lottery_fail.php`(낙첨자).

#### 이벤트 현황 상세(당첨자) — `event/event_lottery_success.php`
- 유형: 목록(당첨자) (dgkr DB). 사이드바 숨김.
- 기능: `event_no` 의 `lottery_status='Y'` 당첨자 목록(회원아이디 검색). 컬럼: 사은품명·회원아이디·회원명·생년월일·휴대폰·당첨일자. 회원정보는 `AdminV1::getMemberInfo(getMemberNo(m_id))`. 배송조회 스크립트(우체국/CJ) 포함.
- 데이터소스: `getEventLotteryItemList()` (`teli.*`). 30개/페이지.

#### (주석) 추첨 이벤트 등록 — `event/event_lottery_register.php`
- 유형: 폼 (메인 DB). 사이드바 주석.
- 폼필드: `event_name`, `event_start_dt`/`event_end_dt`(required), `event_gift`(사은품명), `event_gift_count`(진행수량). action `event_lottery_ps.php`(파일 미확인).

#### 2025 가정의달 이벤트 — `event/event_list_202505.php`
- 유형: 목록(하드코딩 idx) (dgkr DB)
- 정책: `where idx in ('29','30','31','32','33')` 고정. 참여자수는 `getEventLotteryJoinCount`. 사용예산 컬럼은 빈칸.
- 데이터소스: `getEventLotteryList()`.

#### 2025 여름 프로모션 이벤트 — `event/event_list_20250626.php`
- 유형: 목록(하드코딩 idx) (dgkr DB)
- 정책: `where idx in ('34','35','36','37')`. 참여자수 `getEventMemberCount`. 사용예산 = `event_gift_count*event_per_price`(idx 37) 또는 `참여자수*event_per_price`. 합계 tfoot.

#### 풋볼 매니저 26 예약 구매 — `event/event_fm26.php`
- 유형: 목록(하드코딩 idx = 구매이벤트) (dgkr DB)
- 정책: `where idx in ('38','39')`. 사은품수량·참여자수(`getEventMemberCount`)·사용예산 + 합계. 예산 = gift_count 있으면 `gift_count*per_price`, 아니면 `참여자수*per_price`.
- 성격: "구매 이벤트"는 별도 등록 UI 없이 dgkr 이벤트 idx 를 하드코딩한 전용 집계 화면으로 운영.

#### 사은품 이벤트 진행이력 — `event/event_gift_list.php`
- 유형: 목록 (dgkr DB)
- 기능: 컬럼 — 이벤트명·사은품명·수량·기간·당첨자발표·사은품발송·배송여부·당첨자현황 링크.
- 데이터소스: `AdminEvent::getEventGiftList()`. 상세 → `event_gift_member.php?idx`.

#### 사은품 이벤트 진행이력 상세(당첨자) — `event/event_gift_member.php`
- 유형: 목록(당첨자) (dgkr DB). 사이드바 숨김.
- 기능: `parent_idx=idx` 당첨자. **배송여부(`is_delivery`)에 따라 컬럼 분기**:
  - 배송 O: 사은품명·아이디·회원명·생년월일·휴대폰·수신인·주소·배송지입력일자·상태·송장번호(배송조회 버튼)
  - 배송 X: Asset ID·사은품명·아이디·회원명·생년월일·휴대폰·수령시간·상태
- 상태 맵: 1 배송지입력·2 발송완료·3 수령완료. 배송조회는 우체국(delivery_code 002)/CJ 폼 POST.
- 데이터소스: `getEventMemberList()` (`tegm.parent_idx`).

#### 사은품 발송 현황 — `event/event_gift_request.php`
- 유형: 목록 + 검색필터 (dgkr DB)
- 기능: `teg.is_delivery='Y'` 대상. 검색(회원아이디/송장번호/수신인) + 상태(전체/배송지입력/발송완료) + 이벤트·사은품 select2. 컬럼: 이벤트명·사은품명·회원정보·수신인·주소·배송지입력일자·상태·송장번호(배송조회).
- 데이터소스: `getEventMemberList()` + `getEventGiftList2()`(select 옵션).

#### 추가 포인트 지급 이벤트 — `event/event_point_list.php`
- 유형: 목록 + 검색필터 (메인 DB)
- 기능: 옵션상품명/코드 검색 + 지급여부(`repay_flag` Y/N) + 진행상태(진행예정/진행중/종료, `start_dt`/`end_dt` 기준). 컬럼: 옵션상품정보·지급여부·지급기간·추가 포인트 정보(`repay_type='%'` 면 "주문금액의 N%", 아니면 정액 원)·진행상태(현재시각 대비 파생).
- 데이터소스: `AdminEvent::getEventPointList()`. 조회 전용(등록/수정 화면 없음).

---

## 변형/임시 파일 (promotion/tmp 등)

- **`promotion/tmp/`** — 할인 프로모션 업로드 파일(`promotion_ps.php` 가 `YmdHis.확장자` 로 저장)의 실물 저장소. `.xlsx` 18개(2025-05 무렵) + `.csv` 430개(2025-05 ~ 2026-07). 업로드 이력 산출물이며 **마이그레이션 대상 아님**(운영 데이터/부산물). 신규 시스템에서는 임시 업로드 스토리지로 대체.
- **`promotion/timedeal_register.php`** (0B) — 빈 파일. 타임딜 등록 미구현.
- **`event/event_gift_end.php`** (0B) — 빈 파일. "사은품 발송완료 현황" 미구현(사이드바 `[X]` 주석).
- **`event/event_list_202505.php`, `event_list_20250626.php`, `event_fm26.php`** — 특정 이벤트 idx 를 하드코딩한 일회성/시즌성 화면. 재사용 등록 화면이 아닌 "그때그때 복제" 방식의 변형 파일. 신규 시스템에서는 파라미터화된 단일 이벤트 집계 화면으로 통합 검토.
- (파일 부재, 사이드바 주석) `coupon_config.php`/`coupon_list.php`/`coupon_register.php` — 온라인 쿠폰 관리는 미존재.

---

## 마이그레이션 유의점

1. **DB 이원화**: 할인/주말/대규모 프로모션·이벤트 게시판·추가포인트는 **메인 DB**(`$dsn`), 오프라인 쿠폰·추첨/사은품/구매 이벤트는 **dgkr DB**(`$dsn_dgkr`). 화면별로 어느 커넥션을 쓰는지 위 표기 참고.

2. **상태의 파생성**: 할인 프로모션의 진행중/예정/종료는 저장값이 아니라 `promotion_start`/`promotion_end` 와 `now()` 비교로 파생. 추가포인트·이벤트 진행상태도 동일. 신규에서도 동일 파생 규칙 유지(저장 상태 컬럼 신설 금지 — 동작 동일성).

3. **일부 기간 컬럼은 unix timestamp(int)**: 주말/대규모 프로모션(`promotion_week_start` 등), 이벤트 게시판(`start_date`/`end_date`)은 `strtotime()` 로 int 저장 후 `date()` 로 표시. 오프라인 쿠폰(`sdate`/`edate`)·추첨 이벤트(`event_start_dt`)는 datetime 문자열. 컬럼별로 타입이 섞여 있으니 이관 시 주의.

4. **다중 상품을 `|` 구분 문자열로 저장**: 주말/대규모 프로모션의 추천·인기·최대할인·가격대·적립 상품은 개별 컬럼이 아니라 `code1|code2|...` 단일 문자열. 폼은 고정 개수(추천4/인기10/최대할인3/가격대5 등) 입력칸. 렌더 시 `explode('|')`. 신규 스키마 설계 시 이 계약(개수·순서) 보존.

5. **파일 업로드 파싱 계약**: 승인대기 프로모션은 xlsx/csv 를 PHPExcel 로 A~J 고정 컬럼 순서로 파싱, 할인율은 `round(x*100)`. MIME 뒷부분으로 확장자 검증. `tbl_promotion_schedule` `ON DUPLICATE KEY UPDATE`(중복 키 시 일부 필드만 갱신). 이 컬럼 매핑·중복 처리 규칙을 그대로 재현.

6. **오프라인 쿠폰 코드 발급**: 등록 시 `setPaperCoupon` 이 발행수량만큼 실제 코드 행(`tbl_offline_paper`)을 생성. STATIC 은 지정코드 1건(반복 주석처리됨), DYNAMIC 은 난수 ea개, DOWNLOAD 미구현. 수정 시 재발급 없음. 이 발급 시점/방식을 유지.

7. **레거시 버그·이상(그대로 이관, 임의 수정 금지)**:
   - `promotion_season_ps.php` register INSERT 에 `,,`(콤마 2개) → INSERT 실패 가능(추정: modify 위주 운영). 이관 시 실동작 확인.
   - AJAX 성공 콜백에 `location.relaod()`(오타, `reload` 아님) 다수(`promotion_ready.php`, `promotion_ing.php` 등) → 실제 새로고침 안 됨. 동작 동일성 원칙상 재현 대상이나, 명백한 오타는 이관 전 사용자 확인 권장.
   - `event_board_register.php` 의 `show_promotion` checked 바인딩 누락.
   - `promotion_sync.php` 의 `$consumer_price`/`$publisher_code` 미정의.

8. **하드코딩 idx 이벤트**: `event_fm26`/`event_list_*` 는 dgkr 이벤트 idx 를 코드에 직접 나열. 신규 시스템 이관 시 데이터 마이그레이션에 따라 idx 재매핑 필요.

9. **비활성/숨김 메뉴**: 타임딜 전체(`[X]`), 온라인 쿠폰(파일 부재), 할인 프로모션 등록/동기화·추첨 등록(주석), 각종 상세(`d-none`/`display:none`). 이관 우선순위에서 제외하되, 상세 화면은 목록에서 링크되므로 함께 이관.

10. **외부 연동**: 배송조회(우체국 epost / CJ대한통운 폼 POST), 이벤트 통계(`statistics/event/event_order_count.php`), 스토어프론트 프리뷰(주말/대규모 view 는 실제 상품 카드 렌더). 프리뷰 화면은 스토어프론트 컴포넌트와 렌더 로직이 겹치므로 클라이언트 앱과 공유 검토.
