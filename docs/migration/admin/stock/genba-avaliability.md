# Genba availability webhook log

## 원본
- 파일: `pc/_Admin_/goods/stock/genba_avaliability.php` (라이브, read-only 목록)
- 참조: `../legacy-project/docs/STOCK-MANAGEMENT.md`(부록 A — AdminStock는 이 로그만 보유)
- 도메인: `AdminStock::getGenbaAvaliabilityLog`

## 화면·플로우
- 진입 URL: `/goods/stock/genba_avaliability` — GET `page`, `search_key`, `search_value`
- 세션/권한: `lib/lib.php` 가드. topbar `stock`, sidebar_stock.
- breadcrumb: 홈 / 재고 / **Genba Webhok Log**(legacy 오타 그대로) / Genba availability webhook log, page title `Genba availability webhook log`
- **검색필터 카드**("검색필터", `bg-secondary`), GET form:
  - search_key select(`col-sm-3`): sku(`search_sku`) / name(`search_name`)
  - search_value text(`col-sm-9`)
  - hidden page, 제출 " 검색"(btn-primary, text-center) — legacy 라벨 앞 공백 포함
- **목록 테이블**(colgroup 6열 `15/15/20/8/15/10%`, `table-dark` thead):
  1. transactionid
  2. sku
  3. name(item_name, text-start)
  4. Status(status)
  5. Message(message)
  6. 날짜(reg_date)
- ServerPagination(**20/page** — 아래 참조)
- **dead code(미이관)**: 하단 `<script>`의 btn_stock_chk/btn_stock_batch/btn_goods_option_stock_download 핸들러는 이 페이지에 해당 버튼이 없는 복붙 잔재 → 무시. PHP의 `$asset_id`/`$asset_name` where 분기도 GET에서 안 오는 미정의 변수라 항상 미적용 → 무시.

## 데이터 (legacy)
- `getGenbaAvaliabilityLog($page,$add_where,$orderby,$param)`:
  `select a.*,b.product_code,b.item_name from directgames.genba_webhook_log a inner join tbl_goods_item_delivery b on a.sku=b.item_id where a.webhook_type='avaliability' {add_where} order by {orderby}`
  - **`results_per_page`는 메서드 내부 하드코딩 `'20'`** — 페이지가 넘긴 `'30'`은 메서드 시그니처(4파라미터)에서 무시됨 → **20/page**.
  - orderby `reg_date desc`.
  - 검색: `search_sku` → `a.sku='v'` / `search_name` → `b.item_name like '%v%'`
- 표시 컬럼: transactionid, sku, item_name, status, message, reg_date (a.* + b.item_name).

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/genba-availability` — Genba availability webhook 로그
  - 쿼리: `page`, `search_key`(search_sku|search_name), `search_value`
  - 응답 `200`:
    ```jsonc
    {
      "items": [
        { "transactionid": "string", "sku": "string", "item_name": "string",
          "status": "string", "message": "string", "reg_date": "YYYY-MM-DD HH:MM:SS" }
      ],
      "pagination": { "total_results": 0, "total_pages": 0 }
    }
    ```
  - **백엔드 책임**: `genba_webhook_log ⋈ tbl_goods_item_delivery(sku=item_id)`, `webhook_type='avaliability'`, order `reg_date desc`, **20/page**. search_sku→`a.sku` 등호·search_name→`b.item_name` LIKE. 관리자 세션 강제.
- 에러: legacy PDOException 시 `Error!: <msg>`.

## 타겟 매핑
- 라우트: `routes/goods/stock/genba_avaliability.tsx`(search 3종)
- screens: `screens/genba-avaliability` / entities: `entities/genba-availability-log`(list only, mutation 없음)
- mock: `shared/mocks/handlers/genba-availability-log.ts`(+등록)
- 재사용: `shared/ui/ServerPagination`(20/page). 코드 드롭다운·mutation 없음(단순 read-only)

## Parity 체크리스트
- [ ] 검색키 2종(sku/name)·검색·선택 유지
- [ ] 6컬럼(colgroup 폭)·breadcrumb 오타(Webhok)·페이지 20/page
- [ ] reg_date desc 정렬(백엔드)·엣지(빈 목록)
- [ ] dead 버튼/JS 미이관 확인
