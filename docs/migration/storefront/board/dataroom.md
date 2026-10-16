# 자료실 (board/dataroom)

## 원본
- 파일: `pc/board/dataroom.html`(목록) + `pc/board/dataroom_ps.php`(다운로드 처리)
- 도메인 클래스: `src/classes/Dataroom.php::getDataroomList` / `setDataroomLog`
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/BOARD-CONTENT.md`
- 선례: `entities/board-notice`, 로그인/쿠폰(client fetch mutation), `card-list.css`(home), member/session mock(쿠키 로그인 판정)

## 화면·플로우
- 진입 URL: `/board/dataroom.html` (헤더 드롭다운 링크; aside_customer에는 주석). `?page` 지원하나 UI엔 페이지네이션 없음.
- 레이아웃: `wrap` > `container my-3 pb-5` > main > `section#content.content.rounded-0` (aside 없음)
  - `div.top_banner` > 외부 배너 img(`https://image.directg.net/h8a6cl5Nrp` alt "다이렉트 게임즈 자료실" w-100)
  - 안내 카드 `div.card.shadow-none.rounded-0.mb-3.p-3.font-14.bg-darkgray.text-secondary` > `ul` 4개 li(회원 전용/무단배포 제한/기간·횟수 제한/메가 제공)
  - `div.thumb_data` 카드 그리드: 각 항목 `div.card.rounded-0.bg-card.border-0.p-0.flex-shrink-0`
    - thumb-area: `img[src=/upload/dataroom/{thumbnail}]` `onerror=visibility:hidden` + `label_area` > `span.label.bg-warning...` **"월페이퍼"(하드코딩)**
    - content-area: `title-area`(file_name) + info-area `ul`(배포일자 {deploy_date} / {contents}) + `button.btn-file[data-idx][data-url=file_url]` 다운로드 아이콘
- **페이지네이션 UI 없음**(legacy가 `links_html` 미렌더, page1 목록만)
- 다운로드 인터랙션(legacy jQuery AJAX): 버튼 클릭 → `POST dataroom_ps.php {file_url,idx}` → `status==error`면 `alert(error_msg)`, 아니면 `window.open(file_url,"_blank")`
- 폼/검증: 없음. **세션**: 목록은 공개, **다운로드는 로그인 필수**(POST에서 세션 체크)

## 데이터 (legacy)
- `getDataroomList`: `SELECT idx,file_type,file_name,file_url,thumbnail,contents,is_encode,encode_type,deploy_date,is_free,patch_no FROM tbl_dataroom WHERE 1=1 [add_where] ORDER BY reg_date DESC` (add_where: `is_free='Y' and is_view='Y'`). 20/page(pagination 객체이나 UI 미사용). 표시 필드: thumbnail·file_name·deploy_date·contents·idx·file_url (나머지 select됐으나 미사용)
- `dataroom_ps.php`: `$_SESSION['member']['m_id']` 없으면 `{status:error, error_msg:"로그인 이후에 이용가능합니다."}`; 있으면 `{m_id, status:success, file_url}` + `setDataroomLog(m_no,m_id,idx)`
- `setDataroomLog`: `INSERT INTO tbl_dataroom_log SET m_no,m_id,parent_idx,download_count=1 ON DUPLICATE KEY UPDATE download_count=download_count+1`

## API 계약 (백엔드 전달)
- `GET /api/board/dataroom?page=N` → `{ list: DataroomItem[] }`
  - `DataroomItem { idx, file_name, file_url, thumbnail, contents, deploy_date }`
  - 백엔드 책임: `is_free='Y' and is_view='Y'`, `order by reg_date DESC`, 20/page(현재 UI는 page1만 사용)
- `POST /api/board/dataroom/download` body `{ idx, file_url }` → 
  - 비로그인: `{ status: "error", error_msg: "로그인 이후에 이용가능합니다." }`
  - 로그인: `{ status: "success", m_id, file_url }` + 백엔드 `setDataroomLog` (다운로드 카운트 upsert)
  - 세션은 쿠키(기존 확립). 프론트는 브라우저 fetch(쿠키 자동 동봉)

## 타겟 매핑
- 라우트: `app/board/dataroom.html/page.tsx` → `/board/dataroom.html` (server, 목록 fetch)
- screen: `screens/board-dataroom` (server) — 배너/안내 정적 + `<DataroomList>`(client)
- 컴포넌트: `screens/board-dataroom/ui/dataroom-list.tsx` (`'use client'`) — 카드 그리드 + 썸네일 onError 숨김 + 다운로드 버튼(fetch→window.open/alert)
- entities: `entities/board-dataroom` (`getBoardDataroom` server list, `postDataroomDownload` client mutation)
- 자산/CSS: `card-list.css`(기존) 링크. `?d=time()` 캐시버스트는 동작 무관 → 정적 링크
- mock: `shared/mocks/fixtures/board-dataroom.ts` + handler `GET */api/board/dataroom`, `POST */api/board/dataroom/download`(쿠키 로그인 판정)

## 단위 경계 결정 / quirk
1. 다운로드 jQuery AJAX → client fetch(login/coupon 확립 패턴). 성공 window.open·비로그인 alert 재현. 세션=쿠키.
2. 페이지네이션 UI 미렌더(legacy 동일).
3. "월페이퍼" 배지 하드코딩(데이터 아님) 유지.
4. 썸네일 onError 숨김 재현(client). `/upload/dataroom/*`는 dev 미존재 → 대부분 숨김(legacy도 broken 시 숨김).
5. `contents`는 legacy raw echo → `dangerouslySetInnerHTML`. file_name은 평문(파일명, 텍스트).
6. 카드 그리드를 client 컴포넌트로 하되 Next SSR로 초기 렌더 유지(콘텐츠 SSR parity).
7. dataroom.html 하단 per-page jQuery/Bootstrap 로드는 미재현(Bootstrap 전역, jQuery 미사용).

## Parity 체크리스트
- [ ] 배너 + 안내 4항목 + 카드 그리드(썸네일·월페이퍼 배지·file_name·배포일자·contents·다운로드 버튼)
- [ ] 다운로드: 비로그인 alert("로그인 이후에 이용가능합니다."), 로그인 window.open(file_url)
- [ ] 페이지네이션 UI 없음
- [ ] SEO(title 자료실/viewport/description 빈값/author H2interactive/favicon)
