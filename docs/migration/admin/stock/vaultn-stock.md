# Vaultn 재고확인 (stock 영역)

## 원본
- 파일: `pc/_Admin_/goods/stock/vaultn_stock.php` (라이브)
- **주의**: #139 `goods/vaultn/vaultn_stock.php`(`/goods/vaultn/vaultn_stock`, `runVaultnStock(page)` 서버 페이징)와 **다른 파일**. 이 화면은 stock 사이드바 "Vaultn 재고(API)" 항목이며 전량 로드 후 클라이언트 필터/정렬/페이징.
- 참조: [asset-stock](asset-stock.md), 기존 `entities/vaultn`(재사용 확장)
- 도메인: `Vaultn::runVaultnStockAll()`(외부 API 전량) + DB sku_map(order_system=8 옵션상품 매핑)

## 화면·플로우
- 진입 URL: `/goods/stock/vaultn_stock` (파라미터 없음 — 필터/정렬/페이징은 **전부 클라이언트 상태**)
- breadcrumb: 홈 / 재고 / **Vaultn 재고** / Vaultn 재고확인, page title `Vaultn 재고확인`
- **검색필터**(클라이언트, 서버 재요청 없음):
  - 검색 text(`#searchInput`): sku 또는 title(+매핑 옵션상품코드/명) 부분일치, `초기화` 버튼(`#searchClear`)
  - 구분 select(`#mappedFilter`): 전체(`all`) / **등록상품만(`mapped`, 기본)** / 미등록만(`unmapped`)
  - 정렬 select(`#sortOrder`): **재고 적은순(`stock_asc`, 기본)** / 재고 많은순(`stock_desc`) / 기본순(`default`)
  - 페이지당 select(`#pageSize`): 30 / **50(기본)** / 100 / 전체(`9999`)
- 카운트: `전체: <b>{recordCount}</b>` (+ `loadedCount < recordCount`이면 `(로드됨 N — 일부만 조회됨)` text-danger) `/ 검색결과: <b id="resultCount">`
- **목록 테이블**(`table-dark` thead, 5컬럼, text-nowrap): sku / title(+매핑 옵션상품 목록) / owned(ownedUnits) / total(totalAvailableUnits, number_format) / connections(중첩 테이블 or `—`)
  - title 아래 매핑 옵션상품마다: `(<a href=goods_option_sales_register?product_code=X target=_blank>code</a> name)` + `품절`(bg-danger)/`판매중`(bg-success) 뱃지
  - connections 있으면 중첩 테이블(connectionGuid/connectionName/reservedUnits/networkUnits/total=totalAvailableUnits, number_format), 없으면 `—`
  - **행 강조**: `totalAvailableUnits==0 && 판매중옵션존재(status=0 && soldout≠Y)` → `tr.table-danger`
- **클라이언트 로직(JS 재현)**:
  - 필터: 검색어(data-search 부분일치) + 구분(mapped/unmapped/all)
  - 정렬: **1순위 품절우선**(soldout=Y 옵션 존재 행이 앞) → 2순위 선택 정렬(stock_asc/desc/default)
  - 페이징: pageSize 단위, **10칸 블록 페이저**(« ‹ [숫자10] › », disabled/active)
  - 필터/정렬/페이지당 변경 시 curPage=1 리셋

## 데이터 (legacy)
- `Vaultn::runVaultnStockAll()`: 외부 Vaultn API 전량 재고. 결과 `recordCount`, `loadedCount`(부분 로드 표시), `stockLevelInformation[]`(sku, title, ownedUnits, totalAvailableUnits, connections[]).
- sku_map(DB): `select b.item_id as sku, a.product_code, a.product_name, a.soldout, a.status from tbl_goods_item_delivery b inner join tbl_goods_item a on a.product_code=b.product_code where b.order_system='8' and a.status<>'3'` → sku별 옵션상품 배열.
- connections[]: connectionGuid, connectionName, reservedUnits, networkUnits, totalAvailableUnits.

## API 계약 (백엔드 전달)
- `GET /admin/goods/stock/vaultn` — Vaultn 전량 재고 + sku↔옵션 매핑 (파라미터 없음)
  - 응답 `200`:
    ```jsonc
    {
      "recordCount": 0,
      "loadedCount": 0,          // 선택 — recordCount보다 작으면 부분 로드 경고
      "stockLevelInformation": [
        {
          "sku": "string", "title": "string",
          "ownedUnits": 0, "totalAvailableUnits": 0,
          "connections": [
            { "connectionGuid": "string", "connectionName": "string",
              "reservedUnits": 0, "networkUnits": 0, "totalAvailableUnits": 0 }
          ],
          "options": [   // sku_map 매핑(order_system=8, status≠3)
            { "product_code": "string", "product_name": "string", "soldout": "N|Y", "status": "0" }
          ]
        }
      ]
    }
    ```
  - **백엔드 책임**: runVaultnStockAll(외부 API) + sku_map(order_system=8·status≠3) 조인해 `options` 동봉. 필터/정렬/페이징은 프론트가 처리하므로 서버는 전량 반환. 관리자 세션 강제.
- 에러: legacy는 Vaultn 실패/DB 실패 시 빈 매핑으로 진행(sku_map=[]).

## 타겟 매핑
- 라우트: `routes/goods/stock/vaultn_stock.tsx`(파라미터 없음)
- screens: `screens/stock-vaultn-stock`(#139 `screens/vaultn-stock`와 별개) / entities: `entities/vaultn` 확장(`fetchVaultnStockAll`/`useVaultnStockAll`/`VaultnStockAllItem`·`VaultnStockAllOption`·`VaultnStockAllResponse`, connections는 기존 `VaultnStockConnection` 재사용)
- mock: `shared/mocks/handlers/vaultn.ts` 확장(신규 핸들러 `/admin/goods/stock/vaultn`)
- 페이징: **ServerPagination 아님** — legacy 커스텀 10칸 블록 페이저를 컴포넌트 내부에서 클라이언트 렌더(shared 승격은 rule of two 전까지 로컬)
- 옵션상품 링크: `/goods/goods_option_sales_register?product_code=`(#40 이관 완료 라우트)

## Parity 체크리스트
- [ ] 검색/구분(mapped 기본)/정렬(stock_asc 기본)/페이지당(50 기본) 클라이언트 동작
- [ ] 품절우선 정렬 → 선택정렬 2순위·행강조(재고0&판매중)·10칸 블록 페이저
- [ ] title 매핑 옵션 목록·링크·품절/판매중 뱃지·connections 중첩 테이블/—
- [ ] 전체/로드됨 경고/검색결과 카운트·엣지(빈 목록·미매핑)
