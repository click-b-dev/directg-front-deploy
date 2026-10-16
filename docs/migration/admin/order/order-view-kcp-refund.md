# 주문 상세 — KCP 결제정보/취소 (217c-1)

order_view.php의 KCP 결제정보 카드(`pg_provider=="kcp"`) + `kcp_log` 표시 + 결제취소/계좌반납(`kcp_refund`). 217c(PG별 분할)의 첫 단위.

## 원본
- 카드: order_view.php 687~924 (`if pg_provider=="kcp"`)
- settle_log: `AdminOrder::getOrderKcpLog(settle_no)` = `select * from kcp_log where settle_no=:settle_no order by idx asc` (단건). version 1·3은 이 메서드, version 2는 `AdminV1::getOrderKcpLog2`(동일 형태로 간주).
- refund JS(2366~2377): `#btn_kcp_refund` → confirm("해당 KCP결제를 취소하시겠습니까?") → POST order_ps.php `kcpFrm`(mode=kcp_refund, settle_no, mod_type, tno) → `location.reload()`
- order_ps `kcp_refund`(40-order.md): `Kcp::cancelPayment` → res_cd=0000이면 `tbl_order.step=9, cancel_date=now`, 주문로그("KCP 결제취소 완료"). **백엔드 책임**.

## 화면 (KCP 결제정보 카드, col-lg-4 결제 정보 아래)
- 숨은 폼: mode=kcp_refund / settle_no / mod_type(`escw_yn=="N"?"STSC":"STE2"`) / tno
- 공통 4행: KCP 거래 고유번호(tno) / KCP 상태코드(tx_cd) / 결제수단명(pay_method) / 에스크로여부(escw_yn)
- **payment_method별 상세**:
  - **SC0010 신용카드**: (isp_issuer_nm 있으면)ISP 계열 카드 발급사명 / 카드명(card_name + card_bin_type_01 개인·법인 뱃지 + card_bin_type_02 신용·체크 뱃지) / 카드번호(card_no) / 신용카드 결제금액(card_mny nf) / (coupon_mny>0)쿠폰 할인 금액 / (payco_point_mny>0)페이코 포인트 사용 금액 / 결제승인번호(app_no) / 결제승인시간(app_time) / 결제금액(amount nf)
  - **SC0030 계좌이체**: 은행명(bank_name) / 은행코드(bank_code) / 계좌이체 결제 금액(bk_mny raw) / 현금영수증 승인번호(cash_authno) / 현금영수증 거래번호(cash_no) / 계좌이체 결제시각(app_time)
  - **SC0040 가상계좌**: (step 1·8)가상계좌 취소[계좌반납 버튼] / 주문자명(ipgm_name) / 은행명(bank_name) / 가상계좌번호(account) / 입금할 계좌 입금주(depositor) / 가상계좌 입금예정금액(amount nf) / 가상계좌 입금마감일자(va_date YmdHis 분해) / 가상계좌 입금 금액(ipgm_mnyx) / 가상계좌에 입금된 금액합계(totl_mnyx) / 가상계좌 입금 시각(ipgm_time) / **가상계좌 은행코드(legacy 버그 `bank_code `(trailing space)→항상 빈값, 그대로 이식)** / 입금된 가상계좌번호(account) / 가상계좌 입금 통보 아이디(noti_id) / 가상계좌 입금 구분코드(op_cd) / 가상계좌 입금자명(remitter) / 현금영수증 승인번호(cash_a_no) / 현금영수증 거래번호(cash_no)
  - **SC0060 휴대폰**: 통신사 코드(commid) / 휴대폰 번호(mobile_no) / 실물·컨텐츠 구분(van_id)
- 공통 하단: 결제 건의 부분취소 가능 유무(partcanc_yn) / (step 2)결제취소[버튼] / 거래영수증(가맹점용 영수증 보기 → bill_url, payment_method별 상이)
- 계좌반납(SC0040 step 1/8)·결제취소(step 2) 버튼 모두 `#btn_kcp_refund`(동일 폼 제출).

## API 계약 (백엔드 전달)
- 상세 응답에 `settle_log`(KCP) 추가: `GET /admin/order/detail`가 pg_provider=kcp면 `kcp_log` 단건을 `settle_log`로 반환.
- `POST /admin/order/kcp-refund` — body `{ settle_no, mod_type, tno }`. 백엔드: `Kcp::cancelPayment` → 성공 시 step=9·cancel_date·주문로그. 응답 `{ success: boolean }`. 성공 시 프론트는 상세 재조회(legacy reload).

## 타겟 매핑
- entities: `OrderDetailSettleLogKcp` 타입 + `OrderDetailResponse.settle_log` 추가, `OrderKcpRefundRequest`, `fetchKcpRefund`(POST)/`useKcpRefund`(mutation, 성공 시 detail invalidate).
- 스크린: `screens/order-detail` — 결제 정보 카드 뒤 `KcpPaymentCard`(pg=kcp) 추가. mod_type/bill_url 계산·결제수단별 상세·부분취소·영수증·계좌반납/결제취소 버튼(confirm→mutation).
- mock: buildOrderDetail에 kcp settle_log 포함 + `POST /admin/order/kcp-refund`.

## Parity 체크리스트
- [ ] pg=kcp일 때만 카드 노출·공통 4행·payment_method별 상세(SC0010/0030/0040/0060)
- [ ] 금액 nf(card_mny/amount 등)·bk_mny/ipgm_mnyx raw·va_date 날짜 분해·가상계좌 은행코드 빈값 버그
- [ ] 계좌반납(SC0040 step 1·8)·결제취소(step 2) 버튼 노출 조건·부분취소·거래영수증 bill_url
- [ ] refund: confirm 문구·POST kcp_refund(settle_no/mod_type/tno)·성공 시 재조회
