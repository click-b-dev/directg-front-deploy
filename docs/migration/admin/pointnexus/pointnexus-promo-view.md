# PointNexus - 프로모션 캠페인 상세 (promo_view)

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_promo_view.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runPromoRetrieve($id)` — 단건 상세
- #94(프로모션 목록)의 링크 대상.

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_promo_view?mode&id`
- page_title `PointNexus 프로모션 캠페인 상세` + h4 `<small>GET /promo/{id}</small>`
- inline style: `.uuid`, `.table .badge`, `.section-title`, `.label-col`, `.promo-price`, `.origin-price`
- 필터: 환경(autoSubmit=false) + 캠페인 UUID text + 조회
- state 색상: running=success, scheduled=info, ended=secondary, paused=warning (그 외 info)
- 분기: `id` 없음 → alert-info / `error` → alert-danger / `campaign`(배열이면[0]) → 상세 / 그 외 → alert-warning "데이터 없음"
- 상세:
  - **캠페인 정보** 카드(col-lg-6): 이름/상태(state badge, 있으면)/시작일·종료일(`pn_fmt_date`,19, 있으면)/캠페인 ID(uuid)
  - **발행자** 카드(col-lg-6): issuer.name/issuer.id(uuid) / 없으면 "발행자 정보 없음"
  - **캠페인 대상 상품** 카드(개수 = products 또는 productIDs 길이):
    - `products` 있으면 6컬럼 표: #/상품명/기본 할인(defaultDiscountPercent% badge)/가격(통화별)/상품 ID(uuid)/보기 링크(→product_view)
      - 가격: `products[].prices[]` — relevant 통화(currency.name)만. discount.percent>0이면 initialPrice.formatted(취소선)+discountedPrice.formatted(promo)+(-%), 아니면 initialPrice.formatted. hidden "외 N개 통화"
    - `products` 없고 `productIDs` 있으면 3컬럼 표: #/상품 ID(uuid)/보기 링크
    - 둘 다 없으면 "대상 상품 정보 없음"
  - `PnJsonBox`

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/promo-retrieve`

- 쿼리: `mode`, `id`(UUID)
- 백엔드 책임: runPromoRetrieve(id), 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: {
      id, name, state, issuer:{ name, id }, startDate, endDate,
      productIDs: string[],
      products: { id, name, defaultDiscountPercent,
        prices: { currency:{name}, initialPrice:{formatted}, discountedPrice:{formatted}, discount:{percent} }[]
      }[]
    } | [...],
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_promo_view.tsx` → `/goods/pointnexus/pointnexus_promo_view` (mode normalize + id)
- screens: `screens/pointnexus-promo-view`
- entities: `pointnexus` 확장 — `PnCampaignDetail`/`PnCampaignProduct`/`PnCampaignPrice`/`PnPromoRetrieveResponse`, `fetch/usePointNexusPromoRetrieve`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/promo-retrieve`
- 보기 링크는 product_view(#104 이관) SPA 경로

## Parity 체크리스트

- [ ] id 없음/error/데이터 없음 분기
- [ ] 캠페인 정보(조건부)·발행자 카드
- [ ] 대상 상품(products 상세 / productIDs 간단 / 없음)·가격(통화 필터·할인)
- [ ] 보기 링크·JSON 박스
