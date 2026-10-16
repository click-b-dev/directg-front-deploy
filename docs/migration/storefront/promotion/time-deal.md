# 타임딜 랜딩 (time_deal)

> ⚠️ "목록"이 아니라 **하드코딩 단일 상품 랜딩**이다. legacy 페이지가 `product_code="50005634"` 를 상수로 박아두고 그 한 상품의 타임딜 정보를 보여준다.

## 원본
- 파일: `pc/promotion/time_deal.html` (라이브 — legacy `pc/inc/header.html` GNB/sitemap에서 진입하는 프로모션 랜딩. 상세 `game/timedeal_view.html` 은 이미 이관됨=`entities/timedeal-detail`)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/PROMOTION-EVENT-OPS.md`

## 화면·플로우
- 진입 URL/파라미터: `/promotion/time_deal.html`. `?page`(SANITIZE_NUMBER_INT)를 읽지만 **어디에도 사용하지 않음**(dead). 실제 상품은 하드코딩 `product_code="50005634"`.
- 화면 요소 (legacy 기준):
  - `is_view=="N"` → 콘텐츠 전체 대신 `alert alert-danger` **"타임딜 진행기간이 아닙니다."** 만 렌더.
  - `is_view=="Y"`:
    1. **top_banner**(bg `image.directg.net/R7PayUdWBZ`) + 좌상단 오버레이 img(`image.directg.net/P7PaBshmEs`, `translate(0,-220%)`) + `#given_date` **카운트다운** 컨테이너.
    2. 2단 grid `grid-template-columns: 460px auto`:
       - 좌: `/game/timedeal_view.html?sku={goods_sku}` 링크 + 상품 header 이미지(`/upload/product/{product_code}/header/header.jpg`) + 하단 오버레이 "게임정보 바로가기 →".
       - 우: 상품명(`product_name`) + 소형 img(`image.directg.net/A7PbXeIpxX`) + **플랫폼 로고**(switch: 1=steam, 34=epic, **그 외 없음**) + **연령 img 하드코딩 `age_15.png`** / `region_msg`(`timedeal_msg text-danger`) / 가격박스(`timedeal_price`, bg `image.directg.net/p7PgALO8wy`, GmarketSans 폰트): 정상가 `consumer_price`(취소선) → 할인가 `timedeal_price` + 할인율 `round((timedeal_srp-timedeal_price)*100/timedeal_srp)`% / **장바구니 버튼**.
    3. `<hr class="my-5">` + **유의사항** `ul`(9개 고정 + `if(date=="2025-02-12")` 조건부 6개 = **과거 날짜, 현재 미노출**이지만 verbatim 유지).
    4. `<hr>` + **bottom_banner**: `https://directg.net/upload/event/{$bottom_banner}` — **`$bottom_banner` 미정의 변수(legacy 버그) → `.../upload/event/` 빈 suffix**. verbatim.
- 폼 필드/검증: 없음.
- 분기/리다이렉트: `is_view` N/Y 분기만. 리다이렉트 없음.
- 세션/권한 의존: 장바구니 버튼 클릭 시 `$_SESSION['member']['m_id']` 검사.

### 카운트다운 타이머 (vendor 인터랙션 — 사용자 게이트 통과: **실제 legacy vendor 로드**, 2026-09-11 승인)
- legacy: `/assets/js/jquery.countdownTimer.js`(jQuery 플러그인) `$('#given_date').countdowntimer({...})`.
  - `regexpMatchFormat: "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})"` → 4그룹(일:시:분:초).
  - `regexpReplaceWith`: 각 그룹을 `<span class='countdown'>$n</span>` 로 감싸고 사이 공백.
  - `startDate`: 렌더 시점 `date('Y/m/d H:i:s')`(서버 now, KST).
  - `dateAndTime`: `date('Y/m/d H:i:s', timedeal_end)`(타임딜 종료, KST).
  - `size: "xl"`.
- 재현: `jquery.countdownTimer.js` 를 `public/assets/js/` 로 무수정 복사 + jQuery 3.7.1(date-range-picker 와 동일 CDN/SRI) page-scoped 로드 → legacy 인라인 동형 초기화. `startDate`=client now, `dateAndTime`=`timedeal_end`(unix→KST `Y/m/d H:i:s`).

### 장바구니 버튼 (order/session 도메인 이월)
- legacy 버튼: `data-sku="<?=$game['goods_sku']?>"` — **`$game` 미정의 → data-sku 빈값(legacy 버그)**, `data-timedealNo=""`.
- 클릭 JS: `m_id==""` → `alert("로그인을 하셔야 이용이 가능합니다.")` + `return`(**리다이렉트 없음**). 아니면 `POST /order/cart_proc.php {mode:"add_timedeal_cart", goods_sku, timedeal_no}` → 응답 HTML을 `#cart_result` 주입 후 `#cart-modal` 표시.
- 현재 앱 상태: 세션 미착수 → **비로그인 경로만 활성**. 클릭 시 위 alert만. 로그인 경로 AJAX(`/api/order/cart` mode=`add_timedeal_cart`)는 **order 도메인 이월**(dormant). data-sku 빈값 verbatim.

## SSR·SEO (legacy)
- head: `<title>타임딜</title>`, `<meta name="description" content="">`(빈), `<meta name="author" content="H2interactive">`, viewport `width=device-width, initial-scale=1.0`.
- **canonical/OG/alternate 없음**(weekend/season 과 달리 이 페이지엔 없음). → 추가 금지.
- 구조화 데이터: 없음.
- 페이지별 CSS: 전부 `<style>` 인라인(countdown/top_banner/timedeal_price/price/sale_price/discount_rate/goods_image/goods_page/bottom_banner + `@font-face GmarketSans`). `page/*.css` 없음.
- SSR/CSR: 데이터 조회+마크업은 SSR. 카운트다운/장바구니만 client.

## 데이터 (legacy)
- 도메인 클래스·메서드 (`Goods`, product_code="50005634"):
  - `getGoodsItemDetail(pc)` → `tbl_goods_item` 단건. 사용 필드: `is_view`, `goods_sku`, `product_code`, `product_name`, `product_platform`, `consumer_price`.
  - `getGoodsOptionDescription(pc)` → `tbl_goods_item_description` 단건. 사용 필드: `region_msg`.
  - `getTimedealSchedule(pc)` → `select * from tbl_timedeal where product_code=:pc and timedeal_end>UNIX_TIMESTAMP()`. 사용 필드: `timedeal_price`, `timedeal_srp`, `timedeal_end`(unix). **timedeal_start 조건은 주석처리됨**(종료만 검사).
- AJAX/POST: 장바구니 `POST /order/cart_proc.php` (order 도메인 이월).

## API 계약 (백엔드 전달)
- `GET /api/promotion/time-deal?product_code={code}` — 타임딜 랜딩 데이터. product_code 는 **프론트가 하드코딩 상수(`50005634`)로 전달**(legacy 페이지가 상수로 박은 것을 그대로 이월). 백엔드는 `getGoodsItemDetail`+`getGoodsOptionDescription`+`getTimedealSchedule` 를 조립.
  - 요청: `product_code` (string, required).
  - 응답:
    ```jsonc
    {
      "is_view": "Y",            // tbl_goods_item.is_view (N이면 진행기간 아님 분기)
      "goods_sku": "…",          // getGoodsItemDetail
      "product_code": "50005634",
      "product_name": "…",
      "product_platform": "1",   // 1=steam, 34=epic (그 외 로고 없음)
      "consumer_price": 66000,   // 정상가
      "region_msg": "…",         // getGoodsOptionDescription.region_msg (없으면 "")
      "timedeal": {              // getTimedealSchedule (활성 타임딜 없으면 null)
        "timedeal_price": 39600,
        "timedeal_srp": 66000,
        "timedeal_end": 1739300000  // unix seconds
      }
    }
    ```
  - 에러: legacy 는 PDOException 시 `echo 'Error!: …'; die();`. 백엔드는 표준 에러 응답으로 대체(프론트는 통상 에러 경로).
  - 백엔드 책임: is_view/타임딜 스케줄(timedeal_end>now) 판정, region_msg resolve. `timedeal_srp`(정가 기준 할인율 계산용)·`timedeal_price` 는 tbl_timedeal 원천.

## 타겟 매핑
- 라우트: `app/(pc)/promotion/time_deal.html/page.tsx` (SSR, `metadata` title="타임딜"/desc "".)
- screen: `screens/promotion-time-deal` (server) + `ui/countdown-timer.tsx`(client, vendor 로드) + `ui/time-deal-cart.tsx`(client, 비로그인 alert + order AJAX 이월).
- entities: `entities/promotion-time-deal` (`getPromotionTimeDeal(productCode)` + types).
- mock: `shared/mocks/handlers.ts` + `fixtures/promotion-time-deal.ts` (timedeal_end 는 핸들러에서 now+수시간 동적 생성해 카운트다운 표시).
- vendor: `public/assets/js/jquery.countdownTimer.js` (legacy 무수정 복사).
- 하드코딩 상수: `PRODUCT_CODE = "50005634"` (route에서 fetcher로 전달).

## Parity 체크리스트
- [ ] 화면 요소 일치 (배너/카운트다운/2단 grid/가격박스/유의사항/bottom_banner)
- [ ] `is_view=N` 분기 alert 문구 일치
- [ ] 플랫폼 로고 switch(1/34/그외없음)·연령 `age_15` 하드코딩 일치
- [ ] 할인율 계산 `round((srp-price)*100/srp)` 일치
- [ ] 카운트다운 vendor 로드·포맷(D:H:M:S span) 일치
- [ ] 장바구니 비로그인 alert("로그인을 하셔야…")·리다이렉트 없음 일치, data-sku 빈값(legacy 버그) 유지
- [ ] bottom_banner 빈 suffix(legacy 버그) 유지
- [ ] SEO: title="타임딜"/description ""/author H2interactive, **canonical 없음** 일치
- [ ] 엣지케이스: `?page` dead, 2025-02-12 조건부 유의사항 verbatim(미노출)
