# 오프라인 쿠폰 리스트 (읽기 목록 + 검색)

> P1 #180. legacy `offline_coupon_list.php`. 오프라인/종이 배포용 쿠폰(`tbl_offline_coupon`, **DGKR DB**) 목록 + 검색. 13컬럼, 읽기전용(뮤테이션 없음, 링크만). 상세(#182)·수정(#181)·다운로드는 링크 대상.

## 원본
- 파일: `pc/_Admin_/promotion/offline_coupon_list.php` (라이브, 사이드바 `오프라인 쿠폰 관리 > 오프라인 쿠폰 리스트`)
- 도메인: `AdminPromotion::getOfflineCouponList`(`SELECT toc.* FROM tbl_offline_coupon toc WHERE 1 {add_where} ORDER BY toc.sno DESC`, **20/page**), `getOfflineCouponUseCount`(sno)(`COUNT(1) FROM tbl_offline_download WHERE coupon_sno=:sno`).
- DB: `$dsn_dgkr`(DGKR). 다운로드: `offline_coupon_download.php`.

## 화면·플로우
- 진입 URL: `/promotion/offline_coupon_list` (파라미터 `page`,`search_type`,`search_value`)
- `$page_title="오프라인 쿠폰 리스트"`. breadcrumb: 홈/프로모션/오프라인 쿠폰 관리/**오프라인 쿠폰 리스트**(active).
- **검색필터 카드** "검색필터": `검색어` 라벨 + search_type select(쿠폰명=`toc.coupon_name` / 사용처=`toc.partner`) + search_value(LIKE) + 검색 버튼. 선택 유지.
- 카운트: `<div>{number_format(total)} 개</div>`.
- 목록 테이블(**13컬럼**, `table-hover table-centered nowrap table-sm table-bordered border-light`, thead `table-light font-13`):

| # | 헤더 | 셀 |
|---|------|----|
| 1 | 번호 | `total_results - (num + (page-1)*20)` (내림차순, 20/page) |
| 2 | 쿠폰명 | coupon_name |
| 3 | 등록일 | regdt |
| 4 | 사용처 | partner |
| 5 | 사용기간 | `{sdate} ~ {edate}` — **edate < now면 td에 `text-danger`(만료 빨강)** |
| 6 | 적립금 | number_format(coupon_price) + " " + currency |
| 7 | 발급유형 | code_type 라벨(DOWNLOAD=다운로드/STATIC=지정코드/DYNAMIC=난수코드) |
| 8 | 발급수 | number_format(issue_limit_cnt) (text-end) |
| 9 | 사용수 | getOfflineCouponUseCount(sno) (text-end) |
| 10 | 발급상태 | status 라벨(0=발급대기/1=발급중/2=일시정지/3=발급종료) |
| 11 | 발급내역관리 | `<a href=offline_coupon_view.php?sno=&param=btn-outline-secondary btn-sm>사용현황</a>` (상세 #182) |
| 12 | 코드 | `<a href=offline_coupon_download.php?sno= target=_blank>다운로드</a>` (백엔드 파일) |
| 13 | 수정 | `<a href=offline_coupon_register.php?sno=&mode=update&param=>수정</a>` (등록/수정 #181) |

- 빈 목록 메시지 없음.
- 페이지네이션: links_html(ServerPagination), 20/page, order `toc.sno DESC`.
- `back_btn = urlencode(base64(param))` — 상세/수정 링크의 `param`(목록 복귀용). SPA는 search 상태로 복귀 처리 → **#181/#182에서 결정**(idiomatic). #180 링크는 sno(+mode) 위주.

## API 계약 (백엔드 전달)
`entities/promotion` 확장(offline-coupon).

- `GET /admin/promotion/offline-coupons?page&search_type&search_value` → `{ items: OfflineCouponListItem[], pagination }`
  - SQL: `tbl_offline_coupon` DGKR, `search_type LIKE %v%`(coupon_name/partner), order `sno DESC`, 20/page.
  - item: `{ sno, coupon_name, regdt, partner, sdate, edate, coupon_price, currency, code_type, issue_limit_cnt, use_count, status }`. `use_count`는 백엔드가 tbl_offline_download COUNT로 resolve.
- `GET /admin/promotion/offline-coupons/:sno/download` → 파일(target=_blank, 백엔드), MSW mock 불가.

## 타겟 매핑
- 라우트: `routes/promotion/offline_coupon_list.tsx` (validateSearch page/search_type/search_value)
- 스크린: `screens/offline-coupon-list/`
- entities: `entities/promotion` 확장(`fetchOfflineCouponList`/`useOfflineCouponList` + `OfflineCouponListSearch`/`OfflineCouponListItem`/`OfflineCouponListResponse`).
- mock: `handlers/promotion.ts` 확장 — 신규 `OFFLINE_COUPON` fixture(code_type·status 다양, edate 만료/유효 혼재) + GET.
- 링크: 상세 `/promotion/offline_coupon_view?sno=`(#182)·수정 `/promotion/offline_coupon_register?sno=&mode=update`(#181)·다운로드 `{apiBaseUrl}/admin/promotion/offline-coupons/{sno}/download` target=_blank — 미생성 라우트는 죽은 링크.

## 파리티 결정 사항 (게이트 확인 대상)
1. **13컬럼**·번호 내림차순 20/page.
2. 사용기간 **만료(edate<now) text-danger**.
3. code_type/status 라벨 매핑.
4. 사용수는 행별 count(백엔드 resolve).
5. 다운로드 target=_blank 백엔드 파일(mock 불가).
6. back_btn base64 param → SPA nav로 대체(#181/#182에서 확정).

## Parity 체크리스트
- [ ] 검색필터(쿠폰명/사용처 + 검색어) 노출·선택 유지
- [ ] 13컬럼 셀(번호/쿠폰명/등록일/사용처/사용기간 만료색/적립금+통화/발급유형/발급수/사용수/발급상태/사용현황·다운로드·수정 링크)
- [ ] 20/page·sno DESC 정렬
- [ ] 링크(#181/#182/다운로드) sno 전달
