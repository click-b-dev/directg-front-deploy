# 자주묻는질문 등록/수정

## 원본
- 파일: `pc/_Admin_/board/faq_register.php` + `pc/_Admin_/board/faq_ps.php`(register/modify/copy/delete)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§자주묻는질문 등록), `../legacy-project/docs/BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/faq_register?mode&idx`
  - **modify**: `mode=modify&idx=`(목록 수정 아이콘) → `tbl_faq` 로드, 프리필.
  - **register**: 사이드바 "자주묻는질문 등록" 링크는 **mode 없음** → 빈 폼(switch 미매칭).
- 화면 요소 (legacy 기준, `col-12` 폼):
  - breadcrumb: 홈 / 게시판 / 자주묻는질문 관리 / 자주묻는질문 등록(active), h4·`<title>` = `자주묻는질문 등록`(양 모드 동일)
  - 폼(`method=post action=faq_ps.php`, hidden `mode`, hidden `idx`):
    - `* 구분` btn-group radio(`faq_type`) **16개**(전체 없음, 목록과 순서·구성 다름): 이용방법(S01,item_cd_1)/계정,회원(M01,item_cd_2)/주문,결제(O01,item_cd_3)/취소,환불(O03,item_cd_4)/제품 코드(키)(O02,item_cd_5)/게임 등록(S02,item_cd_6)/구성,DLC(G02,item_cd_7)/특전(G03,item_cd_8)/게임 실행(S04,item_cd_9)/게임 설치(S03,item_cd_10)/한글(G04,item_cd_11)/가격(O04,item_cd_12)/상품(G01,item_cd_13)/할인(O05,item_cd_14)/기타(E01,item_cd_15)/포인트(M02,item_cd_16)
    - `* 질문` text(`question`, form-control-sm)
    - `* 답변` textarea(`answer`) → **SimpleMDE** → `shared/ui/MarkdownEditor`(easymde)
    - 저장 버튼 `자주묻는질문 저장`
- 폼필드/검증: **검증 없음**(라벨 * 뿐, required 없음).
- 세션/권한: `$_SESSION['admin']`(공통).

### legacy quirk (그대로 이식)
- **등록(register) 기능 dead**: 사이드바 링크가 `mode`를 안 넘겨 register.php switch 미매칭(빈 폼). 제출해도 `faq_ps.php`의 `case "register": break;`(빈 케이스) + 빈 mode → **저장/리다이렉트 없음**(faq_ps 빈 출력). → 타겟도 등록 폼은 렌더하되 **제출 시 no-op**(저장 안 함, 이동 안 함)로 이식. **create API 미생성**.
- **modify만 동작**: 저장 → `update tbl_faq` → `go("faq_list.php")`.
- `faq_ps.php` `delete` 케이스도 빈 케이스(dead, 목록에 삭제 버튼 없음). `copy`는 dgkr→main 이관용(사용자 비노출).
- 구분 btn-group 순서·value 매핑은 목록(#116)과 다른 별도 세트(전체 없음).
- modify 진입 시 answer는 `htmlspecialchars_decode`로 디코드해 에디터 로드.

## 데이터 (legacy)
- 로드(modify): `select * from tbl_faq where idx=:idx`
- 수정: `update tbl_faq set faq_type,question,answer where idx=:idx`
- (dead) 등록: `case "register": break;` — INSERT 없음
- (dead) 삭제: `case "delete": break;`

## API 계약 (백엔드 전달)
- `GET /admin/board/faqs/{idx}` — 상세(수정 폼 로드)
  - 응답: `{ idx, faq_type, question, answer }` (`answer`는 원문 마크다운, 편집용). 없는 idx는 404.
- `PUT /admin/board/faqs/{idx}` — 수정(modify)
  - 요청: `{ faq_type, question, answer }`
  - 백엔드: 해당 필드 UPDATE. 응답 `{ success: true }`.
- **등록(create) 엔드포인트 없음** — legacy 등록이 dead code라 미생성. (향후 등록을 살리려면 신규 기능이므로 별도 논의.)

## 타겟 매핑
- 라우트: `/board/faq_register` (`routes/board/faq_register.tsx`, validateSearch `{mode, idx}`)
- 스크린: `screens/faq-register` (register 빈 폼 no-op / modify 동작)
- entities: `entities/faq` 확장(detail/update + FaqDetail/FaqSaveRequest)
- mock: `handlers/faq.ts` 확장(detail GET, update PUT patch)

## Parity 체크리스트
- [ ] modify 프리필(구분/질문/답변) 일치
- [ ] MarkdownEditor(answer) 편집, 저장 → faq_list 이동·반영
- [ ] **register 빈 폼 + 제출 no-op(dead)** 이식
- [ ] 구분 btn-group 16개(순서·id·value) 일치, 전체 없음
- [ ] 검증 없음(required 미설정)
