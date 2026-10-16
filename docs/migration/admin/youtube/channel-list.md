# Youtube 채널 현황

## 원본
- 파일: `pc/_Admin_/youtube/youtube_channel_list.php` (변형/테스트 파일 없음 — 단일 라이브 버전)
- 연동 AJAX: `pc/_Admin_/youtube/youtube_api.php` (`mode=channel_info`)
- 도메인 클래스: `src/classes/AdminGoods.php::getYoutubeChannelList()` (L949)
- 참조 문서: `docs/legacy-admin/21-goods-stock-integration.md` (§Youtube)

## 화면·플로우
- 진입 URL/파라미터: `/youtube/youtube_channel_list.php?page=&search_channelId=&search_channel_name=`
  - `page` 없으면 1
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / 상품 / Youtube 동영상 관리 / **Youtube 채널 현황**, page-title `Youtube 채널 현황`
  - 검색 카드 "Youtube 채널 검색": `channelId`(col-3), `채널명`(col-5) 입력 + `Youtube 채널 검색` 제출 버튼 (method=get)
  - 총 건수 `number_format(total_results) 개` (float-start)
  - 리스트 카드 "Youtube 채널 리스트" 9컬럼:
    번호 / 채널로고(`<img src=thumbnails>`) / channelId / 채널명(channelTitle) / 채널주소(`<a href="https://www.youtube.com/{customUrl}" target=_blank>{customUrl}</a>`) / 동영상 뷰수(viewCount, number_format) / 구독자수(subscriberCount) / 동영상수(videoCount) / 비고
  - 번호 = `num + (page-1)*50` (오름차순, num은 1부터) — **페이지 오프셋 50 하드코딩** (pagination results_per_page도 50이라 일치)
  - 비고: `customUrl == ""` 인 행에만 `정보 동기화` 버튼 (`data-channelId`) 표시. customUrl 있으면 빈 칸.
  - 하단 페이지네이션 `links_html` (Pagination.php, 50/page → `ServerPagination` 재현)
- 폼 필드/검증: 검증 없음 (빈 값이면 필터 미적용). GET 파라미터가 비어있지 않은 것만 URL param으로 유지(`$param` 재조립).
- 분기/리다이렉트: 없음(단일 목록 화면). `channel_list->success == true`일 때만 tbody 렌더.
- 세션/권한 의존: `lib.php` 관리자 세션 가드(공통). `sidebar_goods.php` 사용, `topmenu['goods']=active`. 별도 admin_level 분기 없음.
- **사이드바 미노출(숨김 메뉴)**: `sidebar_goods.php`의 "Youtube 동영상 관리" 그룹(채널 현황·비디오 현황)은 **전체 `<!-- -->` 주석처리**(L415~433)되어 있다. 화면은 직접 URL로만 접근 가능하고 사이드바 링크는 없다(randombox처럼 죽은 메뉴). → **`widgets/sidebar/model/nav.ts`에 Youtube 그룹을 추가하지 않는다**(legacy 동작 이식).
- AJAX: `정보 동기화` → `GET youtube_api.php?mode=channel_info&channelId=...` → success 시 `location.reload()` (응답 alert은 주석처리 = 미표시). 실패 시 `alert(data)`.

## 데이터 (legacy)
- 도메인 클래스·메서드: `AdminGoods::getYoutubeChannelList($page,$add_where,$orderby,$param)`
- SQL 요약:
  - `select * from youtube_channel where idx>'0' [add_where] order by videoCount desc`
  - `add_where`: `and channelId = '{search_channelId}'` (등호), `and channelTitle REGEXP '{search_channel_name}'` (부분일치)
  - 정렬 고정 `videoCount desc`, 페이징 50/page (Pagination 클래스)
  - 컬럼: idx, channelId, channelTitle, customUrl, thumbnails, viewCount, subscriberCount, videoCount (+reg_date)
- 동기화(channel_info): 외부 Youtube Data API `getChannelById` 호출 → `update youtube_channel set customUrl,thumbnails,viewCount,subscriberCount,videoCount where channelId`.

## API 계약 (백엔드 전달)

### `GET /admin/youtube/channels` — 채널 현황 (50/page)
- 요청(query):
  - `page` number, 기본 1
  - `search_channelId` string (옵션) — `channelId` **정확 일치**
  - `search_channel_name` string (옵션) — `channelTitle` **부분 일치**(legacy REGEXP)
- 응답:
  ```json
  {
    "items": [
      { "channelId": "UC...", "channelTitle": "...", "customUrl": "@handle" | "",
        "thumbnails": "https://...", "viewCount": 0, "subscriberCount": 0, "videoCount": 0 }
    ],
    "pagination": { "current_page": 1, "results_per_page": 50, "total_results": 0, "total_pages": 1 }
  }
  ```
- 백엔드 책임: `where idx>0 [필터] order by videoCount desc`, 50/page. viewCount/subscriberCount/videoCount는 숫자로 반환.

### `POST /admin/youtube/channel-info` — 채널 정보 동기화
- 요청: `{ "channelId": "UC..." }`
- 응답: `{ "success": true }` (legacy는 print_r 덤프를 반환하나 프론트는 응답 본문 미사용 — 성공 시 목록 재조회만)
- 백엔드 책임: **외부 Youtube Data API `getChannelById(channelId)` 호출** 후 `youtube_channel`의 customUrl/thumbnails/viewCount/subscriberCount/videoCount 갱신. (Youtube API key는 백엔드 보관 — legacy는 프론트 노출 상태였으나 이식하지 않음.)
- 프론트 동작: `customUrl == ""` 행에만 버튼 노출 → 성공 시 `YOUTUBE` 쿼리 invalidate(=legacy location.reload 대체).

## 타겟 매핑
- 라우트: `/youtube/youtube_channel_list` (top-level, legacy URL 유지 — steam과 동일 규칙)
- entities: 신규 `entities/youtube` (types/fetcher/queries/index)
- screens: `screens/youtube-channel-list`
- mock: 신규 `shared/mocks/handlers/youtube.ts` + `handlers.ts` 등록
- sidebar: **추가 안 함**(legacy 주석처리 = 미노출 이식)

## Parity 체크리스트
- [ ] 화면 요소 일치 (breadcrumb/검색카드/9컬럼/총건수/페이지네이션)
- [ ] 필드/검증 일치 (channelId 등호 · 채널명 부분일치 · 빈값 미적용 · param 유지)
- [ ] 분기/플로우 일치 (customUrl 빈 행만 동기화 버튼 · 성공 시 재조회 · 오름차순 번호 offset 50)
- [ ] 엣지케이스 일치 (success=false시 빈 tbody · customUrl 있으면 비고 빈칸 · videoCount desc 정렬)
