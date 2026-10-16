# 추천 검색어 관리 (#14)

> 영역: 사이트 > 추천 검색어 관리. 단일 화면(슬롯 4칸 + 보관 목록 + 모달 + 5 mutation).

## 원본
- 파일: `pc/_Admin_/site/search_recommand.php` + `search_recommand_ps.php`.
- 도메인: `AdminSite::getSearchRecommandList`(Pagination.php, 20/page).
- 참조: [recommand-list](recommand-list.md), `docs/design-system/admin.md`(모달 = React 제어 재현).

## 화면·플로우
- 진입: `/_Admin_/site/search_recommand.php?page=&search_keyword=` → 타겟 `/site/search_recommand`. sidebar_site, `$page_title="추천 검색어 관리"`.
- breadcrumb: 홈/사이트/추천 검색어 관리 (3단계 — 배너/추천특집과 달리 "관리" 중간 없음).
- **① 노출 슬롯 4칸(고정)** — card "유저페이지 노출 (4칸 고정)":
  - 슬롯 = `recommand_sort`(1~4) + `is_view='Y'` 매핑. 각 슬롯 col-md-3 카드.
  - 채워진 슬롯: 테두리 `border-success`, 헤더 `bg-success text-white`. keyword, `클릭수 : {click_count}`, 링크(link_url 있으면 그 URL, 없으면 `/game/game_search_thumb.html?q={keyword}` 자동). 버튼: `+ 등록`(btn_slot_register, 교체), `수정`(btn_slot_edit), `비우기`(btn_slot_clear).
  - 빈 슬롯: `border-secondary`, 헤더 `bg-light`, "(비어있음)" + `+ 등록`.
- **② 검색어(보관/관리)** — card "검색어":
  - 검색 폼(get): keyword input(`search_keyword`) + 검색 버튼.
  - 카운트 `{total} 개`.
  - 테이블(`table-centered ... table-bordered border-light`, thead `table-primary`, colgroup 25/*/10/30%): 추천검색어 / 링크 URL(있으면 링크, 없으면 자동 검색결과 링크 `text-muted`) / 클릭수 / 슬롯 지정·관리(`select 1~4` + `노출`(btn_assign) + `수정`(btn_slot_edit) + `삭제`(btn_delete)).
  - 페이지네이션(ServerPagination).
- **③ 모달(#slotModal)** — Bootstrap modal(`data-bs-toggle`/`data-bs-dismiss`/`$.modal('show')`). CSS-only → React 상태로 재현. 폼: keyword(required) + link_url(선택, ph "비우면 검색결과로 자동 연결"). hidden mode/slot/idx. 취소/저장.
  - `+ 등록`(btn_slot_register): mode=slot_register, slot=N, 빈 폼, 타이틀 "추천 검색어 N 등록".
  - `수정`(btn_slot_edit): mode=modify, idx, keyword/link 프리필, 타이틀 "추천검색어 수정".

## 데이터 (legacy)
- 슬롯: `select * from tbl_search_recommand where is_del='N' and is_view='Y' order by recommand_sort asc, idx asc` → sort 1~4 첫 매칭을 슬롯에. (슬롯밖/중복은 하단 목록으로.)
- 하단: `select * where is_del='N' [and idx not in (slot_ids)] [and keyword like '%q%'] order by is_view desc, recommand_sort asc, idx desc` + LIMIT 20.
- `tbl_search_recommand` 컬럼: idx, keyword, link_url, click_count(int), recommand_sort(1~4), is_view(Y/N), is_del(Y/N), reg_date.

### mutation (search_recommand_ps.php)
- `slot_register`{slot,keyword,link_url}: slot 1~4 검증. link 빈값 → `/game/game_search_thumb.html?q={keyword}`. **트랜잭션**: 해당 slot의 기존 노출(is_view='Y',sort=slot)을 is_view='N'; 새 행 INSERT(keyword,link_url,recommand_sort=slot,is_view='Y',reg_date=now).
- `slot_assign`{idx,slot}: 트랜잭션: 기존 slot 노출 is_view='N'; idx를 is_view='Y',recommand_sort=slot.
- `slot_clear`{idx}: is_view='N'(비노출 보관).
- `modify`{idx,keyword,link_url}: link 빈값 → 자동. keyword,link_url UPDATE.
- `delete`{idx}: is_del='Y'(완전삭제).

## API 계약 (백엔드 전달)
- **`GET /admin/site/search-recommands`** — query `page`,`search_keyword`. 응답 `{ slots: (SearchRecommandSlot|null)[4], list: { items: SearchRecommandListItem[], pagination } }`.
  - `SearchRecommandSlot`: `{ idx, keyword, link_url, click_count }`(슬롯1~4 순서, 빈 슬롯 null).
  - `SearchRecommandListItem`: `{ idx, keyword, link_url, click_count }`(슬롯 제외 나머지, is_view desc·sort asc·idx desc, 20/page).
- **`POST /admin/site/search-recommands`** — slot_register. body `{ slot, keyword, link_url }`. 서버: slot 검증, link 자동, 트랜잭션(기존 슬롯 비노출 + INSERT). 응답 `{success:true}`.
- **`PUT /admin/site/search-recommands/{idx}`** — modify. body `{ keyword, link_url }`(link 자동). 응답 `{success}`.
- **`POST /admin/site/search-recommands/{idx}/assign`** — body `{ slot }`. 트랜잭션(기존 슬롯 비노출 + 지정). 응답 `{success}`.
- **`POST /admin/site/search-recommands/{idx}/clear`** — is_view='N'. 응답 `{success}`.
- **`DELETE /admin/site/search-recommands/{idx}`** — is_del='Y'. 응답 `{success}`.

## 타겟 매핑
- 라우트: `routes/site/search_recommand.tsx`(search page/search_keyword) → `screens/search-recommand`.
- entities: `entities/search-recommand`(types, fetcher/훅: list/register/modify/assign/clear/delete).
- 모달: 화면 로컬 React 상태(open/mode/slot/idx/keyword/link) — Bootstrap `.modal.fade.show`+`.modal-backdrop` 재현. **fade 애니메이션**: `.show`를 마운트와 동시에 주면 트랜지션이 안 걸리므로, 마운트 후 `requestAnimationFrame`으로 `.show` 부여(fade-in) / 닫을 때 `.show` 제거 후 지연 언마운트(fade-out) — legacy Bootstrap JS의 2단계 동작 재현.
- 재사용: `ServerPagination`. mock: `db/tables/search-recommand` + `handlers/search-recommand`.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] breadcrumb(3단)/제목/슬롯 4칸(채움/빈칸 스타일)·클릭수·자동링크
- [x] 슬롯 버튼(+등록/수정/비우기), 빈 슬롯 +등록
- [x] 보관 목록: 검색·카운트·테이블(자동링크)·슬롯select+노출/수정/삭제·페이지네이션
- [x] 모달: 등록(slot_register)/수정(modify) 열기·프리필·저장, 취소/backdrop 닫기 (React 제어 재현)
- [x] mutation 5종: slot_register(교체)/assign(교체)/clear/modify/delete, confirm 문구
- [x] link 빈값 자동 URL 규칙
- 기계 검증: tsc 0 / lint 0 / build 성공(449 modules).
