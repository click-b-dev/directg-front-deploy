# 중국 결제 상품 리스트

## 원본
- 파일: `pc/_Admin_/china/invoice_goods.php` (293줄, 라이브) + `invoice_goods_ps.php`(처리기)
- 도메인: `src/classes/China.php::getChinaInvoiceGoods`
- 참조 문서: `docs/migration/admin/china/invoice-list.md`(영역 개요)

## 화면·플로우
- 진입 URL: `/china/invoice_goods` — GET `page`, `search_name`, `search_platform`
- 화면 요소:
  - breadcrumb: 홈 / 중국결제 / 중국 결제 관리 / 중국 결제 상품 리스트
  - h4 "중국 결제 상품 리스트"
  - 검색필터: 상품명 `search_name`(text, goods_nm LIKE), 플랫폼 `search_platform`(select), 검색 버튼
    - **플랫폼 select 옵션(quirk 이식)**: 빈옵션 `::: 플랫폼 선택 :::` + PS4/PS5/XB1/XBX/NSW/**NSW2(value="NSW" 버그)**
    - **검색 label `for="search_email"`(복붙 버그, 무해)**
  - 카운트 `{total_results} 명` — **legacy quirk "명"(개가 맞으나 복붙, 원문 유지)** + **"중국 결제 상품등록" 버튼**(outline-danger, 모달 트리거)
  - 목록 테이블 6컬럼:
    | 컬럼 | 값 | 비고 |
    |------|-----|------|
    | 번호 | `total-(index+(page-1)*20)` | 역순 20/page |
    | 플랫폼 | `platform` | |
    | 상품명 | `goods_nm` | text-start |
    | 판매가 | `number_format(price)`+원 | text-end |
    | 수정 | "수정" 버튼(data-idx/platform/goodsnm/price) | 모달 modify |
    | 삭제 | "삭제" 버튼 | AJAX delete |
  - 서버 페이지네이션(**wrapper `fs-5`**)
  - **공유 모달(goods-modal)**: 플랫폼*(select)/상품명*(text)/판매가*(text+원) — register/modify 겸용
- 분기/플로우:
  - **등록**: "상품등록" 버튼 → 모달(mode=register, 빈 폼, 제목 "중국 결제 상품 등록") → 저장 버튼 → AJAX register → `alert(응답)` + **`window.location.reload()`**(목록 갱신)
  - **수정**: 행 "수정" → 모달 채움(mode=modify, idx/platform/goods_nm/price, 제목 "중국 결제 상품 수정") → 저장 → AJAX modify → alert + reload
  - **삭제**: 행 "삭제" → confirm `[{platform}] {goods_nm}을(를) 삭제하시겠습니까?` → AJAX delete → alert + reload
  - **저장 버튼 클라 검증 없음**: `type="button"` + jQuery serialize AJAX라 HTML5 required 미발동(빈값 제출 가능) — quirk 이식
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- 목록 `China::getChinaInvoiceGoods`:
  ```sql
  SELECT idx, platform, goods_nm, price FROM directgames.tbl_invoice_goods
  WHERE idx>'0' [add_where] ORDER BY platform ASC, goods_nm ASC
  ```
  - 20/page, add_where: `goods_nm like '%{v}%'` / `platform = '{v}'`(등호)
- 처리기 `invoice_goods_ps.php`(각 case echo 메시지 → alert):
  - `register`: `INSERT ... SET platform, goods_nm, price` → echo "등록되었습니다."
  - `modify`: `UPDATE ... SET platform, goods_nm, price WHERE idx` → echo "수정되었습니다."
  - `delete`: `DELETE WHERE idx` → echo "삭제되었습니다."
  - `invoice_goods_search`: **주문서 작성(invoice_register #221) 전용 goods-add 테이블 렌더 → 본 단위 범위 밖**

## API 계약 (백엔드 전달)
- `GET /admin/china/goods` — 상품 목록
  - 요청: `page`(기본 1), `search_name`(LIKE), `search_platform`(등호)
  - 응답: `{ items: [{ idx, platform, goods_nm, price }], pagination: { current_page, results_per_page:20, total_results, total_pages } }`
  - 백엔드: base `idx>0`, 정렬 `platform ASC, goods_nm ASC`, 20/page
- `POST /admin/china/goods` — 상품 등록/수정(mode)
  - 요청: `{ mode: "register" | "modify", idx, platform, goods_nm, price }`(register 시 idx=0)
  - 응답: `{ message: string }` — legacy "등록되었습니다." / "수정되었습니다."
  - 백엔드: register=INSERT, modify=UPDATE(idx)
- `POST /admin/china/goods/delete` — 상품 삭제
  - 요청: `{ idx }`
  - 응답: `{ message: string }` — legacy "삭제되었습니다."

## 타겟 매핑
- 라우트: `/china/invoice_goods` (`routes/china/invoice_goods.tsx`)
- screens: `screens/china-invoice-goods`
- entities: `entities/china` 확장(goods list + save + delete + PLATFORM 옵션)
- mock: `handlers/china` 확장(3 핸들러)

## Parity 체크리스트
- [ ] 화면 요소 일치 (검색필터 2종·6컬럼·카운트 "명" quirk·등록 버튼·플랫폼 옵션 NSW2 quirk)
- [ ] 필드/검증 일치 (goods_nm LIKE·platform 등호·저장 클라검증 없음 quirk)
- [ ] 분기/플로우 일치 (등록/수정 공유 모달·mode 전환·삭제 confirm 문구·alert+reload)
- [ ] 엣지케이스 일치 (번호 역순 20/page·정렬 platform·goods_nm asc·빈 목록·fs-5 페이저)
