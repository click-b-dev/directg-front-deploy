# 레거시 어드민(`_Admin_`) 구조·정책·기능 정의

directg.net 레거시 PHP 어드민(내부 운영 백오피스 `pc/_Admin_/` 약 530개 파일 + 배급사용 퍼블리셔 포털 `pc/_Admin2_/publisher/`)의 **구조 · 페이지별 기능 · 정책**을 정리한 문서 묶음이다.
`apps/directg-admin`(Vite SPA)로의 마이그레이션 **기반 문서**로, 화면 이관 시 무엇을 어떤 규칙으로 재현해야 하는지의 출발점이다.

> `_Admin_`(내부 임직원)과 `_Admin2_`(외부 배급사)는 계정·DB·세션이 완전히 분리된 별개 시스템이다(80번 문서 참조).

## 읽는 순서

- 전체 구조를 정독할 때는 **[00-overview.md](./00-overview.md)** 를 먼저 읽는다.
- 단위 이관 중에는 `admin-migration-unit`의 참조 문서 라우팅을 우선한다. 담당 영역 문서 1개를 먼저 읽고, 공통 부트스트랩·인증/권한·레이아웃 판단이 실제로 필요할 때만 `00-overview.md`를 추가 참조한다.

## 문서 구성

| 문서 | 영역 | 대상 코드 | 상위 메뉴 진입점 |
|------|------|-----------|------------------|
| [00-overview](./00-overview.md) | 공통 인프라·인증·레이아웃·대시보드 | `lib/`, `inc/`, `main.php`, `login_ps.php` | — |
| [10-site-policy-tag-api](./10-site-policy-tag-api.md) | 사이트 설정·정책·태그·템플릿·API | `site/`, `policy/`, `tag/`, `templete/`, `api/` | `site/banner_list.php` |
| [20-goods-catalog](./20-goods-catalog.md) | 상품(타이틀·옵션·그룹) | `goods/`(루트), `goods/group/` | `goods/dashboard_goods.php` |
| [21-goods-stock-integration](./21-goods-stock-integration.md) | 재고·외부 공급사 연동 | `goods/{stock,asset,genba,vaultn,ztorm,pointnexus,grac,epic}/`, `steam/`, `youtube/` | `goods/stock/dashboard_stock.php` |
| [30-member-board](./30-member-board.md) | 회원(CRM)·게시판 | `member/`, `board/` | `member/dashboard_crm.php`, `board/dashboard_board.php` |
| [40-order](./40-order.md) | 주문(결제·이행·취소/환불·배송·정산) | `order/`, `order/batch/` | `order/dashboard_order.php` |
| [50-promotion-event](./50-promotion-event.md) | 프로모션·이벤트·구매이벤트·추첨 | `promotion/`, `event/` | `promotion/dashboard_promotion.php`, `event/event_board_list.php` |
| [60-statistics](./60-statistics.md) | 통계 | `statistics/{order,sales,goods,promotion,event}/` | `statistics/order/order_day_count.php` |
| [70-partner-code-china](./70-partner-code-china.md) | 파트너·퍼블리셔/코드·중국 | `partner/`, `code/`, `publisher/`, `china/` | `partner/partner_list.php`, `china/invoice_list.php` |
| [80-publisher-portal](./80-publisher-portal.md) | 퍼블리셔(배급사) 포털 — **`_Admin_`과 분리된 별개 시스템** | `_Admin2_/publisher/` | `_Admin2_/publisher/main.php` |

## 각 페이지 정의 형식

섹션 문서의 페이지별 항목은 다음 필드로 기술한다.

- **유형** — 목록 / 상세 / 폼 / 처리(ps) / AJAX(json) / 엑셀
- **기능** — 화면이 하는 일
- **정책·규칙** — 권한(`admin_level`) 분기, 입력 검증, 비즈니스 규칙, 상태값/전이
- **데이터 소스** — 도메인 클래스(메서드) / 주요 테이블
- **폼 필드/파라미터** — 입력·검증(폼·처리 화면)
- **연계** — 연관 페이지·ps·외부 연동
- **참조** — 관련 도메인 계약 문서

## 진실 원천 계층

1. **동작 계약(규칙·상태전이·정산·이행)** → `../legacy-project/docs/`의 도메인 문서(`ORDER-WORKFLOW-AUDIT`, `PAYMENT-APPROVAL`, `PARTNER-SETTLEMENT`, `ADMIN-AUTHORIZATION` 등).
2. **화면 구조·기능·정책 매핑(본 묶음)** → 위 계약을 어드민 화면이 어떻게 조작·노출하는지.
3. **원본 코드**(수정 금지) → 프로젝트 지침의 `LEGACY_ROOT`를 따른다. directg-front에서는 `../legacy-project/pc/_Admin_/`를 원본으로 사용하고, 저장소 내부 `legacy-project/` 사본은 비교·탐색하지 않는다.

> 본 묶음은 코드에서 실제 확인한 사실 위주로 작성됐고, 불확실한 부분은 "추정"으로 표기했다.
> 이관 진행 상태(화면↔라우트 매핑, 완료/검증)는 별도로 `docs/MIGRATION-MAP.md`에서 추적한다.
