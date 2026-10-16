# 클라이언트 킥오프 개발 확인사항 - 소스 확인 분류

> 목적: 클라이언트에게 질문하기 전에 legacy 소스 분석으로 해결 가능한 항목을 제외하고, 실제 개발 착수에 필요한 외부 확인 항목만 남긴다.
> 범위: 기획/정책 변경 논의는 제외한다. legacy 동작 동일성(parity)을 전제로 한다.

## 분류 기준

- **소스 분석으로 해결**: legacy PHP, 클래스, SQL, 화면 파일을 읽어 프론트/백엔드 API 계약으로 정리할 수 있는 항목.
- **외부 확인 필요**: 소스만으로 알 수 없거나, 운영 환경/계정/테스트 데이터/배포 라우팅 정보가 필요한 항목.
- **내부 개발 산출물**: 백엔드/프론트 개발팀이 소스 분석 후 작성해야 하는 명세.

## 1. 소스 분석으로 해결할 항목

아래 항목은 클라이언트 질문에서 제외하고, legacy 소스 분석 태스크로 전환한다.

### 1.1 Legacy URL과 화면 구조

소스에서 확인 가능하다.

- PC 스토어프론트: `../legacy-project/pc/*`
- Mobile 스토어프론트: `../legacy-project/mobile/*`
- 관리자: `../legacy-project/pc/_Admin_/*`
- 퍼블리셔 포털: `../legacy-project/pc/_Admin2_/publisher/*`
- 게임/상품 주요 URL: `pc/game/*.html`
- 주문 주요 URL: `pc/order/*.html`, `pc/order/{kcp,naverpay,payco,toss,tosspay,tosspayment}/*`
- 회원/마이페이지 주요 URL: `pc/member/*`, `pc/mypage/*`

PC에서 모바일로 보내는 legacy 동작도 소스에서 확인 가능하다.

- `pc/lib/lib.php`에서 User-Agent 기반으로 `https://m.directg.net/mgate.php?refer=...` 이동

단, `yjs_*`, `kdy_*`, 날짜 접미 파일 중 **현재 운영 서버에서 실제 진입되는 파일**은 소스만으로 완전 확정하기 어렵다. 링크/폼 action 분석으로 대부분 추정 가능하지만, 최종 확인은 운영 라우팅 또는 접속 로그가 필요하다.

### 1.2 상품 목록/상세 필드와 노출 조건

소스에서 확인 가능하다.

- 상품 목록/검색/필터 SQL: `src/classes/Goods.php`
- 목록 필드: `product_code`, `product_name`, `product_name_en`, `release_date`, `price`, `discount`, `consumer_price`, `status`, `goods_sku`, `game_type`, `display_type`, `bundle_type`, `genre`, `category`, `product_platform`, `preorder_start`, `preorder_end`, `spoken_korean`, `interface_korean`, `exclusive_korean`, `subtitle_korean`, `is_bonus`, `is_preorder`, `delivery_type`, `domain`, `is_naverpay_coupon`, `soldout`
- 상세 필드: `getGoodsItemDetail`, `getGoodsItemDetailSku`, `getTitleInfo`, `getTitleInfoSku`
- 공통 노출 조건: `is_view='Y'`, `status='0'`
- 프로모션 적용 조건: 기간 내 `promotion_start <= now()`, `promotion_end >= now()`, `confirm='Y'`

내부 개발 산출물:

- 상품 목록 API 계약
- 상품 상세 API 계약
- 상품 상태/노출 조건 표
- legacy 목록 view type별 필드 매핑표

### 1.3 회원/인증 플로우와 세션 키

소스에서 확인 가능하다.

- 일반 회원 세션: `$_SESSION['member']`
- 관리자 세션: `$_SESSION['admin']`
- 퍼블리셔 세션: `$_SESSION['publisher']`
- 회원가입 단계 파일: `pc/member/join_step1.html` ~ `join_step5.html`
- 회원가입 처리: `pc/member/join_proc.php`, `src/classes/Member.php`
- 로그인/로그아웃: `pc/member/login_proc.php`, `pc/member/logout.php`
- 이메일 도메인 검증: `Member::chkJoinDomain`
- 이메일 인증/승인: `Member::setMemberAuth`, `approvalMember`, `authComplete`
- 본인/성인인증: `Member::isAuthAdult`, `Member::isAuthSelf`
- SNS 로그인/연동: `pc/api/naver/*`, `pc/api/payco/*`, `Member::setSnsMemberJoin`, `getSnsMemberChk`, `getMemberSnsLogin`
- OTP/비밀번호 재설정: `Member::getMemberOtp`, `setMemberOtp`, `deleteMemberOtp`, `memberPwdReset`

내부 개발 산출물:

- 회원 인증 API 계약
- 인증 실패 코드표
- SNS callback URL 목록
- 세션/쿠키 연동 방식 설계안

주의: 신규 프론트/백엔드가 legacy PHP 세션과 공존할지, 신규 세션 체계를 둘지는 구현 아키텍처 결정이다. 클라이언트 정책 질문이 아니라 개발팀 내부 설계 및 인프라 확인 항목이다.

### 1.4 장바구니/주문 계산과 상태 코드

소스에서 확인 가능하다.

- 장바구니 조회/계산: `src/classes/Order.php`, `pc/order/cart.html`, `pc/order/cart_proc.php`
- 주문서/결제 전 계산: `pc/order/settle.html`
- 결제 상태: `Order::getCheckoutStatus`
  - `1`: 입금대기
  - `2`: 결제완료
  - `8`: 환불요청
  - `9`: 환불완료
  - `99`: 취소완료
- 결제수단: `Order::getPaymentMethod`
  - `SC0010`: 신용카드
  - `SC0030`: 실시간 계좌이체
  - `SC0040`: 가상계좌
  - `SC0060`: 휴대폰
  - `DG0000`: 전액할인
  - `PAYCO`: 페이코
  - `samsung`: 삼성페이
  - `POINT`: 네이버포인트
  - `toss_bank`: 퀵계좌이체
  - `toss_pay`: 토스페이
- 주문 상태: `Order::getOrderStatus`
  - `1`: 주문대기
  - `2`: 주문완료
  - `3`: 배송준비
  - `4`: 배송중
  - `5`: 배송완료
  - `6`: 구매확정
  - `8`: 취소요청
  - `9`: 취소완료
- 배송 유형: `Order::getDeliveryType`
  - `1`: 코드발송
  - `2`: 택배발송
  - `3`: 코드+택배발송
- 코드 발송 상태: `Order::getOrderSendStatus`
  - `delivered`: 발송완료
  - `preorder`: 예약주문
  - `backorder`: 품절주문

내부 개발 산출물:

- 장바구니 API 계약
- 주문 예약/상세 API 계약
- 주문/결제/배송/발송 상태 코드표
- legacy alert/redirect 메시지 표

### 1.5 PG 결제 플로우와 redirect/callback

소스에서 확인 가능하다.

- KCP: `pc/order/kcp/kcp_reserve.php`, `kcp_api_pay.php`, `webhook.php`
- NaverPay: `pc/order/naverpay/naverpay_reserve.php`, `naverpay_apply.php`, `naverpay_cancel.php`
- Payco: `pc/order/payco/payco_reserve.php`, `payco_return.php`
- Toss: `pc/order/tosspayment/toss_reserve.php`, `toss_widget.php`, `toss_success.php`, `fail.html`
- TossPay: `pc/order/tosspay/tosspay_widget.php`, `success.php`, `fail.html`
- 전액할인: `pc/order/dgkr/order_full_discount.php`
- 결제 성공 이동: 대체로 `/order/order_end.html?settle_no=...`
- 결제 실패 이동: 대체로 `/order/order_fail.html?msg=...`

내부 개발 산출물:

- PG별 시퀀스 다이어그램
- PG별 reserve/approve/webhook/cancel API 계약
- 프론트 redirect URL 표
- PG 실패 메시지 매핑표

소스만으로 부족한 항목:

- 테스트 MID/key
- PG sandbox 접속 정보
- webhook 테스트 방법
- 운영/스테이징 callback 도메인 허용 여부

### 1.6 라이선스 활성화와 키 발급 조건

소스에서 확인 가능하다.

- 키 활성화: `pc/mypage/licence_activate.php`
- 취소완료 주문 차단 메시지: `이미 취소가 완료된 주문건입니다.`
- 예약상품 발송 전 차단 메시지: `해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.`
- 최초 1회 활성화 처리: `Asset::runReserve`
- 캐시/포인트 키 패턴 처리: `DIRECTG-CASH-*`, `*POINT`
- 활성화 시 포인트 적립: `Licence::setOrderEmoney`

내부 개발 산출물:

- 라이선스 활성화 API 계약
- 활성화 실패 코드표
- 키 조회/활성화 화면 문구 표

### 1.7 프로모션/쿠폰 동작

소스에서 확인 가능하다.

- 프로모션 목록/검색: `src/classes/Goods.php`, `src/classes/AdminPromotion.php`
- 프로모션 노출 조건: 기간 내, 승인 상태 `confirm='Y'`, 상품 `is_view='Y'`, 상품 `status='0'`
- 쿠폰 등록: `Mypage::setPaperCouponMember`
- 쿠폰 한도 필드: `issuePerPersonLimitCnt`, `dailyIssuePerPersonLimitCnt`, `issuePerPersonLimitYn`
- 쿠폰 코드 생성: `AdminPromotion::makeCouponCodeV2`

내부 개발 산출물:

- 프로모션 API 계약
- 쿠폰 등록 API 계약
- 쿠폰 실패 코드/문구 표

### 1.8 게시판/콘텐츠 접근 조건

소스에서 확인 가능하다.

- 공지: `Board::getNoticeList`, `pc/board/notice.html`
- FAQ: `Board::getFaqList`, `pc/board/faq.html`
- 이벤트 게시: `Board::getEvenBoardtList`
- 자료실 목록: `pc/board/dataroom.html`
- 자료실 노출 조건: `is_free='Y'`, `is_view='Y'`
- 자료실 다운로드 로그인 차단: `pc/board/dataroom_ps.php`
- 다운로드 이력: `Dataroom::setDataroomLog`
- HTML 출력: `Board::html_print2`, `Dataroom::html_print2`
- QnA 답변 메일: `pc/_Admin_/board/qna_ps.php`
- QnA 접수 내부 메일: `pc/mypage/mypage_qna_proc.php`

내부 개발 산출물:

- 게시판 API 계약
- 자료실 다운로드 API 계약
- QnA API 계약
- HTML 렌더링 허용 기준의 legacy 매핑

주의: 보안상 HTML sanitizer를 추가할지는 정책/보안 개선 영역이다. parity 기준이면 legacy 렌더링 방식을 우선 기록한다.

### 1.9 관리자 인증/메뉴/주문 처리 액션

소스에서 확인 가능하다.

- 관리자 로그인: `pc/_Admin_/login_ps.php`
- 관리자 공통 가드: `pc/_Admin_/lib/lib.php`
- 관리자 등급: `$_SESSION['admin']['admin_level']`
- 상품 뷰어 분기: `admin_level == "1"`
- 최고 관리자 제한 일부: `admin_level == "99"`
- topbar/menu: `pc/_Admin_/inc/topbar.php`
- goods sidebar: `pc/_Admin_/inc/sidebar_goods.php`
- 주문 처리 액션: `pc/_Admin_/order/order_ps.php`
  - `payco_refund`
  - `payco_cancel`
  - `kcp_refund`
  - `toss_refund`
  - `tosspay_refund`
  - `naverpay_refund`
  - `point_refund`
  - `order_refund`
  - `order_item_cancel`
  - `resend`
  - `memo_add`
  - `order_reject`
  - `register_tracking_no`
  - `shipment_shipping`
  - `shipment_shipped`
  - `actual_delivery`
  - `register_tracking_no_item`
- 주문 감사 로그: `AdminOrder::setOrderLog`

내부 개발 산출물:

- 관리자 인증 API 계약
- 관리자 메뉴/권한 API 계약
- 관리자 주문 처리 mutation API 계약
- 주문 처리 감사 로그 계약

### 1.10 재고/공급사 연동

소스에서 확인 가능하다.

- 자체 재고 API 연동: `src/classes/Asset.php`
- 재고 체크 처리: `pc/_Admin_/goods/stock/asset_stock_ps.php`
- 개별 재고 체크: `stock_chk`
- 저재고 일괄 체크: `stock_chk_batch`
- 저재고 기준: `30`
- Asset 주문 키 예약: `OrderFulfillment_Asset.php`, `Asset::runReserveRegister`
- Asset 예약 실패 시 발급 실패: `send_status='fail'`
- 공급사별 디스패처: `OrderFulfillment.php`

내부 개발 산출물:

- 재고 조회/동기화 API 계약
- 공급사별 발급 상태 매핑표
- 재발송 가능 여부 조건표

### 1.11 SEO/외부 채널

소스에서 확인 가능하다.

- sitemap: `pc/sitemap_game.php`, `pc/sitemap_dlc.php`
- sitemap 상품 조건: `is_view='Y'`, `sales_status='S'`
- 네이버쇼핑 EP: `pc/navershop/naver.php`, `pc/navershop/naver_all.php`
- EP 대상 목록: `naver_ep_list`
- robots: `pc/robots.txt`
- 모바일 게이트: `pc/lib/lib.php`, `mobile/mgate.php`
- PWA manifest: `pc/manifest.json`, `mobile/manifest.json`

내부 개발 산출물:

- sitemap 생성 명세
- 네이버쇼핑 EP 명세
- robots 이관 명세
- PC/Mobile canonical/alternate 조사 결과

## 2. 외부 확인이 필요한 항목

아래 항목만 클라이언트 또는 운영 담당자에게 확인한다. 소스 분석만으로는 확정할 수 없다.

### 2.1 운영 서버 기준 라이브 파일/라우트

대체 파일이 많아 소스만으로 실제 운영 진입점을 100% 확정하기 어렵다.

확인 요청:

- 현재 운영 서버에서 사용 중인 legacy URL 목록
- `yjs_*`, `kdy_*`, 날짜 접미 파일 중 실제 라우팅되는 파일
- 운영 서버 rewrite/vhost 설정
- 가능하면 최근 접속 로그 기반 상위 URL 목록

### 2.2 개발/스테이징 환경 정보

확인 요청:

- 개발 API base URL
- 스테이징 API base URL
- 운영 API base URL
- 쿠키 도메인
- CORS 허용 도메인
- 프론트 배포 도메인
- webhook 수신 가능 도메인

### 2.3 테스트 계정과 테스트 데이터

확인 요청:

- 일반 회원 테스트 계정
- 본인인증 완료 회원
- 성인인증 완료 회원
- 관리자 등급별 계정
- 퍼블리셔 계정
- 일반 상품
- DLC
- 번들
- 예약상품
- 성인인증 상품
- 본인인증 필수 상품
- 품절 상품
- 발급실패 주문
- 가상계좌 입금대기 주문
- 환불 가능 주문
- 환불 불가 주문

### 2.4 외부 연동 테스트 정보

확인 요청:

- KCP 테스트 MID/key
- Toss 테스트 key
- TossPay 테스트 정보
- NaverPay 테스트 정보
- Payco 테스트 정보
- SNS 로그인 테스트 client id/secret
- 휴대폰 본인인증 테스트 정보
- DirectSend 테스트 또는 대체 발송 정보
- Asset 재고 API 테스트 서버/토큰
- Genba/Vaultn/Ztorm/PointNexus 테스트 정보

### 2.5 파일/이미지/첨부파일 접근 정보

확인 요청:

- 상품 이미지 base URL
- 스크린샷/동영상 base URL
- 배너 이미지 base URL
- 에디터 업로드 이미지 base URL
- 자료실 첨부파일 base URL
- 신규 개발/스테이징에서 파일 접근 가능한지 여부

### 2.6 실데이터 접근과 마스킹

확인 요청:

- 개발팀이 조회 가능한 DB 범위
- 개인정보 마스킹 데이터 제공 여부
- 주문/결제/회원 샘플 데이터 제공 방식
- 운영 DB 직접 접근 가능 여부 또는 dump 제공 방식

## 3. 클라이언트에게 묻지 않고 내부에서 작성할 산출물

백엔드 개발자와 함께 legacy 소스 분석 후 작성한다.

1. 화면/URL 인벤토리
2. legacy URL -> 신규 라우트 매핑표
3. 상품 목록/상세 API 계약
4. 회원/인증 API 계약
5. 장바구니/주문 API 계약
6. PG별 결제 시퀀스
7. 주문/결제/배송/발송 상태 코드표
8. 라이선스 활성화 실패 코드표
9. 프로모션/쿠폰 API 계약
10. 게시판/자료실/QnA API 계약
11. 관리자 주문 처리 mutation API 계약
12. 재고/공급사 상태 매핑표
13. SEO/sitemap/EP 이관 명세
14. legacy alert/redirect 문구표

## 4. 결론

기존 질문 중 대부분의 기능 동작, 상태 코드, 화면 문구, URL, PG 흐름, 게시판 접근 조건, 관리자 액션은 legacy 소스에서 확인 가능하다.

클라이언트 미팅에서는 기능 정책을 다시 묻기보다, 다음만 확인하는 것이 적절하다.

- 운영 서버에서 실제 사용 중인 URL/파일
- 개발/스테이징/운영 환경 정보
- PG/SNS/본인인증/메일/재고 등 외부 연동 테스트 정보
- 테스트 계정과 엣지 케이스 데이터
- 파일/이미지/첨부파일 접근 경로
- 실데이터 접근 및 마스킹 제공 방식

