# Ztorm API - 프로모션 현황

## 원본

- 파일: `pc/_Admin_/goods/ztorm/ztorm_promotion.php` (라이브)
- 엔티티: 기존 `ztorm` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/goods/ztorm/ztorm_promotion` (`page`만; legacy `$where` 미정의로 조건필터 없음)

- 화면 요소 (legacy 기준):
  - page_title `Ztorm 프로모션 현황` / breadcrumb: 홈 > 상품 > Ztorm API > Ztorm 프로모션 현황
  - 상단바: `{total} 개` + `Ztorm 캠페인 동기화` 버튼(btn_promotion_sync)
  - 테이블(`table-centered w-100 nowrap table-sm table-bordered border-light`, thead `table-light font-13`, tbody `font-12 bg-white`), 10컬럼:
    - 옵션상품코드 = `product_code` / 옵션상품명 = `product_name` / Item ID = `item_id` / Item Name = `item_name` / 공급처 = `item_publisher`
    - SRP = `number_format(product_srp)` / Discount = `{percent}%` / Discount SRP = `number_format(product_srp*(1-percent/100))`
    - 시작일 = `promotion_start` / 종료일 = `promotion_end`
  - 페이지네이션(50/page)

### mutation

- **Ztorm 캠페인 동기화**(btn_promotion_sync): `GET ztorm_api.php {api_type:promotion}` → 성공 시 `location.reload()`(alert 없음), 에러 시 alert.
- (하단 `#ztorm-modal` 상품등록·btn_rrp_search·btn_ppr_search 핸들러는 이 화면에 트리거 버튼 미렌더 → dead, 생략)

### 정렬 (legacy)

- orderby: `c.valid_from desc`.

## 데이터 (legacy)

- `AdminGoods::getZtormPromotion($page, $add_where, $orderby, $param)` — **50/page**.
- 컬럼: product_code, product_name, item_id, item_name, item_publisher, product_srp, percent, promotion_start, promotion_end.

## API 계약 (백엔드 전달)

### `GET /admin/ztorm/promotions`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |

백엔드 책임: orderby `valid_from desc`.

응답: `{ items: ZtormPromotionItem[], pagination }`

### `POST /admin/ztorm/promotion-sync` — `{}` → `{ success, message }` (ztorm_api promotion)
- 프론트: 성공 시 Ztorm 쿼리 invalidate(=reload, alert 없음).

## 타겟 매핑

- 라우트: `routes/goods/ztorm/ztorm_promotion.tsx` → `/goods/ztorm/ztorm_promotion`
- screens: `screens/ztorm-promotion`
- entities: `ztorm` 확장 — `ZtormPromotionSearch`/`ZtormPromotionItem`/`ZtormPromotionResponse`, `fetchZtormPromotion`/`syncZtormPromotion`, `useZtormPromotion`/`useSyncZtormPromotion`
- shared: `shared/ui/ServerPagination`
- mock: `ztorm.ts` — `ZTORM_PROMOTION_LIST` + `GET /promotions` + `POST /promotion-sync`

## Parity 체크리스트

- [ ] 화면 요소 일치 (상단바/10컬럼)
- [ ] 필드/포맷 일치 (SRP number_format, Discount SRP 계산, percent)
- [ ] 분기/플로우 일치 (캠페인 동기화 → reload(alert 없음), 50/page)
- [ ] 엣지케이스 일치 (모달·rrp/ppr dead 생략)
