# 마이페이지 — 쿠폰 내역 (mypage_coupon)

> mypage 5번째 단위. 포인트와 유사 목록형 + 쿠폰등록 폼(AJAX). `shared/ui/server-pagination` 재사용.

## 원본
- 파일: `pc/mypage/mypage_coupon.html` (라이브), 처리 `mypage_coupon_proc.php`, 가드 `login_check.php`, aside active=coupon
- 도메인: `Mypage::getCouponList(page, where, orderby, param)` (페이지네이션)
- 선행: `mypage/mypage-point.md`(페이지네이션 인프라)

## 화면·플로우
- URL: `/mypage/mypage_coupon.html?page=N` (GET, 로그인 필요). where m_no, orderby regdt DESC
- 레이아웃: `container>main.d-grid(240px auto)`+aside(coupon)+`section#content.content.rounded-0.font-14`
- 콘텐츠:
  1. **쿠폰등록 카드**: header "쿠폰등록" + `form#coupon_form`: input `coupon_number`(쿠폰번호) + 쿠폰등록 버튼. submit → 정규식 `/^(([a-zA-z0-9]{4})-?){4}$/gm`(4자×4그룹, 하이픈 옵션) 실패 시 "인증번호의 길이를 확인해주세요." → AJAX `mypage_coupon_proc.php {coupon_number}` → 응답 "성공" → alert("포인트가 지급되었습니다. 자세한 내역은 마이페이지 > 포인트 에서 확인 가능합니다.")+reload / 그외 alert(응답)
  2. **표**: 등록일/사유/포인트(3열). 행: regdt / coupon_name(text-start) / coupon_price(text-end won, 앞 공백). 빈: colspan=3 "쿠폰 내역이 없습니다."
  3. 페이지네이션: `#pagination.mt-4` Pagination.php links_html
- 세션: 로그인 필요

## SSR·SEO (legacy)
- `<title>쿠폰 내역</title>`, viewport `initial-scale=1.0`, description 빈값, author `H2interactive`, canonical/OG 없음

## 데이터/계약 (백엔드 전달)
### `GET /api/mypage/coupons?page=N`
- 쿠키 세션 → m_no. orderby regdt DESC. 응답 `{ list: [{ regdt, coupon_name, coupon_price }], page, totalPages }`
### `POST /api/mypage/coupon` { coupon_number } → `{ result: string }`
- legacy `mypage_coupon_proc.php`는 **plain text**("성공"/에러) 반환 → 계약은 `{ result }`로 정규화. result="성공"=지급. 백엔드: 쿠폰 검증·포인트 지급

## 타겟 매핑
- 라우트: `app/mypage/mypage_coupon.html/page.tsx` (서버 — 가드 + searchParams.page + getMypageCoupons)
- screen: `screens/mypage-coupon` (서버 — 목록/페이지네이션) + `features/coupon-register`(client 폼)
- entities: `entities/mypage-coupon` `getMypageCoupons`(server) + `postCouponRegister`(client)
- widget: `widgets/mypage-aside`(active=coupon), `shared/ui/server-pagination`
- mock: `GET /api/mypage/coupons` + `POST /api/mypage/coupon`

## Parity 체크리스트
- [ ] 가드 / 쿠폰등록 카드·정규식 검증·AJAX 분기
- [ ] 표 3열·빈 문구·number_format
- [ ] 페이지네이션
- [ ] SEO(title/author) 일치
