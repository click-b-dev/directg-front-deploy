# PointNexus API - 오퍼레이션 조회

## 원본

- 파일: `pc/_Admin_/goods/pointnexus/pointnexus_operation.php` (라이브), 공통 `_inc.php`
- 데이터: `PointNexus($mode)->runOperation($id)` — 단건 상세
- 화면 전용 헬퍼 `pn_currency_amount($amount, $currency_code)` → `pnCurrencyAmount` (헬퍼 도입)

## 통화 헬퍼 (pn_currency_amount)

- 기호: KRW→₩, JPY→¥, USD→$, EUR→€, GBP→£
- KRW/JPY(zero-decimal): `number_format((int)amount)` (정수)
- 그 외: `number_format(amount/100, 2)` (최소단위 ×100 가정, 소수 2자리)
- 결과: `기호 공백 금액` (기호 없으면 금액만), amount 빈값이면 ''

## 화면·플로우

- 진입 URL: `/goods/pointnexus/pointnexus_operation?mode&id`
- page_title `PointNexus 오퍼레이션 조회` + h4 `<small>GET /operation/{id}</small>`
- inline style: `.uuid`(11px), `.section-title`, `.label-col`(130px), `.key-display`(대형 키), `.opid-display`
- 필터: 환경(autoSubmit=false) + operation UUID text + "조회"
- state 색상: done=success, pending=warning, failed=danger, cancelled/cancelling=secondary, error=danger (그 외 info)
- type 색상: sale=primary, book=warning, reveal=info, cancel/refund=danger (그 외 secondary)
- 분기:
  - `id` 없음 → alert-info "operationID 를 입력하세요. (sell / book 응답에 포함된 ID)"
  - `error` → alert-danger + pnExtractError
  - `op` 있음:
    - **상태/타입 헤더** 카드: state badge / type badge / operationID(opid-display)
    - **라이선스 키** 카드(capsule.item.key 있을 때만): key-display + 플랫폼(capsule.item.platform)
    - 3카드:
      - **처리량**: qtyToProcess / qtyProcessed(badge success) / qtyInError(>0 danger, else secondary 0) — 각 `!= null`
      - **시각**: createdAt / lastUpdatedAt (`pn_fmt_date`)
      - **상품/빌드**: buildID(uuid 링크→product_view, 있으면) / productVariant.countryCodes(있으면) / capsule.id(uuid 링크→capsule, substr 16+…, 있으면) / 셋 다 없으면 "아직 처리 정보 없음"
    - **결제·수익 배분**(details 있을 때만) 3카드:
      - 판매 가격: sellPrice(`pn_currency_amount`,sellCurrencyCode) / VAT(`vat/100`%) / 환산 가격(sellPriceConverted,convertedCurrencyCode) / 환율(conversionRate) — 각 조건부
      - 정가/프로모션: SRP(할인 전 SRPBeforePromo, convCurr) / SRP(convCurr, 강조) / 프로모션(promoName badge + `promoDiscountPct`% 할인 / "없음")
      - 수익 배분: revSharePct(badge info %) / 퍼블리셔(publisherShareAmount, text-success) / 셀러(sellerShareAmount, text-info)
    - **관련 페이지** 카드(capsule.id 있으면): "캡슐 상세" 버튼(→capsule)
    - `PnJsonBox`
  - 그 외 → alert-warning "데이터 없음"

## API 계약 (백엔드 전달)

### `GET /admin/pointnexus/operation`

- 쿼리: `mode`, `id`(UUID)
- 백엔드 책임: runOperation(id), 원본 반환.
- 응답 `200`:
  ```
  { success: boolean,
    data?: {
      state?, type?, qtyToProcess?, qtyProcessed?, qtyInError?, createdAt?, lastUpdatedAt?, buildID?,
      productVariant?: { countryCodes? },
      capsule?: { id?, item?: { key?, platform? } },
      details?: {
        sellPrice?, sellCurrencyCode?, VAT?, convertedCurrencyCode?, sellPriceConverted?, conversionRate?,
        SRPBeforePromo?, SRP?, promoName?, promoDiscountPct?, revSharePct?,
        publisherShareAmount?, publisherCurrencyCode?, sellerShareAmount?, sellerCurrencyCode?
      }
    } | [...],
    errors?: { message: string }[]
  }
  ```

## 타겟 매핑

- 라우트: `routes/goods/pointnexus/pointnexus_operation.tsx` → `/goods/pointnexus/pointnexus_operation` (mode normalize + id)
- screens: `screens/pointnexus-operation`
- entities: `pointnexus` 확장 — `PnOperation`/`PnOperationDetails`/`PnOperationResponse`, `pnCurrencyAmount`, `fetch/usePointNexusOperation`
- mock: `handlers/pointnexus` 확장 — `GET /admin/pointnexus/operation`
- 링크: product_view/capsule 미이관/이관 → `<a href>`(capsule은 #96 이관됨 — SPA 경로로 이동)

## Parity 체크리스트

- [ ] id 없음/error/데이터 없음 분기
- [ ] 상태·타입 헤더·라이선스 키(조건부)·처리량/시각/상품·빌드 카드
- [ ] details 3카드(통화 변환·VAT·프로모션·수익 배분) 조건부
- [ ] 관련 페이지(capsule)·JSON 박스·h4 "GET /operation/{id}"
