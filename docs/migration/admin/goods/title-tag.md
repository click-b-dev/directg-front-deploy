# 대표상품 태그정보 설정 (#24)

> 영역: 상품 > 대표상품 관리 > (단일) 태그정보 설정. sub_sidebar_title "태그정보 설정".

## 원본
- 파일: `pc/_Admin_/goods/title_tag_register.php` (385줄). 처리: `title_tag_ps.php` mode=tag_save. 포함: sub_sidebar_title(tag active).
- 도메인: `Admin::getTagList/getTagGroupInfo/getTagCode`, `getSteamTagKo/getSteamGamesGenre/getSteamGamesCategory`(스팀 추천).
- 참조: [title-grac](title-grac.md), [title-view](title-view.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_tag_register.php?title_id=` → 타겟 `/goods/title_tag_register?title_id=`. 레이아웃 col-2 sub-nav + col-10.
- 로드: getTitle(title_code/명/genre/category/steam_appid) + getTagList(그룹별 태그 마스터). 스팀 태그/장르/카테고리 추천 조회 후, **각 태그의 checked** 결정.
- breadcrumb: 홈/상품/대표상품 관리/태그정보 설정. 타이틀 `{title_name} <small>({en})</small>`.
- 상단 우측 저장 "대표상품 태그저장"(아이콘, product_viewer 숨김).
- 폼(frm → title_tag_ps.php, mode=tag_save): tag_group_code 접두어로 섹션 카드 분류:
  - **title_code==33**: 디지털상품 장르 정보(`G0*`, genre[]) / 디지털상품 카테고리 정보(`C*`, category[]) / 홀로모델 장르 정보(`HG*`, genre[]) / 홀로모델 카테고리 정보(`HC*`, category[]).
  - **title_code==12**: PS액세서리 카테고리(`P*`, category[]) / Razer (레이저) 카테고리(`R*`, category[]).
  - 각 그룹: col-sm-2 라벨(tag_group_name) + col-sm-10 inline checkbox(그룹 내 태그). genre 그룹 → name=genre[] id=genre{code}, category 그룹 → name=category[] id=category{code}.
- checked 규칙(legacy): 스팀 추천(getSteamTagKo/장르/카테고리)과 매칭되면 checked. **스팀 데이터 없으면 title의 저장된 genre/category 코드로 fallback** → tag_code ∈ title genre/category면 checked. (mock은 fallback 경로만 재현: tag_code ∈ 저장 genre/category.)
- 제출: UPDATE 후 `go("title_tag_register.php?title_id=")` = 자기 페이지 reload.

## 데이터 (legacy)
- 로드: getTitle + getTagList(tag_group_code별 tag_code/tag_name) + getTagGroupInfo(tags_group_name).
- **tag_save UPDATE**(title_tag_ps): `tbl_goods SET genre=implode(',',genre[]), category=implode(',',category[]) WHERE title_id`. 미체크 시 "".

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/tags`** — 응답 `{ title_id, title_name, title_name_en, title_code, groups: TagGroup[] }`. TagGroup=`{ group_code, group_name, tags: { tag_code, tag_name, checked }[] }`. checked는 백엔드가 스팀 추천/저장값 기준 계산. 없으면 404.
- **`PUT /admin/goods/titles/:titleId/tags`** — tag_save UPDATE. body: `{ genre: string[], category: string[] }`(체크된 tag_code). 응답 `{ success }`.

## 타겟 매핑
- 라우트: `routes/goods/title_tag_register.tsx`(search title_id) → `screens/title-tag`.
- 위젯: `widgets/title-sub-nav`(active="tag").
- entities/goods-title 확장: `TagItem`/`TagGroup`/`TitleTags`/`TagsRequest` 타입, `fetchTags`+`useTags`, `updateTags`+`useUpdateTags`(성공 시 invalidate=페이지 유지).
- mock: 모듈 상수 TAG 마스터(G0/C/HG/HC/P/R 그룹). GET tags(checked=tag_code ∈ row.genres/categories 코드). PUT tags(row.genres/categories를 제출 코드→{code,name} 재구성).
- 시각: 카드/체크박스 legacy 클래스 그대로. 접두어 섹션 분류. product_viewer 숨김 미반영. 스팀 추천 매칭은 백엔드 책임(mock은 저장값 fallback만).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav) + 상단 저장 버튼
- [x] title_code 33(장르/카테고리/홀로 4섹션) / 12(PS·Razer 2섹션) 분기
- [x] 그룹 라벨 + 태그 checkbox, 저장값 기준 checked
- [x] 저장 → genre/category 갱신 → 페이지 유지(invalidate), 목록/상세 반영
- 보류: product_viewer 저장버튼 숨김 미반영(기존 단위 동일). 스팀 추천(getSteamTagKo/장르/카테고리) 매칭 checked는 백엔드 책임 — mock은 저장 genre/category 코드 fallback만 재현. 태그 마스터는 mock 샘플(백엔드 getTagList가 실제 소스).
- 기계 검증: tsc 0 / lint 0 / build 성공.
