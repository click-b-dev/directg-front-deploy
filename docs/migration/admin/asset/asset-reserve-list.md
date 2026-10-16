# Asset 예약현황 (Asset 서버 관리 API)

## 원본
- 파일: `pc/_Admin_/goods/asset/asset_reserve_list.php` (read-only 목록) + `asset_ps.php`(mode=`assets_reserve_list`)
- 참조: [asset-list](asset-list.md)(#160), `../legacy-project/docs/STOCK-MANAGEMENT.md`(예약 유형)
- 도메인: `Asset::runReserveList`

## 화면·플로우
- 진입 URL: `/goods/asset/asset_reserve_list` — GET `page`, `ordno`(주문번호/po), `owner`(회원아이디), `cancelled`(all/0/1)
- 세션/권한: `lib/lib.php` 가드. topbar `stock`, sidebar_stock.
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset 예약현황**, page title 동일
- **검색필터 카드**("예약(Reserve) 검색필터"): 회원아이디(owner, placeholder `회원아이디 (M/ 자동보정)`) / 주문번호(ordno, placeholder `주문번호(po)`) / 취소여부 radio(전체=all[기본]·취소건 제외=0·취소건만=1) / 제출 "예약 검색"(float-end)
- 카운트: `총 <strong id="total" text-danger>{n}</strong> 개`(AJAX totalElements)
- **목록**(card>card-body p-0, `table-dark` thead, 8컬럼): Reserve ID(id) / Asset ID(assetId) / Asset 이름(title, eng span) / 주문번호(po → settle_no 있으면 order_view 링크) / 소유자(owner, eng span → m_no 있으면 member_view 링크) / 예약일시(reserveDt) / 상태(cancelled ? "취소" : "정상") / 취소정보(cancelled면 cancelDt + `<br/>` canceller)
  - 빈 목록: `<td colspan="8" text-center text-muted py-3>조회된 예약이 없습니다.</td>`
- 페이징: renderPaging(→`shared/ui/Pagination`, baseUrl `asset_reserve_list.php`+params, size=30) — URL
- 데이터 로딩: AJAX(POST asset_ps.php, mode=assets_reserve_list). 검색 제출 시 page=1.

## 데이터 (legacy)
- `runReserveList($page,$size,urlencode($ordno),urlencode($owner),$cancelled)`: 외부 Asset API. content 각 항목 `id,assetId,title,po,owner,reserveDt,cancelled,cancelDt,canceller`.
- **필터 보정(백엔드)**: `cancelled=='all'`→`''`(전체·미전달). `owner` trim 후 `M/` 접두 없으면 `M/{owner}` 보정. ordno/owner urlencode(owner 슬래시 %2F). size **30**.
- **po→settle_no/m_no 매핑**: content의 po로 `tbl_order_item(ordno,settle_no,m_no)` 일괄 조회 → 각 행에 settle_no·m_no 부착(order_view/member_view 링크용, 없으면 빈값).

## API 계약 (백엔드 전달)
- `GET /admin/goods/asset/reserves` — Asset 예약 목록
  - 쿼리: `page`, `ordno`, `owner`, `cancelled`(all|0|1)
  - **백엔드**: cancelled all→미필터. owner `M/` 보정 + urlencode(ordno/owner). runReserveList(30/page). content po→tbl_order_item로 settle_no·m_no 부착. 관리자 세션 강제.
  - 응답 `200`:
    ```jsonc
    {
      "content": [
        { "id": "string", "assetId": "string", "title": "string", "po": "string",
          "owner": "string", "reserveDt": "string", "cancelled": false,
          "cancelDt": "string", "canceller": "string",
          "settle_no": "string", "m_no": "string" }
      ],
      "totalElements": 0,
      "totalPages": 0
    }
    ```
- 에러: legacy PDOException 시 `Error!: <msg>`.

## 타겟 매핑
- 라우트: `routes/goods/asset/asset_reserve_list.tsx`(search 4종)
- screens: `screens/asset-reserve-list` / entities: `entities/asset` 확장(`fetchAssetReserveList`/`useAssetReserveList`)
- mock: `shared/mocks/handlers/asset.ts` 확장(`/admin/goods/asset/reserves` GET)
- 재사용: `shared/ui/Pagination`(30/page). mutation 없음(read-only). po/owner 링크는 미이관 라우트(`/order/order_view`·`/member/member_view`, settle_no/m_no 있을 때만)·eng span 유지

## Parity 체크리스트
- [ ] 필터 3종(owner/ordno/cancelled radio 기본 all)·선택 유지·제출 page=1
- [ ] 8컬럼·상태(취소/정상)·취소정보(cancelDt+canceller)·eng span
- [ ] po→order_view(settle_no) / owner→member_view(m_no) 조건부 링크
- [ ] 빈 목록 colspan=8 문구·Pagination(30/page·URL)
