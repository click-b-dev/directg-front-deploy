# 중국 결제 주문서 수정 (modify)

## 원본
- 파일: `pc/_Admin_/china/invoice_modify.php` (567줄, 라이브 — 목록 "수정" 링크 대상) + `invoice_ps.php`(mode=modify)
- 참조 문서: `docs/migration/admin/china/invoice-register.md`(#221 자매)·`invoice-view.md`(#226 order detail 재사용)

## 스코프 결정 (개발자 승인 2026-08-03)
invoice_modify는 legacy에서 상품/settle_price 로직이 깨져 있어 **주문 헤더 편집만 실제 동작**한다.
- **주문상품 저장 dead**: `invoice_ps.php` modify case가 `goods_code[]`(폼 미전송)·`$ea`(미정의)를 참조 → 상품 insert 루프 무동작. tbl_invoice_order(settle_price/email/ord_ymd/name/settle_count)만 UPDATE.
- **settle_price 재계산 NaN**: settlePrice() JS가 신규 hidden qty[]/price[]만 인덱싱 → 기존 상품과 인덱스 어긋나 NaN.
- **주문자명/이메일 프리필 빈값 버그**: `$order_data['orderName']`/`['orderEmail']` 참조(실 컬럼 name/email) → 빈값.

**결정**:
1. 프리필 버그 **수정** — name/email로 프리필(사용 가능한 수정 화면).
2. **헤더 편집 중심** — 기존 상품 읽기전용 표시. 편집: 주문자명/이메일(결제자 모달)·결제분할·주문일자·**결제금액(readonly 해제, 직접입력)**. 저장은 헤더만(legacy 동일).
3. **상품검색/추가 모달·goods 모달 제외**(깨진 미저장 로직) — parity 이탈, 승인.
4. 저장 후 이동: legacy `=`대입 버그(→invoice_register?mode=modify dead) 대신 **invoice_request 목록**(#221 결정 일관).

## 화면·플로우
- 진입 URL: `/china/invoice_modify?settle_no=` (목록 "수정" 링크)
- 화면 요소(2컬럼, #221 register와 동일 레이아웃):
  - 상단 "주문서 저장" 버튼
  - 좌: 주문자 정보(결제자 조회 모달·주문자명·이메일)/결제설정(결제분할)/결제이력(정적 빈 테이블)
  - 우: 주문상품 설정(**기존 상품 읽기전용 표시**, 검색 footer 제외)/주문정보(결제번호·주문일자·**결제금액 편집**)/배송지(정적 빈 테이블)
  - 결제자 모달(전체 idx desc radio→orderName/email)
  - **page_title은 legacy "중국 결제 주문서 작성"(수정 화면인데 작성으로 표기, 원문 유지)**
- 분기/플로우:
  - 프리필: order detail(name/email/settle_count/settle_no/ord_ymd/settle_price) + 기존 상품
  - 결제자 선택: 모달 radio → 선택완료(미선택 alert) → orderName/email 세팅
  - 저장: 검증(orderName/orderEmail/settle_price 0 각 alert) → POST modify → invoice_request 이동
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- 프리필 조회: order/item/log/address (invoice_view와 동일 4쿼리) → **order detail 엔드포인트(#226) 재사용**
- 저장 `invoice_ps.php` mode=modify:
  ```sql
  UPDATE tbl_invoice_order SET settle_price=:settle_price, email=:email, ord_ymd=:ord_ymd, name=:name, settle_count=:settle_count WHERE settle_no=:settle_no
  ```
  - 상품 insert 루프는 dead(미이관)

## API 계약 (백엔드 전달)
- 프리필: `GET /admin/china/orders/detail?settle_no=` (#226 재사용)
- `POST /admin/china/orders/modify` — 주문 헤더 수정
  - 요청: `{ settle_no, settle_price, orderName, orderEmail, ord_ymd, settle_count }`
  - 응답: `{ success: boolean }`
  - 백엔드: `UPDATE tbl_invoice_order SET name/email/ord_ymd/settle_price/settle_count WHERE settle_no`

## 타겟 매핑
- 라우트: `/china/invoice_modify` (`routes/china/invoice_modify.tsx`)
- screens: `screens/china-invoice-modify`
- entities: `entities/china` 확장(order modify mutation; detail·member-all 재사용)
- mock: `handlers/china` 확장(POST orders/modify)
- **링크 활성화**: `screens/china-invoice-request`(#222) "수정" 링크 `invoice_modify.php?settle_no=` → `/china/invoice_modify?settle_no=`

## Parity 체크리스트
- [ ] 화면 요소 일치 (2컬럼·프리필·기존 상품 읽기전용·정적 테이블 2종·결제자 모달·page_title "작성")
- [ ] 필드/검증 일치 (name/email 프리필[버그수정]·결제금액 편집·저장 검증 3종)
- [ ] 분기/플로우 일치 (결제자 선택·저장 헤더만·invoice_request 이동)
- [ ] 엣지케이스 일치 (상품검색 제외[승인]·settle_no 링크 진입)
