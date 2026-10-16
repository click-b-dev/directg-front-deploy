# 자료실 파일 상세

## 원본
- 파일: `pc/_Admin_/board/dataroom_view.php` (read-only. `dataroom_ps.php` product_* 연동은 dead)
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§자료실 파일 상세), `BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/dataroom_view?idx=`(목록 상세 아이콘 · #122 modify 저장 후 진입)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/자료실 관리/**자료실 파일 상세보기**($page_title), h4 동일
  - 페이지 `<style>`: `#content img { width: 100%; }` 이식
  - **col-8 정보 테이블(9행)**: 파일유형(`P?한글패치:컨텐츠`)/제공 파일명/제공 파일 URL/설명(`Parsedown(contents)`+`&#13;&#10;`→`<br/>` HTML)/암호화 여부(is_encode raw)/암호화 방식(encode_type raw)/제공조건(**is_free raw Y/N** — 목록의 무료/유료와 다름)/배포일자/썸네일(`<img src=/upload/dataroom/{thumbnail}>`)
  - **col-4**:
    - `is_free=="N"`(유료)일 때만 **자료실 제공상품 설정 카드**: 제공상품 목록(항상 비어있음) + 검색 footer(옵션상품명 input + `옵션상품 검색` 버튼)
    - **수정이력 카드**: 정적 테이블(수정일자/수정자) — 빈 행 1개(stub, 데이터 없음)
- 세션/권한: `$_SESSION['admin']`(공통).

### legacy dead / quirk (그대로 이식)
- **제공상품 설정 전부 dead**: `$notice_product`(제공상품 배열)·`$admin`(도메인 객체)이 dataroom_view에서 **미정의** → foreach 미실행(목록 항상 empty). 검색 버튼(`btn_goods_find`)은 `dararoom_ps.php`(**오타** — 존재하지 않는 파일)로 POST → 404, 처리기 `product_search`/`product_add`도 빈 케이스. → **카드 구조(visible)는 렌더**하되 검색은 빈값 alert(`검색할 대표상품명을 입력해주세요.`)만 재현, 그 외 no-op. product-modal 미이식.
- 제공조건은 상세에서 raw Y/N 출력(목록 #121은 무료/유료).
- 수정이력은 데이터 소스 없는 빈 stub.

## 데이터 (legacy)
- `select * from tbl_dataroom where idx=:idx`
- 설명 렌더: `str_replace("&#13;&#10;","<br/>", Parsedown->text(contents))`

## API 계약 (백엔드 전달)
- `GET /admin/board/datarooms/{idx}` — 상세(#122에서 생성, **`contents_html` 필드 추가**)
  - 기존 응답에 `contents_html`(Parsedown 렌더 HTML, 뷰용) 추가. `contents`(원문, #122 편집용)는 유지.
  - (제공상품/수정이력은 legacy dead·미구현 → 계약 없음)

## 타겟 매핑
- 라우트: `/board/dataroom_view` (`routes/board/dataroom_view.tsx`, validateSearch `{idx}`)
- 스크린: `screens/dataroom-view`
- entities: `entities/dataroom` — `DataroomDetail`에 `contents_html` 추가(useDataroomDetail 재사용)
- mock: `handlers/dataroom.ts` detail에 `contents_html`(mock md→html) 추가

## Parity 체크리스트
- [ ] col-8 9행 정보 테이블(제공조건 raw Y/N·설명 HTML·썸네일) 일치
- [ ] is_free=="N" 시 제공상품 설정 카드(빈 목록+검색) 노출, 검색 빈값 alert
- [ ] 수정이력 stub 카드
- [ ] product 검색/추가 dead 미이식(빈값 alert만)
