# 대표상품 동영상 설정 (#25)

> 영역: 상품 > 대표상품 관리 > (단일) 동영상 설정. sub_sidebar_title "동영상 설정".

## 원본
- 파일: `pc/_Admin_/goods/title_media_register.php` (285줄). 처리: `title_ps.php` mode=add_youtube(1048~1058)/delete_youtube(1059~1066). 포함: sub_sidebar_title(media active).
- 도메인: `Admin::getGoodsMediaList`, `AdminGoods::getYoutubeVideoSearch`(YouTube API 검색).
- 참조: [title-view](title-view.md), [title-tag](title-tag.md).

## 화면·플로우
- 진입: `/_Admin_/goods/title_media_register.php?title_id=` → 타겟 `/goods/title_media_register?title_id=`. 레이아웃 col-2 sub-nav + **col-7**(단일 카드).
- 로드: tbl_goods(명), getGoodsMediaList(등록 영상), getYoutubeVideoSearch(title_name_en 기반 유튜브 검색 → 이미 등록된 것 제외).
- breadcrumb: 홈/상품/대표상품 관리/동영상 설정. 타이틀 `{title_name} <small>({en})</small>`.
- 카드 "대표상품 동영상정보":
  - **iframe media_player**(src=media[0].media_url).
  - **등록 영상 목록**: foreach media → col-2 썸네일(youtube_media_id, `img.youtube.com/vi/{id}/mqdefault.jpg`, 유튜브 아이콘). **썸네일 클릭 → iframe src 전환**. 영상삭제 버튼(product_viewer 숨김, data-youtubeidx=idx).
  - **영상 추가 폼**: input-group 접두 "https://www.youtube.com/embed/" + input(youtube_media_id, required) + "영상추가" 버튼(btn_youtube_register).
  - **card-footer 검색결과**: foreach video_list → 카드(썸네일 + 제목 + videoId + channelTitle + 등록일(date Y-m-d H:i:s) + 조회수(number_format)) + "등록" 버튼(btn_video_register → 해당 videoId 추가).
- 인터랙션(모두 title_ps.php + location.reload):
  - **add_youtube**: 수동 input 또는 검색결과 "등록" → INSERT tbl_goods_media(media_type=video, youtube_media_id, media_thumb=mqdefault.jpg, media_url=embed/{id}, media_sort=0). reload.
  - **delete_youtube**: 영상삭제 → delete tbl_goods_media where idx. reload.

## 데이터 (legacy)
- 로드: getGoodsMediaList(tbl_goods_media video) + getYoutubeVideoSearch(YouTube API, title_name_en REGEXP) − 등록분 제외.
- **add_youtube**(title_ps 1048~): INSERT tbl_goods_media SET media_type='video', youtube_media_id, media_thumb='mqdefault.jpg', media_url='https://www.youtube.com/embed/'+id, media_sort='0', title_id.
- **delete_youtube**(1059~): `delete from tbl_goods_media where idx=:youtube_idx`.

## API 계약 (백엔드 전달)
- **`GET /admin/goods/titles/:titleId/media`** — 응답 `{ title_id, title_name, title_name_en, media: TitleMedia[], candidates: VideoCandidate[] }`. media=`{ youtube_media_id, media_thumb, media_url }`. candidates=YouTube 검색결과(등록분 제외) `{ videoId, thumbnails, title, channelTitle, publishedAt(unix), viewCount }`. 없으면 404.
- **`POST /admin/goods/titles/:titleId/media`** — add_youtube. body `{ youtube_media_id }`. 서버: embed URL 조립 INSERT. 응답 `{ success }`.
- **`DELETE /admin/goods/titles/:titleId/media/:youtubeMediaId`** — delete_youtube(#21에서 이미 정의, idx 대신 media_id로 삭제 — mock 단순화). 응답 `{ success }`.

## 타겟 매핑
- 라우트: `routes/goods/title_media_register.tsx`(search title_id) → `screens/title-media`.
- 위젯: `widgets/title-sub-nav`(active="media").
- entities/goods-title 확장: `TitleMediaSettings`/`VideoCandidate`/`AddMediaRequest` 타입, `fetchMediaSettings`+`useMediaSettings`, `addTitleMedia`+`useAddTitleMedia`. 삭제는 기존 `useDeleteTitleMedia` 재사용.
- mock: 기존 mediaStore 재사용. GET media(media + 샘플 candidates − 등록분 제외), POST media(mediaStore에 추가). DELETE 기존.
- 시각: 카드/썸네일/검색결과 legacy 클래스 그대로. 썸네일 클릭 전환. product_viewer 숨김 미반영(기존 단위 동일). 유튜브 검색은 백엔드 책임(mock 샘플 candidates).

## Parity 체크리스트 (셀프 검증 완료 — 개발자 승인 대기)
- [x] 레이아웃(col-2 sub-nav + col-7) + iframe + 썸네일
- [x] 썸네일 클릭 전환, 영상삭제(useDeleteTitleMedia)
- [x] 영상추가 폼(수동 id) 추가(useAddTitleMedia)
- [x] 검색결과 카드 + 등록 버튼(추가), 등록분 제외
- 보류: product_viewer 버튼 숨김 미반영(기존 단위 동일). YouTube 검색(getYoutubeVideoSearch)은 백엔드 책임 — mock 고정 샘플 candidates. delete는 idx 대신 media_id로 삭제(#21과 동일 mock 단순화).
- 기계 검증: tsc 0 / lint 0 / build 성공.
