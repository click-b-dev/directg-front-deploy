# 중국 결제 주문서 작성 (register)

## 원본
- 파일: `pc/_Admin_/china/invoice_register.php` (559줄, 라이브) + `invoice_ps.php`(저장 처리기) + `invoice_goods_ps.php`(mode=invoice_goods_search)
- 도메인: `src/classes/China.php::settleNo`
- 참조 문서: `docs/migration/admin/china/invoice-goods.md`(상품 검색 SQL 공유)

## 화면·플로우
- 진입 URL: `/china/invoice_register` (사이드바) — GET `mode`(기본 register), `settle_no`
- **register 전용 이관**: 사이드바 진입 = register. `mode=modify`는 legacy `if($mode="modify")` **`=`대입 버그**로 생긴 dead 경로(저장 후 자기 리다이렉트로만 도달, settle_no/ord_ymd만 표시·나머지 빈 폼·hidden mode 항상 register). **개발자 승인(2026-08-03)으로 dead-modify landing 미재현**: 저장 성공 시 `invoice_request` 목록으로 이동(legacy `=`버그 이탈). 실제 수정 화면은 별도 파일 `invoice_modify.php`(후속 단위).
- 화면 요소(2컬럼):
  - 상단: "주문서 저장" 버튼(btn-danger, id=btn_invoice_save)
  - **좌 col-6**:
    - 주문자 정보 card: "결제자 조회" 버튼(member 모달) / 주문자명 orderName(required) / 이메일 orderEmail(email, required)
    - 결제설정 card: 결제분할 settle_count(기본 1) 회
    - 결제이력 card: 정적 빈 테이블(회차/결제일/PG사/PG주문번호/결제수단/결제금액 + tfoot 잔금합계) — **데이터 바인딩 없음, 빈 행 1개 이식**
  - **우 col-6**:
    - 주문상품 설정 card(bg-secondary): 테이블#invoice_goods(플랫폼/상품명/수량/판매가/합계/삭제, tbody JS 채움) + card-footer(플랫폼 select required + search_value + "상품검색" 버튼)
    - 주문정보 card: 결제번호 settle_no(생성값)/주문일자 ord_ymd(오늘)/결제금액 settle_price(readonly, 자동계산)
    - 배송지 정보 card: 정적 빈 테이블(번호/이름/우편번호/주소/전화번호/수정) — **빈 행 1개 이식**
  - **member 모달**: 결제자 전체(radio idx[], data-name/email) + "선택완료"
  - **goods 모달**: 검색결과 테이블#goods_info(플랫폼/상품명/수량 입력/판매가/합계) 각 행 "상품 추가" 버튼(legacy는 tbody를 invoice_goods_search HTML로 채움)
- 분기/플로우:
  - **결제자 선택**: 조회 버튼 → member 모달 → radio 선택 → 선택완료(미선택 시 alert "중국 결제자를 선택해 주세요.") → orderName/orderEmail 세팅 → 모달 닫기
  - **상품검색**: 플랫폼(빈값 alert "플랫폼을 선택해주세요.")·검색어(빈값 alert "검색할 상품명을 입력해주세요.") → invoice_goods_search → goods 모달에 결과 렌더 → show
  - **상품추가**: 검색결과 행의 platform/goods_nm/qty/price → 주문상품 테이블에 행 추가(합계=qty×price, comma 포맷) + settle_price 재계산 → 모달 닫기
  - **상품삭제**: 행 제거 + settle_price 재계산
  - **settle_price**: Σ(qty×price) 자동
  - **주문서 저장**: 검증(orderName 빈값/orderEmail 빈값/settle_price 0 또는 빈값 → 각 alert) → POST invoice_ps.php(mode=register) → **[개발자 승인] invoice_request 목록 이동**
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- 결제번호 생성 `China::settleNo()`: `round(microtime(true)*1000)` = epoch millisecond → 포트 `Date.now()`
- 결제자 전체(모달): `select idx,name,email from tbl_invoice_member order by idx desc` (페이징 없음)
- 상품 검색 `invoice_goods_ps.php` mode=invoice_goods_search:
  ```sql
  select platform,goods_nm,price from tbl_invoice_goods
  where platform=:platform and goods_nm like :keyword order by platform asc,goods_nm asc,price asc
  ```
- 저장 `invoice_ps.php` mode=register:
  - `insert into tbl_invoice_order set settle_no, settle_price, email, ord_ymd, name, settlekind, settle_count, orddt=now()`
  - 각 상품: `insert into tbl_invoice_order_item set order_num(=key+1), platform, product_code(=goods_nm), product_nm(=goods_nm), qty, price, reg_date=now(), settle_no`
  - **product_code = product_nm = goods_nm**(legacy 동일값)
  - **legacy `print_r` 디버그 출력**(응답 오염) → 포트는 clean JSON
  - **legacy `if($mode="modify")` =버그로 항상 modify 리다이렉트** → 개발자 승인으로 invoice_request 이동으로 대체

## API 계약 (백엔드 전달)
- `GET /admin/china/members/all` — 결제자 전체(모달용)
  - 응답: `{ items: [{ idx, name, email }] }` (idx DESC, 페이징 없음)
- `GET /admin/china/goods/search` — 주문상품 검색
  - 요청: `search_platform`(등호), `search_value`(goods_nm LIKE)
  - 응답: `{ items: [{ platform, goods_nm, price }] }` (platform·goods_nm·price ASC)
- `POST /admin/china/orders` — 주문서 등록(register)
  - 요청: `{ settle_no, ord_ymd, settle_price, orderName, orderEmail, settlekind(빈값), settle_count, items: [{ platform, goods_nm, qty, price }] }`
  - 응답: `{ success: boolean, settle_no: string }`
  - 백엔드: tbl_invoice_order insert + items insert(order_num=index+1, product_code=product_nm=goods_nm)

## 타겟 매핑
- 라우트: `/china/invoice_register` (`routes/china/invoice_register.tsx`)
- screens: `screens/china-invoice-register`
- entities: `entities/china` 확장(member-all + goods-search + order register)
- mock: `handlers/china` 확장(3 핸들러)

## Parity 체크리스트
- [ ] 화면 요소 일치 (2컬럼 6카드·정적 테이블 2종·2 모달)
- [ ] 필드/검증 일치 (orderName/orderEmail required·저장 검증 3종·검색 검증 2종)
- [ ] 분기/플로우 일치 (결제자 선택→채움·상품검색→추가→settle_price·삭제·저장→request 이동[개발자 승인])
- [ ] 엣지케이스 일치 (settle_no=Date.now()·ord_ymd 오늘·합계 comma·NSW2 플랫폼 quirk·dead modify 미재현)
