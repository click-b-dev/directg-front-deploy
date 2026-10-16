# Asset Item(키) 현황 (Asset 서버 관리 API 서브)

## 원본
- 파일: `pc/_Admin_/goods/asset/asset_item_list.php` + `asset_ps.php`(asset_item_list/asset_reserve_cancel)
- 진입: asset_list(#160) "키 사용현황" 버튼(`asset_item_list.php?asset_id=`)
- 참조: [asset-list](asset-list.md)(#160), [asset-modify](asset-modify.md)(#166)
- 도메인: `Asset::runAssetItemListFilter/runAssetDetail/runReserveCancel`

## 화면·플로우
- 진입 URL: `/goods/asset/asset_item_list?asset_id=` — asset_id 필수(없으면 `msg("잘못된 접근…", "asset_list.php")` 리다이렉트), page
- breadcrumb: 홈 / 재고 / **Asset 현황**(asset_list 링크) / Asset Item(키) 현황, page title `Asset Item(키) 현황`
- **Asset 컨텍스트 헤더**(table w-auto): Asset ID / 이름(eng) / 플랫폼(eng) / 공급처(eng) — runAssetDetail. + `← Asset 현황` 링크(우측)
- 카운트: `총 <strong id="total">{n}</strong> 개`(AJAX totalElements)
- **목록**(card>card-body p-0, `table-dark` thead, 9컬럼): Item ID(id, num) / Asset 이름(title, eng) / 등록일시(regDt, num) / 소유자(owner, num) / 주문번호(po, eng) / 예약할당(reserved면 `예약`+reserveDt, 아니면 `미예약`) / 활성화(activated면 `활성`(text-success)+activatedDt, 아니면 `미활성`) / 키(치환명)(key, eng) / 관리
  - 관리: **reserved && !activated && reserveId일 때만** `예약취소` 버튼(btn-outline-secondary)
  - 빈 목록: `<td colspan="9" ...>등록된 키가 없습니다.</td>`
- 페이징: renderPaging(→`shared/ui/Pagination`, baseUrl `asset_item_list.php`+{asset_id}, **size=100, perBlock=20**) — URL
- 액션: **예약취소**(confirm `이 예약(키 할당)을 취소하시겠습니까?`) → mode=asset_reserve_cancel{reserve_id} → 성공(id) `alert("예약취소 완료")`+재조회 / 실패 `alert(message)`. (활성화된 키는 취소 불가 — 버튼 미노출)

## 데이터 (legacy)
- `runAssetItemListFilter($asset_id,$page,$size)`: 외부 API. content 각 항목 `id,title,regDt,owner,po,reserved,reserveDt,reserveId,activated,activatedDt,key`. 반환 content/totalElements/totalPages.
- `runAssetDetail($asset_id)`: 헤더용 title/platform/publisher.
- `runReserveCancel($reserve_id)`: PUT /reserves/{id}/cancel → id/message(활성화 키는 취소 불가).

## API 계약 (백엔드 전달)
- `GET /admin/goods/asset/items` — Asset 키 목록 + 헤더
  - 쿼리: `asset_id`, `page`(size 100 고정)
  - 응답: `{ "asset_id": "string", "asset_name": "string", "platform": "string", "publisher": "string", "content": [{ "id": "string", "title": "string", "regDt": "string", "owner": "string", "po": "string", "reserved": false, "reserveDt": "string", "reserveId": "string", "activated": false, "activatedDt": "string", "key": "string" }], "totalElements": 0, "totalPages": 0 }`
  - 백엔드: runAssetItemListFilter(size 100) + runAssetDetail(헤더). 관리자 세션.
- `POST /admin/goods/asset/reserve-cancel` — 예약(키 할당) 취소. body `{ reserve_id }` → 성공 `{ id }` / 실패 `{ message }`(활성화 키 취소 불가). 관리자 세션.
- 에러: legacy `msg()`/PDOException.

## 타겟 매핑
- 라우트: `routes/goods/asset/asset_item_list.tsx`(search: asset_id/page)
- screens: `screens/asset-item-list` / entities: `entities/asset` 확장(item list/reserve-cancel)
- mock: `shared/mocks/handlers/asset.ts` 확장(items GET, reserve-cancel POST)
- 재사용: `shared/ui/Pagination`(perBlock 20). eng/num span 유지·asset_id 없음 시 alert+리다이렉트·Asset 현황 링크

## Parity 체크리스트
- [ ] asset_id 없음 → alert + asset_list 리다이렉트
- [ ] 컨텍스트 헤더(ID/이름/플랫폼/공급처)·← Asset 현황 링크
- [ ] 9컬럼·예약할당/활성화 셀(여부+일자)·관리 조건부 예약취소·빈목록 colspan=9
- [ ] 예약취소(confirm→성공 재조회/실패 alert)·Pagination(100/page·perBlock 20·URL)
