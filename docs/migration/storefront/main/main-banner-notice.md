# 메인 2-1: 메인 배너 캐러셀 + 공지 티커

메인 페이지(`pc/index.php`) 섹션 그룹 분할 이관의 첫 서브단위. Splide 캐러셀 인프라(CDN + use client mount) 및 `page/main.css` 첫 도입.

## 원본
- 파일: `pc/index.php` (라이브 메인. `index20260120.php`·`kdy_index.php`는 변형 → 제외)
  - 배너 섹션: `index.php:233-358` (`<section class="splide" id="splide">`)
  - 공지 섹션: `index.php:362-392` (`<section id="notice_section">`, `#notice.splide`)
  - Splide 초기화 JS: `index.php:736-789`
- 데이터: `src/classes/Main.php` — `getMainBanner()`(15), `getNoticeMain($num)`(80)
- 참조: `docs/design-system/client.md`, `docs/migration/storefront/layout/common-layout.md`

## 화면·플로우
### 진입 URL
- `/index.php`(=`/`) 메인. 배너/공지는 페이지 상단 2개 섹션.

### 화면 요소
**메인 배너 (`#splide`)** — Splide loop 캐러셀
- 각 슬라이드: `main_banner_link`(target) 이미지(`main_banner_pc`, alt=`banner_title`) + stretched-link
- caption(조건: `show_prod_info=='Y' || show_sale_info=='Y'`):
  - `show_prod_info=='Y'`: 판매상태 뱃지(`sales_status`) + 상품명(`option_info.product_name` h2)
  - `show_sale_info=='Y'`: 퍼블리셔(`title_info.publisher`) + 할인율/가격 + 출시일
- 가격 계산(parity):
  - `consumer_price = option_info.consumer_price ?? 0`
  - `promotion.sale_price>0` → `price=sale_price`, label=`bg-danger` / else `price=option_info.price`, label=`bg-primary`
  - `discount = (consumer_price-price)*100/consumer_price`, 표기 `round(discount)%` (discount>0일 때만 할인뱃지+원가 취소선)
  - `is_preorder=='Y'` → 뱃지 "예약구매"(`bg-warning`) / else "절찬 판매중"(`bg-primary`)
  - 출시일: `release_date > '1990-01-01 00:00:00'`일 때만 `출시일: {release_date 앞10자}`
  - 금액 표기 `number_format` → 천단위 콤마

**공지 티커 (`#notice`)** — Splide 세로(ttb) loop
- 좌측 타이틀(col-2): 아이콘 + "공지사항" → `/board/notice.html`
- 각 항목(col-10): `{deploy_date 앞10자}` + `{subject}` → `/board/notice_view.html?idx={idx}`

### Splide 옵션 (그대로 재현)
- **배너**: `{ type:'loop', padding:'15%', autoWidth:true, focus:'center', arrows:true, arrowPath:'<커스텀 SVG path>', classes:{pagination:'splide__pagination splide-button', page:'splide__pagination__page splide-button'}, autoplay:true, interval:4000 }`
- **공지**: `{ type:'loop', perPage:1, rewind:true, arrows:false, direction:'ttb', drag:true, dragMinThreshold:{mouse:0,touch:10}, wheel:true, releaseWheel:true, wheelSleep:100, height:'56px', focus:'center', pagination:false, autoplay:true, interval:3000 }`

### 세션/권한 의존
- 없음 (배너/공지는 세션 무관).

## SSR·SEO
- 메인 title/meta/canonical/OG는 `index.php` head 소유 → **메인 페이지 metadata 단위**(별도, 이후 서브단위/전용)에서 처리. 이번 2-1은 배너/공지 섹션 마크업+데이터에 한정.
- 배너/공지 데이터는 SSR 렌더(서버 컴포넌트 fetch → 캐러셀 use client는 마크업 hydrate 후 Splide mount).
- **페이지 전용 자산**: Splide CSS/JS(@4.1.4 CDN), `page/main.css`. **layout(공통) 아닌 메인 screen에서 로드**(legacy도 index.php head 전용).

## 데이터 (legacy)
### `Main::getMainBanner()` (Main.php:15)
- SQL(UNION): `tbl_main_banner`에서
  - (상시) `is_del='N' AND flag='Y' AND bannerPeriodOutputFl='N'`
  - UNION ALL (기간노출) `is_del='N' AND flag='Y' AND bannerPeriodOutputFl='Y' AND banner_start<UNIX_TIMESTAMP() AND banner_end>UNIX_TIMESTAMP()`
  - `ORDER BY banner_sort ASC`
- 매핑: `main_banner_pc/mobile/publisher/link/target/type`, `banner_title`, `show_prod_info`, `show_sale_info`
- `product_code>0`이면 상품 조인: `title_info=getGoodsOptionTitleInfo(product_code)`, `option_info=getGoodsItemDetail(product_code)`

### `Main::getNoticeMain($num)` (Main.php:80)
- SQL: `select idx,subject,deploy_date,notice_type from tbl_notice where is_view='Y' order by is_notice desc,deploy_date desc limit $num`
- index.php 호출: `getNoticeMain(5)`

## API 계약 (백엔드 전달)

### `GET /api/main/banners` — 메인 배너 목록
- 응답 200:
  ```json
  { "banners": [ {
    "main_banner_pc": "https://image.directg.net/...",
    "main_banner_mobile": "...",
    "main_banner_publisher": "",
    "main_banner_link": "/game/game_view.html?...",
    "main_banner_target": "_self",
    "main_banner_type": "",
    "banner_title": "타이틀",
    "show_prod_info": "Y",
    "show_sale_info": "Y",
    "title_info": { "publisher": "H2 Interactive", "sku": "..." },
    "option_info": {
      "product_name": "게임명",
      "consumer_price": 66000,
      "price": 59400,
      "is_preorder": "N",
      "release_date": "2026-03-14 00:00:00",
      "promotion": { "sale_price": 59400 }
    }
  } ] }
  ```
- 백엔드 책임: 위 UNION 쿼리(상시+기간노출), `banner_sort ASC`. `product_code>0`이면 상품 정보(title_info/option_info) 조인. `title_info`/`option_info`는 상품 없으면 생략(null).
- 에러: 없음(빈 배열 허용).

### `GET /api/main/notices?limit=5` — 메인 공지 목록
- 요청: `limit`(기본 5)
- 응답 200: `{ "notices": [ { "idx": 123, "subject": "제목", "notice_type": "일반", "deploy_date": "2026-08-20 10:00:00" } ] }`
- 백엔드 책임: `tbl_notice` `is_view='Y'`, `ORDER BY is_notice DESC, deploy_date DESC LIMIT :limit`.
- 에러: 없음(빈 배열 허용).

## 타겟 매핑
- 라우트: `app/page.tsx`(`/`) — 서버에서 배너/공지 fetch → `<main>` `HomeScreen` 렌더
- screen: `screens/home` — Splide CSS/JS + `page/main.css` 로드 + 섹션 조립
- widgets: `widgets/main-banner-carousel`(`'use client'`), `widgets/notice-ticker`(`'use client'`)
- entities: `entities/main-banner`, `entities/notice` (타입 + fetcher)
- shared: `shared/lib/use-splide`(공통 mount 훅, `'use client'`), `shared/types/splide.d.ts`(window.Splide 타입)
- mock: `shared/mocks/fixtures/main-banners`, `.../notices`

## Parity 체크리스트
- [ ] 배너 슬라이드 마크업/링크/이미지/target 일치
- [ ] caption 조건 분기(show_prod_info/show_sale_info) 일치
- [ ] 가격/할인/뱃지/출시일 계산 일치 (number_format 콤마, round)
- [ ] 배너 Splide 옵션 일치 (loop/autoWidth/focus/autoplay 4000/커스텀 arrow·pagination)
- [ ] 공지 항목 마크업/링크/날짜(앞10자) 일치
- [ ] 공지 Splide 옵션 일치 (ttb 세로/wheel/height 56px/autoplay 3000)
- [ ] page/main.css·splide CDN 자산 로드(메인 전용)
- [ ] 엣지: 배너 0건/공지 0건, option_info 없는 배너(순수 이미지)

## 보류/후속
- 메인 `<title>`/meta/OG/GTM/Clarity 추적코드 → 별도(메인 metadata 단위)
- `footer_banner.html`(기획 고정 배너2), `cart.html`(장바구니 모달) → 후속 서브단위(2-4/order)
- 게임 리스트 3종·예약·한국어·퍼블리셔·플랫폼 섹션 → 2-2/2-3/2-4
- 배너/공지 데이터 = fixture SSR 주입(백엔드 계약 확정, MSW 서버 인프라는 후속)
