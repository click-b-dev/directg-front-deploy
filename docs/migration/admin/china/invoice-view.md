# 중국 결제 주문서 상세보기

## 원본
- 파일: `pc/_Admin_/china/invoice_view.php` (258줄, 라이브 — 목록 결제번호 링크 대상)
- 참조 문서: `docs/migration/admin/china/invoice-list.md`(#218)·`invoice-request.md`(#222) — 결제번호 링크 출처

## 화면·플로우
- 진입 URL: `/china/invoice_view` — GET `settle_no`
- **읽기전용 상세**(Invoice 스타일 단일 카드, mutation 없음):
  - breadcrumb: 홈 / 중국결제 / 중국 결제 관리 / 주문서 상세보기
  - h4 "주문서 상세보기"
  - 카드 상단: `Invoice for purchase #{settle_no}`(d-print-none)·**수정 버튼 주석 dead**
  - 2컬럼(col-sm-6):
    - **좌**:
      - 주문자 정보(list-group): 주문자명(name)/주문자이메일(email)/주문일자(ord_ymd)
      - 주문상품 정보 table(caption): 상품명(product_nm)/판매가(₩ price)/판매수량(qty)/합계(₩ price×qty)
        - tfoot **"힙계"(오타 이식)**: total_count(Σqty) / ₩ total_price(Σ price×qty)
    - **우**:
      - 결제 정보(list-group): 결제예정금액(settle_price)/결제완료금액(amount_paid)/남은금액(settle_price−amount_paid)/결제횟수(settle_count)/결제상태(step 1=결제대기·2=결제완료)
      - 결제 상세정보(list-group): 로그별 `{settle_count}회차 / {pg_provider} / {status=="paid"?"결제완료":"결제대기"} / {pg_provider=="kcp"?imp_uid:pg_tid} / {paid_amount} 원/ {reg_date}`
      - 배송지 정보 table: 번호(순번)/이름(name)/우편번호(zipcode)/주소(address)/전화번호(tel)
  - 하단 우측: h3 ₩ total_price
  - **Print/Submit 버튼 주석 dead**
- **통화 기호**: legacy `<span style="font-family:dotum">&#92;</span>` = 백슬래시(`\`)가 dotum 폰트에서 ₩로 렌더 → **동일 재현**(span+백슬래시)
- settle_no 없으면 데이터 미로드(빈 화면)
- 세션/권한: `lib.php` 관리자 세션 가드(공통).

## 데이터 (legacy)
- 주문정보: `SELECT * FROM tbl_invoice_order WHERE settle_no=:settle_no`
- 주문상품: `SELECT * FROM tbl_invoice_order_item WHERE settle_no=:settle_no ORDER BY order_num ASC`
- 결제로그: `SELECT imp_uid,merchant_uid,pay_method,paid_amount,status,name,pg_provider,pg_tid,buyer_name,buyer_email,paid_at,receipt_url,card_name,apply_num,vbank_num,vbank_name,vbank_holder,vbank_date,settle_count,reg_date FROM tbl_kcp_log_invoice WHERE merchant_uid=:order_no` (표시 필드: settle_count/pg_provider/status/imp_uid/pg_tid/paid_amount/reg_date)
- 배송지: `SELECT * FROM tbl_invoice_address WHERE settle_no=:settle_no ORDER BY idx ASC`
- 합계(total_count/total_price)는 PHP 루프 계산 → **프론트에서 items로 계산**

## API 계약 (백엔드 전달)
- `GET /admin/china/orders/detail` — 주문서 상세
  - 요청: `settle_no`
  - 응답:
    ```json
    {
      "order": { "name":"", "email":"", "ord_ymd":"", "settle_price":0, "amount_paid":0, "settle_count":"1", "step":"2" },
      "items": [ { "product_nm":"", "price":0, "qty":0 } ],
      "logs": [ { "settle_count":1, "pg_provider":"kcp", "status":"paid", "imp_uid":"", "pg_tid":"", "paid_amount":0, "reg_date":"" } ],
      "address": [ { "name":"", "zipcode":"", "address":"", "tel":"" } ]
    }
    ```
  - 백엔드: order/item(order_num asc)/kcp_log_invoice(merchant_uid)/address(idx asc) 조인 없이 각각 조회

## 타겟 매핑
- 라우트: `/china/invoice_view` (`routes/china/invoice_view.tsx`)
- screens: `screens/china-invoice-view`
- entities: `entities/china` 확장(order detail)
- mock: `handlers/china` 확장(GET orders/detail)
- **링크 활성화**: `screens/china-invoice-list`(#218)·`screens/china-invoice-request`(#222)의 결제번호 링크 `invoice_view.php?settle_no=` → SPA 라우트 `/china/invoice_view?settle_no=`

## Parity 체크리스트
- [ ] 화면 요소 일치 (2컬럼 5카드·주문상품/배송지 table·₩ dotum 기호·"힙계" 오타)
- [ ] 필드/검증 일치 (결제상태 step 라벨·로그 포맷·합계 계산)
- [ ] 분기/플로우 일치 (settle_no 링크 진입·수정/print 버튼 dead·읽기전용)
- [ ] 엣지케이스 일치 (settle_no 없음 빈 화면·로그/배송지 0건)
