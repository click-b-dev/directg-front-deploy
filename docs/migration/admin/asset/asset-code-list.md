# Asset Code 현황 (Asset 서버 관리 API)

## 원본
- 파일: `pc/_Admin_/goods/asset/asset_code_list.php` + `asset_ps.php`(asset_code_list/asset_code_modify/asset_code_delete)
- 참조: [asset-list](asset-list.md)(#160, 모달 패턴)
- 도메인: `Asset::runAssetCodeList/runAssetCodeModify/runAssetCodeDelete`

## 화면·플로우
- 진입 URL: `/goods/asset/asset_code_list` (파라미터 없음 — 그룹 탭은 클라이언트 상태)
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset Code 현황**, page title 동일
- 안내 `alert alert-secondary`: 실시간 코드 그룹별 현황·그룹 탭 선택.
- **그룹 탭**(nav-tabs nav-justified, 4종, 첫 탭 active): PDTP `상품유형 (Product Type)` / ASTP `상품형식 (Asset Type)` / PLFM `플랫폼 (Platform)` / PUBL `공급처 (Publisher)`. 탭 클릭 시 해당 그룹 AJAX 조회, `현재 그룹` 표시 갱신.
- 카운트: `총 <strong id="total">{n}</strong> 개`(list.length) / `현재 그룹: <strong id="cur_group">{group}</strong>`
- **목록 테이블**(table-responsive, `table-dark` thead, 6컬럼, **페이징 없음**): 번호(index+1) / 코드(ID)(id, eng) / 그룹(groupId or id[0:4], eng) / 시퀀스(subId or id[4:], eng) / 코드명(name, w-100) / 관리(수정·삭제)
  - 빈 목록: `<td colspan="6" ...>조회된 코드가 없습니다.</td>`
- **수정 모달**(React 제어, BS JS 미로드): 코드(ID)(readonly) + 코드명(required) + 취소/수정. 트리거 버튼 data-code/data-name로 프리필.
- 액션:
  - **수정**: mode=asset_code_modify{code_id, name} → 성공(id) 모달 닫고 `alert("코드 수정 완료")`+현재 그룹 재조회 / 실패 `alert(message)`. (name 빈값이면 `alert("코드명을 입력하세요.")` 후 중단)
  - **삭제**: confirm(`코드 [{code}] {name} 을(를) 삭제하시겠습니까?`) → mode=asset_code_delete{code_id} → 성공(id) `alert("코드 삭제 완료")`+재조회 / 실패 `alert(message)`

## 데이터 (legacy)
- `runAssetCodeList($group_id)`: 외부 API. group_id는 **PDTP/ASTP/PLFM/PUBL만 허용**(그 외 빈 content). content 각 항목 `id, groupId?, subId?, name`.
- `runAssetCodeModify($code_id, $name)`: 이름만 변경 → id/message. `runAssetCodeDelete($code_id)`: → id/message.

## API 계약 (백엔드 전달)
- `GET /admin/goods/asset/code-list` — 그룹별 코드 목록(페이징 없음)
  - 쿼리: `group_id`(PDTP|ASTP|PLFM|PUBL)
  - 응답: `{ "content": [{ "id": "string", "groupId": "string", "subId": "string", "name": "string" }] }` (groupId/subId 없으면 프론트가 id[0:4]/id[4:]로 파생)
  - 백엔드: group_id 화이트리스트 검증(그 외 빈 content). 관리자 세션.
- `POST /admin/goods/asset/code-modify` — 코드명 수정. body `{ code_id, name }` → 성공 `{ id }` / 실패 `{ message }`. 관리자 세션·입력값 검증.
- `POST /admin/goods/asset/code-delete` — 코드 삭제. body `{ code_id }` → 성공 `{ id }` / 실패 `{ message }`. 관리자 세션.
- 에러: legacy `msg()`/PDOException.

## 타겟 매핑
- 라우트: `routes/goods/asset/asset_code_list.tsx`(파라미터 없음)
- screens: `screens/asset-code-list` / entities: `entities/asset` 확장(code-group list/modify/delete)
- mock: `shared/mocks/handlers/asset.ts` 확장(code-list GET, code-modify/code-delete POST)
- 재사용: 그룹 탭·현재 그룹은 React state(기본 PDTP). 수정 모달은 React 제어(#160 선례)·eng span 유지. 페이징 없음

## Parity 체크리스트
- [ ] 4탭(PDTP 기본)·탭 전환 재조회·현재 그룹 표시·총 건수
- [ ] 6컬럼(번호 index+1·코드/그룹/시퀀스 eng·groupId/subId 파생)·빈목록 colspan=6
- [ ] 수정 모달(이름 required·성공 닫기+재조회+alert/실패 alert)
- [ ] 삭제(confirm 문구·성공 재조회+alert/실패 alert)
