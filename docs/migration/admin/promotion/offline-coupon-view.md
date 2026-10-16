# 오프라인 쿠폰 상세 (기본정보 + 사용현황)

> P1 #182(마지막 프로모션 단위). legacy `offline_coupon_view.php`. 오프라인 쿠폰(`tbl_offline_coupon`, DGKR) 기본정보(읽기전용) + 발급코드 사용현황 목록. #180 목록의 사용현황 링크 대상.

## 원본
- 파일: `pc/_Admin_/promotion/offline_coupon_view.php` (라이브, 링크 진입)
- 도메인: `AdminPromotion::getOfflineCouponInfo(sno)`(기본정보), `getCouponCodeUsedList`(`SELECT top.number, tod.m_id, tod.regdt FROM tbl_offline_paper top LEFT JOIN tbl_offline_download tod ON top.sno=tod.paper_sno WHERE 1 {add_where} ORDER BY tod.regdt DESC`, **20/page**).
- 참조: #180/#181 문서

## 화면·플로우
- 진입 URL: `/promotion/offline_coupon_view?sno=N` (파라미터 `page`,`searchTitle`,`param`)
- `$page_title="오프라인 쿠폰 상세"`. breadcrumb: 홈/프로모션/오프라인 쿠폰 관리/오프라인 쿠폰 상세.
- **기본정보 카드**(col-8, `border border-1`, card-header `bg-secondary fw-bold font-15` "오프라인 쿠폰 기본정보"): 읽기전용 표시(입력 아님, `col-sm-6 d-flex align-items-center`):
  - * 쿠폰명 = coupon_name
  - * 쿠폰 사유 = reason
  - * 쿠폰 발행 수량 = issueLimitCnt + " 장"
  - * 쿠폰 사용기간 = sdate ~ edate (**DB raw 포맷 'YYYY-MM-DD HH:MM:SS'**)
  - * 쿠폰 사용처 = partner
- **"오프라인 쿠폰 사용현황"** 소제목(`page-title fs-5 lh-1`).
- 검색 폼(inline): `searchTitle`(회원아이디, 등호) + hidden sno/param + 검색.
- 카운트: `<div>{number_format(total)} 건</div>`.
- 사용현황 테이블(**4컬럼**, thead `table-light font-13`):

| # | 헤더 | 셀 |
|---|------|----|
| 1 | 번호 | `total - (num + (page-1)*20)` (내림차순, 20/page) |
| 2 | 쿠폰번호 | number |
| 3 | 아이디 | m_id |
| 4 | 사용일자 | regdt |

- 페이지네이션: links_html(ServerPagination), 20/page, order `tod.regdt DESC`.
- 하단: `목록`(back_btn → #180).
- add_where: `top.coupon_sno={sno} AND top.flag='Y'`(발급됨) + searchTitle→`tod.m_id='{searchTitle}'`. LEFT JOIN이라 미사용 코드는 m_id/regdt null 가능.

## API 계약 (백엔드 전달)
`entities/promotion` 확장.

- `GET /admin/promotion/offline-coupons/:sno/used?page&searchTitle` → `{ info, items, pagination }`
  - `info: OfflineCouponViewInfo` = `{ coupon_name, reason, issue_limit_cnt, sdate, edate, partner }` (getOfflineCouponInfo, 날짜 DB raw 포맷).
  - `items: OfflineCouponUsedItem[]` = `{ number, m_id, regdt }` (getCouponCodeUsedList, flag='Y' + searchTitle 등호, regdt DESC, 20/page).
  - 기본정보 + 사용현황을 한 응답으로 결합(뷰가 둘 다 조회).

## 타겟 매핑
- 라우트: `routes/promotion/offline_coupon_view.tsx` (validateSearch sno/page/searchTitle)
- 스크린: `screens/offline-coupon-view/`
- entities: `entities/promotion` 확장(`fetchOfflineCouponUsed`/`useOfflineCouponUsed` + `OfflineCouponViewSearch`/`OfflineCouponViewInfo`/`OfflineCouponUsedItem`/`OfflineCouponUsedResponse`).
- mock: `handlers/promotion.ts` 확장 — GET /:sno/used. info는 `OFFLINE_COUPON` 행에서, 사용현황은 use_count 기반 합성 목록(number/m_id/regdt, searchTitle 필터).
- **#180 사용현황 링크 활성화**.

## 파리티 결정 사항 (게이트 확인 대상)
1. **기본정보 읽기전용**(입력 아님, 값만 표시)·사용기간 DB raw 포맷(#181 datetime-local과 다름).
2. **사용현황 4컬럼**·번호 내림차순 20/page·regdt DESC.
3. searchTitle 회원아이디 등호 검색.
4. 사용현황 목록은 백엔드 실데이터(mock은 use_count 기반 합성 표본).
5. back_btn base64 param → SPA nav(#180).

## Parity 체크리스트
- [ ] 기본정보 카드(쿠폰명/사유/발행수량 장/사용기간/사용처) 읽기전용 표시
- [ ] 사용현황 소제목·회원아이디 검색·카운트({n} 건)
- [ ] 4컬럼(번호 내림차순/쿠폰번호/아이디/사용일자) 20/page
- [ ] 목록 버튼(#180)
