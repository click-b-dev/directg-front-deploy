# 자료실 파일 등록/수정

## 원본
- 파일: `pc/_Admin_/board/dataroom_register.php` + `dataroom_ps.php`(register/modify/product_*) + `AdminDataroom::setDataroom/updateDataroom/updateDataroomImg`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§자료실 파일 등록), `BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/dataroom_register?mode&idx`
  - register(사이드바 없음 — 목록 등록 버튼, mode 기본 register) / modify(목록 수정 아이콘 `mode=modify&idx=`)
- 화면 요소 (legacy 기준, `col-8` 폼, `enctype=multipart/form-data`):
  - breadcrumb: 홈/게시판/자료실 관리/**자료실 파일 등록**($page_title), h4·`<title>` 동일(양 모드 "자료실 파일 등록")
  - **visible mode/idx 입력**: legacy는 `<input type="text" name="mode">`, `<input type="text" name="idx">`(hidden 아님 — quirk, 그대로 이식)
  - 필드:
    - `* 파일유형` radio(file_type: P 한글패치 / C 컨텐츠)
    - `* 제공 파일명` text(file_name)
    - `* 제공 파일 URL` text(file_url)
    - `* 암호화 여부` radio(is_encode: Y / N)
    - `* 암호화 방식` radio(encode_type: base64 / md5 / N 없음)
    - `* 제공조건` radio(is_free: Y 무료 / N 유료)
    - `* 노출여부` radio(is_view: Y 노출 / N 숨김) — **register 기본 N(숨김) checked**
    - `* 배포일자` text(deploy_date, `data-mask-format="0000-00-00"` 날짜만, placeholder `예)YYYY-MM-DD`) → input-mask
    - `썸네일` file(thumbnail) — **modify 시 현재 썸네일 이미지**(`/upload/dataroom/{thumbnail}`) 표시
    - `설명` textarea(contents) → **SimpleMDE**(제출 시 `simplemde` hidden으로 값 전송) → `shared/ui/MarkdownEditor`
    - 저장 버튼 `자료실 파일 저장`
- 폼필드/검증: 없음(required 없음).
- 분기/리다이렉트: register → `go("dataroom_file.php")` / modify → `go("dataroom_view.php?idx=")`(#123 미이관)
- 세션/권한: `$_SESSION['admin']`(공통).

### legacy quirk (그대로 이식)
- mode/idx가 `type="text"`(visible) — 폼 상단에 노출. 그대로 이식(단, 로직은 search param 사용).
- 설명은 SimpleMDE 값을 `simplemde` hidden으로 전송, 처리기는 `$contents=$simplemde`(마크다운 원문 저장, HtmlConverter 주석처리됨).
- 썸네일은 서버가 `microtime().jpg`로 파일명 생성(원본명 무시) — 백엔드 책임. 프론트는 파일 선택만.
- **product_search/product_add 빈 케이스 dead**(폼에도 UI 없음) → 미이식.
- register는 사이드바 링크 없이 목록 "자료실 파일 등록" 버튼으로만 진입.

## 데이터 (legacy)
- 로드(modify): `SELECT * FROM tbl_dataroom WHERE idx=:idx`
- 등록: `AdminDataroom::setDataroom(file_type,file_name,file_url,thumbnail,contents,is_encode,encode_type,deploy_date,is_free,is_view)`
- 수정: `updateDataroom(idx,file_type,file_name,file_url,contents,is_encode,encode_type,deploy_date,is_free,is_view)` + 썸네일 있으면 `updateDataroomImg(idx,thumbnail)`
- 썸네일: `move_uploaded_file` → `/upload/dataroom/{microtime}.jpg`

## API 계약 (백엔드 전달)
- `GET /admin/board/datarooms/{idx}` — 상세(수정 폼 로드 · #123 상세 공용)
  - 응답: `{ idx, file_type, file_name, file_url, is_encode, encode_type, is_free, is_view, deploy_date, contents, thumbnail }`
    - `contents`: 원문 마크다운(편집용). 없는 idx는 404.
- `POST /admin/board/datarooms` — 등록(register)
  - 요청: `{ file_type, file_name, file_url, is_encode, encode_type, is_free, is_view, deploy_date, contents, thumbnail }`
    - 실제 썸네일 파일은 multipart 업로드(백엔드가 `{microtime}.jpg` 생성). 본 계약은 파일명 문자열(코드베이스 업로드 관례 `{file_name}`) 기준 — 백엔드 실제 업로드로 대체.
  - 응답 `{ success: true }`.
- `PUT /admin/board/datarooms/{idx}` — 수정(modify)
  - 요청: 위와 동일(thumbnail 있으면 이미지 갱신). 응답 `{ success: true }`.

## 타겟 매핑
- 라우트: `/board/dataroom_register` (`routes/board/dataroom_register.tsx`, validateSearch `{mode, idx}`)
- 스크린: `screens/dataroom-register` (register/modify 겸용)
- entities: `entities/dataroom` 확장(detail/create/update + DataroomDetail/DataroomSaveRequest)
- mock: `handlers/dataroom.ts` 확장(detail GET, create POST push, update PUT patch)
- 공유: `shared/ui/MarkdownEditor`, `shared/lib/input-mask`

## Parity 체크리스트
- [ ] register 기본 노출여부 숨김(N)·나머지 미선택
- [ ] modify 프리필(전 필드 + 썸네일 프리뷰)
- [ ] MarkdownEditor(설명)·input-mask(배포일자 날짜)
- [ ] 저장 → register:dataroom_file / modify:dataroom_view 이동
- [ ] mode/idx visible text quirk, product_* 미이식
