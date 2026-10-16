# 마이페이지 — 포인트 내역 (mypage_point)

> mypage 4번째 단위. **client 서버 페이지네이션 인프라 확립**(`shared/ui/server-pagination`, admin에서 포팅 — legacy Pagination.php 동일 알고리즘). 다른 mypage 목록(order/cancel/coupon 등)에 재사용.

## 원본
- 파일: `pc/mypage/mypage_point.html` (라이브), 가드 `login_check.php`, aside active=point
- 도메인: `Mypage::getPointList(page, where, orderby, param)`(페이지네이션 + links_html), `getMemberEmoney`
- 선행: `mypage/account-settings.md`

## 화면·플로우
- URL: `/mypage/mypage_point.html?page=N` (GET, 로그인 필요). page 기본 1. where: m_no, orderby regdt DESC
- 레이아웃: `container>main.d-grid(240px auto)`+aside(point)+`section#content.content.rounded-0.font-14`
- 콘텐츠:
  - 보유 포인트 카드: "고객님께서 보유하신 포인트는 `<span text-danger fw-bold>{number_format(member_emoney)}</span>`원 입니다."
  - 표: 날짜/적립·사용/사유/포인트. 행: regdt / emoney_type(+적립 text-danger, -사용 text-primary) / memo(text-start) / amt_delta(text-end {color} won, 앞 공백). 빈: colspan=4 "포인트 내역이 없습니다."
  - 페이지네이션: `#pagination.mt-4` = Pagination.php `links_html`(First/Prev(−10)/번호(ellipses)/Next(+10)/Last)
- 세션: 로그인 필요. 데이터 fetch만(인터랙션 없음) → 서버 컴포넌트

## SSR·SEO (legacy)
- `<title>포인트 내역</title>`, viewport `width=device-width, initial-scale=1.0`, description 빈값, author `H2interactive`, canonical/OG 없음

## 데이터/계약 (백엔드 전달)
### `GET /api/mypage/points?page=N`
- 쿠키 세션 → m_no. orderby regdt DESC. 응답:
  ```
  { member_emoney: number, list: [{ regdt, emoney_type: "+"|"-", memo, amt_delta }], page: number, totalPages: number }
  ```
- 백엔드: getPointList(페이지네이션, results_per_page는 Pagination.php 설정), getMemberEmoney. `totalPages`는 총건수/페이지크기

## 타겟 매핑
- 라우트: `app/mypage/mypage_point.html/page.tsx` (서버 — 가드 + searchParams.page + fetch)
- screen: `screens/mypage-point` (서버)
- entities: `entities/mypage-point` `getMypagePoints(page)`(server, 쿠키)
- widget: `widgets/mypage-aside`(active=point)
- **`shared/ui/server-pagination`**(신규, admin 포팅). baseUrl=`/mypage/mypage_point.html`
- mock: `GET /api/mypage/points` + fixture

## 유의
- 페이지네이션 markup은 Pagination.php 기본(admin banner_list 기준 `pagination pagination-lg`). mypage용 정확한 클래스/스타일은 legacy links_html과 대조 요망(경미).
- number_format 천단위 콤마 [[directsend-balance-number-format]].

## Parity 체크리스트
- [ ] 가드 / 보유 포인트 카드(number_format)
- [ ] 표 컬럼·적립/사용 색상·빈 문구
- [ ] 페이지네이션(page 이동)
- [ ] SEO(title/author) 일치
