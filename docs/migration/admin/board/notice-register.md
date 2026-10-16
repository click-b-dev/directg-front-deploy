# 공지사항 등록/수정

## 원본
- 파일:
  - `pc/_Admin_/board/notice_register.php` — 등록/수정 겸용 폼(라이브, 변형 없음)
  - `pc/_Admin_/board/notice_ps.php` (mode=`regitster`[오타]/`modify`) — 저장 처리기
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§공지사항 등록), `../legacy-project/docs/BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/notice_register?mode&idx`
  - `idx>0`이면 **modify**(기존 데이터 로드, `mode`를 "modify"로 강제) / 아니면 **register**(mode="regitster", 구분 기본 "1")
- 화면 요소 (legacy 기준, `col-8` 폼):
  - breadcrumb: 홈 / 게시판 / **공시사항 관리**(오타 원문) / 공지사항 등록(active), h4 `공지사항 등록`
  - `<title>` = `공지사항 등록` (modify도 동일)
  - 폼(`method=post action=notice_ps.php`, hidden `mode`, hidden `idx`):
    - `* 공지사항 구분` radio(`notice_type` 1~4): 1 제품코드(키) 발송 / 2 **프로모션** / 3 상품 출시/판매 / 4 기타
    - `* 공지사항 제목` text(`subject`)
    - `* 공지사항 내용` textarea(`contents`) → **SimpleMDE**(마크다운) → 타겟 `shared/ui/MarkdownEditor`(easymde)
    - `* 고정 여부` radio(`is_notice` Y/N: 예/아니오)
    - `* 노출 여부` radio(`is_view` Y/N: 예/아니오)
    - `* 배포일자` text(`deploy_date`, class `date`, `data-mask-format="0000-00-00 00:00:00"`, placeholder `배포일자 예)YYYY-MM-DD H:i:s`) → input-mask(`shared/lib/input-mask`)
    - 저장 버튼 `공지사항 저장`(text-end)
- 폼필드/검증: **검증 없음**. 라벨에 `*` 표기가 있으나 input에 `required` 없음 → 그대로(무검증) 이식.
- 분기/리다이렉트: 저장 → notice_ps `go("notice_list.php")` → `/board/notice_list`로 이동.
- 세션/권한 의존: `$_SESSION['admin']`(공통). admin_id는 서버가 `admin@h2int.com` 하드코딩(백엔드 책임).

### 초기값 규칙 (legacy)
- **register**: 구분(notice_type) = `1` checked. 고정여부/노출여부는 **checked 없음**(둘 다 미선택). 나머지 빈값.
- **modify**: 구분/고정여부/노출여부는 저장값 checked. 제목·내용·배포일자는 저장값. 내용은 `htmlspecialchars_decode`로 디코드해 에디터에 로드.

### legacy quirk (그대로 이식)
- breadcrumb 3번째 "공시사항 관리" 오타 유지.
- mode 값 `regitster`(오타) 유지 — 폼 hidden과 처리기 case가 이 철자로 매칭.
- 구분 radio 2번 라벨 `프로모션`(목록 테이블은 `프로모션/이벤트`, #113과 동일 불일치).
- **연관상품(product_search/product_add) 미이식**: notice_register에는 연관상품 UI가 아예 없고, notice_view의 product-modal도 트리거 버튼(`#btn_goods_find`)·검색 input이 DOM에 없어 바인딩 안 됨(dead). notice_ps의 product_* 모드는 사용처 없는 dead code → 이식하지 않음.
- contents 저장 시 legacy는 `<`,`>`,`&`를 엔티티로 치환 후 저장, 로드 시 디코드(라운드트립) — **백엔드 책임**으로 계약에 명시(프론트는 에디터 원문 전송, detail은 디코드된 표시용 contents 수신).

## 데이터 (legacy)
- 등록(regitster): `insert into tbl_notice set notice_type,subject,contents,reg_date=now(),hit='0',is_notice,is_view,deploy_date,admin_id='admin@h2int.com'`
- 수정(modify): `update tbl_notice set notice_type,subject,contents,deploy_date,is_notice,is_view where idx=:idx`
- 로드(modify 진입): `select * from tbl_notice where idx=:idx`

## API 계약 (백엔드 전달)
- `GET /admin/board/notices/{idx}` — 상세(수정 폼 로드 · #115 미리보기 공용)
  - 응답: `{ idx, notice_type, subject, contents, is_notice, is_view, deploy_date, reg_date, admin_id }`
    - `contents`는 표시/편집용(엔티티 디코드 완료본). 없는 idx는 404.
- `POST /admin/board/notices` — 등록(regitster)
  - 요청: `{ notice_type, subject, contents, is_notice, is_view, deploy_date }`
  - 백엔드: `reg_date=now()`, `hit=0`, `admin_id='admin@h2int.com'` 설정. contents 엔티티 치환 저장. 응답 `{ success: true }`.
- `PUT /admin/board/notices/{idx}` — 수정(modify)
  - 요청: `{ notice_type, subject, contents, is_notice, is_view, deploy_date }`
  - 백엔드: 해당 필드 UPDATE(reg_date/hit/admin_id 미변경). 응답 `{ success: true }`.

## 타겟 매핑
- 라우트: `/board/notice_register` (`routes/board/notice_register.tsx`, validateSearch `{mode, idx}`)
- 스크린: `screens/notice-register` (register/modify 겸용)
- entities: `entities/notice` 확장(detail/create/update + NoticeDetail/Create/Update 타입)
- mock: `shared/mocks/handlers/notice.ts` 확장(detail GET, create POST push, update PUT patch) — fixture에 contents/admin_id 보강

## Parity 체크리스트
- [ ] register 초기값(구분1 checked, 고정/노출 미선택) 일치
- [ ] modify 데이터 프리필(구분/제목/내용/고정/노출/배포일자) 일치
- [ ] MarkdownEditor(easymde) 내용 편집, 배포일자 input-mask 동작
- [ ] 검증 없음(required 미설정) 일치
- [ ] 저장 → notice_list 이동, 등록/수정 반영
- [ ] breadcrumb "공시사항 관리" 오타·mode "regitster" 오타 유지
- [ ] 연관상품 미이식(dead) 확인
