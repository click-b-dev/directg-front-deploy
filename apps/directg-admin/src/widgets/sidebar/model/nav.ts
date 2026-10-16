// legacy _Admin_/inc/sidebar_*.php — 영역별 side-nav.
// 링크는 legacy URL에서 `.php` 제거. `[X]`/`[타임딜]` placeholder는 legacy 라벨 유지.
// 주석 처리된 항목은 미포함. 경로 area로 트리를 전환한다(resolveSideNav).

export type SideNavLink = {
  type: "link";
  label: string;
  href: string;
  match: string;
  icon: string;
};

export type SideNavGroup = {
  type: "group";
  label: string;
  icon: string;
  id: string;
  children: readonly { label: string; href: string }[];
};

export type SideNavEntry = SideNavLink | SideNavGroup;

export const SITE_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: "운영서비스 현황 ",
    href: "/site/dg_operation_service",
    match: "/site/dg_operation_service",
    icon: "uil uil-dashboard font-22",
  },
  {
    type: "group",
    label: "사이트 관리",
    icon: "uil uil-image font-22",
    id: "sidebarSite",
    children: [
      { label: "메인배너 관리", href: "/site/banner_list" },
      { label: "추천 및 특집 관리", href: "/site/main_recommand" },
      { label: "추천 검색어 관리", href: "/site/search_recommand" },
      { label: "[X] 기획배너 관리", href: "#" },
      { label: "[X] 인기 게임 관리", href: "#" },
    ],
  },
];

// legacy _Admin_/inc/sidebar_goods.php (non-viewer 전체판). 주석 항목 제외.
// 상단 대시보드 link + 15개 그룹. 아이콘 클래스는 legacy 그대로: 대시보드 link만 font-22,
// 그룹 아이콘(uil-store/bi bi-steam/uil-shop)은 font-22 없음(기본 크기). bi bi-steam은 index.html의
// bootstrap-icons로 표시.
export const GOODS_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: "상품 대시보드",
    href: "/goods/dashboard_goods",
    match: "/goods/dashboard_goods",
    icon: "uil uil-dashboard font-22",
  },
  {
    type: "group",
    label: "대표상품 관리",
    icon: "uil-store",
    id: "sidebarTitle",
    children: [
      { label: "디지털상품 목록", href: "/goods/title_list" },
      { label: "실물상품 목록", href: "/goods/accessories_list" },
      { label: "심의정보 등록확인", href: "/goods/title_grac_chk" },
    ],
  },
  {
    type: "group",
    label: "대표상품 이미지 관리",
    icon: "uil-store",
    id: "sidebarTitleImage",
    children: [
      { label: "Header 관리", href: "/goods/title_image_header_chk" },
      { label: "Library capsule 관리", href: "/goods/title_image_library_capsule_chk" },
      { label: "Vertical capsule 관리", href: "/goods/title_image_vertical_capsule_chk" },
    ],
  },
  {
    type: "group",
    label: "옵션상품 관리",
    icon: "uil-store",
    id: "sidebarGoodsItem",
    children: [
      { label: "옵션상품 목록", href: "/goods/goods_option_list" },
      { label: "실물상품 목록", href: "/goods/goods_etc_list" },
      { label: "홀로모델 옵션상품", href: "/goods/goods_holomodels_list" },
      { label: "[X] Randombox 목록", href: "/goods/goods_randombox_list" },
      { label: "[타임딜] 목록", href: "/goods/goods_timedeal_list" },
      { label: "판매종료 옵션상품", href: "/goods/goods_option_end" },
    ],
  },
  {
    type: "group",
    label: "옵션상품 이미지 관리",
    icon: "uil-store",
    id: "sidebarGoodsOptionImage",
    children: [
      { label: "Header 관리", href: "/goods/goods_option_image_chk" },
      { label: "DLC 스크린샷 관리", href: "/goods/goods_option_screenshot_chk" },
    ],
  },
  {
    type: "group",
    label: "제공컨텐츠 관리",
    icon: "uil-store",
    id: "sidebarSupply",
    children: [
      { label: "제공컨텐츠  현황", href: "/goods/supply_content" },
      { label: "회원별 제공 컨텐츠 조회", href: "/goods/supply_content_member" },
      { label: "제공컨텐츠 다운로드 현황", href: "/goods/supply_content_download" },
    ],
  },
  {
    type: "group",
    label: "한글패치 관리",
    icon: "uil-store",
    id: "sidebarPatch",
    children: [
      { label: "한글패치 현황", href: "/goods/korean_patch" },
      { label: "한글패치 인증정보 확인", href: "/goods/korean_patch_auth" },
    ],
  },
  {
    type: "group",
    label: "심의정보 관리",
    icon: "uil-store",
    id: "sidebarGrac",
    children: [{ label: "심의정보 현황", href: "/goods/grac/grac_list" }],
  },
  {
    type: "group",
    label: "Steam API",
    icon: "bi bi-steam",
    id: "sidebarSteam",
    children: [
      { label: "스팀 Apps 검색", href: "/steam/steam_apps_list" },
      { label: "스팀 Game 현황", href: "/steam/steam_game_list" },
      { label: "스팀 DLC 현황", href: "/steam/steam_dlc_list" },
      { label: "스팀 Package 현황", href: "/steam/steam_package_list" },
      { label: "스팀 평가 현황", href: "/steam/steam_review_list" },
      { label: "스팀 Apps list", href: "/steam/steam_apps_list_all" },
      { label: "스팀 Apps 출시예정작", href: "/steam/steam_apps_comingsoon" },
      { label: "스팀 Apps 추천수 순위", href: "/steam/steam_apps_ranking" },
    ],
  },
  {
    type: "group",
    label: "Ztorm API",
    icon: "uil-shop",
    id: "sidebarZtorm",
    children: [
      { label: "Ztorm 연결확인", href: "/goods/ztorm/ztorm_ping" },
      { label: "Ztorm 퍼블리셔 현황", href: "/goods/ztorm/ztorm_publisher_list" },
      { label: "Ztorm 카탈로그 현황", href: "/goods/ztorm/ztorm_catalogue" },
      { label: "Ztorm 프로모션 현황", href: "/goods/ztorm/ztorm_promotion" },
    ],
  },
  {
    type: "group",
    label: "Genba API",
    icon: "uil-shop",
    id: "sidebarGenba",
    children: [
      { label: "Genba 연결확인", href: "/goods/genba/genba_ping" },
      { label: "Genba 퍼블리셔 관리", href: "/goods/genba/genba_publisher" },
      { label: "Genba 타이틀 현황", href: "/goods/genba/genba_title" },
      { label: "Genba 카탈로그 현황", href: "/goods/genba/genba_product_sync" },
      { label: "Genba 프로모션 관리", href: "/goods/genba/genba_promotion_sync" },
    ],
  },
  {
    type: "group",
    label: "Vaultn API",
    icon: "uil-shop",
    id: "sidebarVaultn",
    children: [
      { label: "Vaultn 연결확인", href: "/goods/vaultn/vaultn_ping" },
      { label: "Valutn 퍼블리셔 현황", href: "/goods/vaultn/vaultn_connection" },
      { label: "Valutn 카탈로그 현황", href: "/goods/vaultn/vaultn_catalogue" },
    ],
  },
  {
    type: "group",
    label: "PointNexus API",
    icon: "uil-shop",
    id: "sidebarPointNexus",
    children: [
      { label: "PointNexus Catalogue 조회", href: "/goods/pointnexus/pointnexus_catalogue" },
      { label: "PointNexus Catalogue 동기화", href: "/goods/pointnexus/pointnexus_catalogue_sync" },
      { label: "PointNexus 연결확인", href: "/goods/pointnexus/pointnexus_ping" },
      { label: "PointNexus 상품타입 현황", href: "/goods/pointnexus/pointnexus_product_type" },
      { label: "PointNexus 상품 현황", href: "/goods/pointnexus/pointnexus_product" },
      { label: "PointNexus 프로모션 현황", href: "/goods/pointnexus/pointnexus_promo" },
      { label: "PointNexus 파트너 현황", href: "/goods/pointnexus/pointnexus_partner" },
      { label: "PointNexus 오퍼레이션 조회", href: "/goods/pointnexus/pointnexus_operation" },
      { label: "PointNexus 캡슐 조회", href: "/goods/pointnexus/pointnexus_capsule" },
      { label: "PointNexus 활동로그", href: "/goods/pointnexus/pointnexus_activity_log" },
      { label: "PointNexus Book Confirm", href: "/goods/pointnexus/pointnexus_book_confirm" },
      {
        label: "PointNexus VCNT 미입금 만료 취소",
        href: "/goods/pointnexus/pointnexus_vcnt_cancel",
      },
      {
        label: "PointNexus 취소 검증(cancel_pending)",
        href: "/goods/pointnexus/pointnexus_cancel_verify",
      },
    ],
  },
  {
    type: "group",
    label: "TAG 관리",
    icon: "uil-store",
    id: "sidebarTag",
    children: [
      { label: "TAG 그룹현황", href: "/tag/tag_group_list" },
      { label: "TAG 그룹설정", href: "/tag/tag_group_setting" },
    ],
  },
  {
    type: "group",
    label: "코드 관리",
    icon: "uil-store",
    id: "sidebarCode",
    children: [
      { label: "플랫폼 설정", href: "/code/platform_list" },
      { label: "공급처 설정", href: "/code/publisher_list" },
      { label: "배송방법 설정", href: "/code/delivery_method" },
    ],
  },
  {
    type: "group",
    label: "그룹 관리",
    icon: "uil-store",
    id: "sidebarGroup",
    children: [{ label: "그룹 현황", href: "/goods/group/group_list" }],
  },
];

// legacy _Admin_/inc/sidebar_board.php. 대시보드 link + 5개 그룹.
// 모든 그룹 `collapse show`(expandAll). 아이콘: 대시보드 link만 font-22, 그룹은 uil-shop(기본 크기).
// 제외: [DGKR] 목록(HTML 주석), 문의하기 상세/답변작성(display:none), 설문조사 등록/결과(d-none).
// legacy 버그: 자료실·설문조사 그룹이 동일 id="sidebarDataroom" 사용(복붙 잔재) → 초기 표시는
// 동일(둘 다 펼침)하되 유니크 id(sidebarDataroom/sidebarSurvey)로 독립 토글되게 이식.
export const BOARD_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: "대시보드 ",
    href: "/board/dashboard_board",
    match: "/board/dashboard_board",
    icon: "uil uil-dashboard font-22",
  },
  {
    type: "group",
    label: "공지사항 관리",
    icon: "uil-shop",
    id: "sidebarNotice",
    children: [
      { label: "공지사항 목록", href: "/board/notice_list" },
      { label: "공지사항 등록", href: "/board/notice_register" },
    ],
  },
  {
    type: "group",
    label: "자주묻는질문 관리",
    icon: "uil-shop",
    id: "sidebarFaq",
    children: [
      { label: "자주묻는질문 목록", href: "/board/faq_list" },
      { label: "자주묻는질문 등록", href: "/board/faq_register" },
    ],
  },
  {
    type: "group",
    label: "문의하기 관리",
    icon: "uil-shop",
    id: "sidebarQna",
    children: [{ label: "문의하기 목록", href: "/board/qna_list" }],
  },
  {
    type: "group",
    label: "자료실 관리",
    icon: "uil-shop",
    id: "sidebarDataroom",
    children: [
      { label: "자료실 파일현황", href: "/board/dataroom_file" },
      { label: "자료실 다운로드현황", href: "/board/dataroom_download" },
    ],
  },
  {
    type: "group",
    label: "설문조사 관리",
    icon: "uil-shop",
    id: "sidebarSurvey",
    children: [{ label: "설문조사 목록", href: "/board/survey_list" }],
  },
];

// legacy _Admin_/inc/sidebar_event.php. 5개 그룹, 모든 그룹 collapse show(expandAll). 대시보드 link 없음.
// 아이콘: 모든 그룹 uil-shop(기본 크기). 제외: 추첨 이벤트 등록(HTML 주석)·[X]사은품 발송완료(HTML 주석)·
// 이벤트 현황 상세/사은품 진행이력 상세(display:none). 2025 가정의달·여름 프로모션은 실재 메뉴로 포함.
export const EVENT_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "group",
    label: "이벤트 게시판 관리",
    icon: "uil-shop",
    id: "sidebarEvent",
    children: [
      { label: "이벤트 게시판 목록", href: "/event/event_board_list" },
      { label: "이벤트 게시판 작성", href: "/event/event_board_register" },
    ],
  },
  {
    type: "group",
    label: "이벤트 관리",
    icon: "uil-shop",
    id: "sidebarEventLottery",
    children: [
      { label: "이벤트 현황", href: "/event/event_lottery_list" },
      { label: "2025 가정의달 이벤트", href: "/event/event_list_202505" },
      { label: "2025 여름 프로모션 이벤트", href: "/event/event_list_20250626" },
    ],
  },
  {
    type: "group",
    label: "구매 이벤트 관리",
    icon: "uil-shop",
    id: "sidebarEventOrder",
    children: [{ label: "풋볼 매니저 26 예약 구매", href: "/event/event_fm26" }],
  },
  {
    type: "group",
    label: "사은품 관리",
    icon: "uil-shop",
    id: "sidebarEventGift",
    children: [
      { label: "사은품 이벤트 진행이력", href: "/event/event_gift_list" },
      { label: "사은품 발송 현황", href: "/event/event_gift_request" },
    ],
  },
  {
    type: "group",
    label: "추가 포인트 지급 관리",
    icon: "uil-shop",
    id: "sidebarEventPoint",
    children: [{ label: "포인트 지급 이벤트", href: "/event/event_point_list" }],
  },
];

// legacy _Admin_/inc/sidebar_stock.php. 대시보드 link + 4개 그룹, 모든 그룹 collapse show(expandAll).
// 실제 파일 위치는 goods/stock/·goods/asset/ → 경로 /goods/stock·/goods/asset로 전환.
// 아이콘: 대시보드 link만 font-22, 그룹은 uil-shop(기본 크기). 주석 항목(asset_search/asset_publisher/
// 구매관리 그룹/통합재고현황 등) 제외. 미이관 링크는 순차 이관 시 라우트 생성.
export const STOCK_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: " 재고 대시보드 ",
    href: "/goods/stock/dashboard_stock",
    match: "/goods/stock/dashboard_stock",
    icon: "uil uil-dashboard font-22",
  },
  {
    type: "group",
    label: "Asset 서버 관리(API)",
    icon: "uil-shop",
    id: "sidebarAsset",
    children: [
      { label: "Asset 현황", href: "/goods/asset/asset_list" },
      { label: "Asset 등록", href: "/goods/asset/asset_register" },
      { label: "Asset 예약현황", href: "/goods/asset/asset_reserve_list" },
      { label: "Asset 다운로드", href: "/goods/asset/asset_download_list" },
      { label: "Asset Code 현황", href: "/goods/asset/asset_code_list" },
      { label: "Asset Code 등록", href: "/goods/asset/asset_code_register" },
    ],
  },
  {
    type: "group",
    label: "Vaultn 재고(API)",
    icon: "uil-shop",
    id: "sidebarVaultn",
    children: [{ label: "Vaultn 재고현황", href: "/goods/stock/vaultn_stock" }],
  },
  {
    type: "group",
    label: "재고 관리(DB)",
    icon: "uil-shop",
    id: "sidebarStock",
    children: [
      { label: "Asset 재고현황", href: "/goods/stock/asset_stock" },
      { label: "옵션상품 재고현황", href: "/goods/stock/goods_option_stock" },
      { label: "할인 프로모션 재고현황", href: "/goods/stock/goods_promotion_stock" },
      { label: "Asset 랜덤박스 재고현황", href: "/goods/stock/asset_stock_random" },
    ],
  },
  {
    type: "group",
    label: "Genba Webhook Log",
    icon: "uil-shop",
    id: "sidebarStockGenba",
    children: [{ label: "availability log", href: "/goods/stock/genba_avaliability" }],
  },
];

// legacy _Admin_/inc/sidebar_promotion.php. 대시보드 link + 5개 그룹, 모든 그룹 collapse show(expandAll).
// 아이콘: 대시보드 link만 font-22, 그룹은 uil-shop(기본 크기).
// 제외: 할인 프로모션 등록/프로모션 동기화(HTML 주석)·쿠폰 관리 그룹(HTML 주석+파일 부재)·
// 오프라인 쿠폰 상세(d-none, 링크 대상). 타임딜 그룹은 [X] 라벨+죽은 링크로 이식(goods Randombox 선례).
export const PROMOTION_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: "프로모션 대시보드",
    href: "/promotion/dashboard_promotion",
    match: "/promotion/dashboard_promotion",
    icon: "uil uil-dashboard font-22",
  },
  {
    type: "group",
    label: "할인 프로모션 관리",
    icon: "uil-shop",
    id: "sidebarPromotion",
    children: [
      { label: "승인대기 할인 프로모션", href: "/promotion/promotion_ready" },
      { label: "진행중인 할인 프로모션", href: "/promotion/promotion_ing" },
      { label: "진행예정 할인 프로모션", href: "/promotion/promotion_upcoming" },
      { label: "종료된 할인 프로모션", href: "/promotion/promotion_end" },
    ],
  },
  {
    type: "group",
    label: "주말특가 프로모션 관리",
    icon: "uil-shop",
    id: "sidebarPromotionWeekend",
    children: [
      { label: "주말특가 프로모션 목록", href: "/promotion/promotion_weekend" },
      { label: "주말특가 프로모션 등록", href: "/promotion/promotion_weekend_register" },
    ],
  },
  {
    type: "group",
    label: "대규모 프로모션 관리",
    icon: "uil-shop",
    id: "sidebarPromotionSeason",
    children: [
      { label: "대규모 프로모션 목록", href: "/promotion/promotion_season" },
      { label: "대규모 프로모션 등록", href: "/promotion/promotion_season_register" },
    ],
  },
  {
    type: "group",
    label: "타임딜 관리",
    icon: "uil-shop",
    id: "sidebarTimedeal",
    children: [
      { label: "[X] 타임딜 현황", href: "/promotion/timedeal_list" },
      { label: "[X] 타임딜 등록", href: "/promotion/timedeal_register" },
    ],
  },
  {
    type: "group",
    label: "오프라인 쿠폰 관리",
    icon: "uil-shop",
    id: "sidebarCouponOffline",
    children: [
      { label: "오프라인 쿠폰 리스트", href: "/promotion/offline_coupon_list" },
      { label: "오프라인 쿠폰 등록", href: "/promotion/offline_coupon_register" },
    ],
  },
];

// legacy _Admin_/inc/sidebar_member.php. 대시보드 link + 3개 그룹, 모든 그룹 collapse show(expandAll).
// 대시보드 아이콘은 uil-comments-alt(font-22 없음), 그룹은 uil-shop(기본 크기).
// 제외: 회원 상세(display:none 링크 대상)·회원 관리/자동메일 그룹 내 HTML 주석 항목([x] dead).
export const MEMBER_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: "회원 대시보드",
    href: "/member/dashboard_crm",
    match: "/member/dashboard_crm",
    icon: "uil-comments-alt",
  },
  {
    type: "group",
    label: "회원 관리",
    icon: "uil-shop",
    id: "sidebarMember",
    children: [
      { label: "회원 리스트", href: "/member/member_list" },
      { label: "승인대기 리스트", href: "/member/member_list_ready" },
      { label: "간편로그인 연동현황(NAVER)", href: "/member/member_naver_list" },
      { label: "간편로그인 연동현황(KAKAO)", href: "/member/member_kakao_list" },
      { label: "간편로그인 연동현황(PAYCO)", href: "/member/member_payco_list" },
    ],
  },
  {
    type: "group",
    label: "포인트 관리",
    icon: "uil-shop",
    id: "sidebarEmoney",
    children: [
      { label: "포인트 지급/차감 내역", href: "/member/member_point_list" },
      { label: "포인트 지급/차감", href: "/member/member_point_form" },
    ],
  },
  {
    type: "group",
    label: "자동메일 관리",
    icon: "uil-shop",
    id: "sidebarAutoEmail",
    children: [
      { label: "자동메일 잔액조회", href: "/member/directsend_remaining_emoney" },
      { label: "자동메일발송 로그", href: "/member/directsend_mail_log" },
    ],
  },
];

// legacy _Admin_/inc/sidebar_order.php. 대시보드 link + 7개 그룹.
// 대시보드 아이콘은 uil-comments-alt(font-22 없음, member 사이드바와 동일), 그룹은 uil-shop(기본 크기).
// 다른 영역과 달리 모든 그룹이 markup에서 `collapse`(초기 접힘, show 없음) → goods 아코디언 방식(expandAll=false)으로 이식.
// 제외: 주문 관리 v1 그룹(HTML 주석)·반품/교환 관리 v2 그룹(HTML 주석)·각 그룹 내 주석 항목
// (order_sync 동기화 / Asset·Ztorm·Genba·Vaultn 예약주문·주문실패·주문취소). 미이관 링크는 순차 이관 시 라우트 생성.
export const ORDER_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "link",
    label: "주문 대시보드 ",
    href: "/order/dashboard_order",
    match: "/order/dashboard_order",
    icon: "uil-comments-alt",
  },
  {
    type: "group",
    label: "결제 관리 v2",
    icon: "uil-shop",
    id: "sidebarPayment",
    children: [
      { label: "입금대기 리스트", href: "/order/order_step1" },
      { label: "결제완료 리스트", href: "/order/order_step2" },
      { label: "가상계좌 리스트", href: "/order/order_vbank" },
    ],
  },
  {
    type: "group",
    label: "주문 관리 v2",
    icon: "uil-shop",
    id: "sidebarOrder",
    children: [
      { label: "주문통합 리스트", href: "/order/order_all" },
      { label: "주문대기 리스트", href: "/order/order_ready" },
      { label: "주문완료 리스트", href: "/order/order_success" },
      { label: "취소요청 리스트", href: "/order/order_cancel_request" },
      { label: "취소완료 리스트", href: "/order/order_cancel_complete" },
      { label: "과거주문 리스트", href: "/order/order_old_list" },
    ],
  },
  {
    type: "group",
    label: "배송 주문 관리 v2",
    icon: "uil-shop",
    id: "sidebarOrderDelivery",
    children: [
      { label: "배송통합 리스트", href: "/order/order_shipment_all" },
      { label: "배송대기 리스트", href: "/order/order_shipment_pending" },
      { label: "배송준비 리스트", href: "/order/order_shipment_ready" },
      { label: "배송중 리스트", href: "/order/order_shipment_shipping" },
      { label: "배송완료 리스트", href: "/order/order_shipment_delivered" },
      { label: "구매확정 리스트", href: "/order/order_shipment_confirm" },
    ],
  },
  {
    type: "group",
    label: "Asset 주문 관리",
    icon: "uil-shop",
    id: "sidebarOrderAsset",
    children: [
      { label: "Asset 주문완료", href: "/order/order_asset_success" },
      { label: "Asset 주문조회", href: "/order/order_asset_key" },
      { label: "Asset 주문 일괄조회", href: "/order/order_asset_key_bulk" },
    ],
  },
  {
    type: "group",
    label: "Ztorm 주문 관리",
    icon: "uil-shop",
    id: "sidebarOrderZtorm",
    children: [
      { label: "Ztorm 주문완료", href: "/order/order_ztorm_success" },
      { label: "Ztorm 주문조회", href: "/order/ztorm_order_view" },
    ],
  },
  {
    type: "group",
    label: "Genba 주문 관리",
    icon: "uil-shop",
    id: "sidebarOrderGenba",
    children: [
      { label: "Genba 주문완료", href: "/order/order_genba_success" },
      { label: "Genba 주문조회", href: "/order/genba_order_view" },
    ],
  },
  {
    type: "group",
    label: "Vaultn 주문 관리",
    icon: "uil-shop",
    id: "sidebarOrderVaultn",
    children: [
      { label: "Vaultn 주문완료", href: "/order/order_vaultn_success" },
      { label: "Vaultn 주문조회", href: "/order/vaultn_order_view" },
    ],
  },
];

// legacy _Admin_/inc/sidebar_china.php. 단일 그룹 "중국 결제 관리"(collapse show, expandAll).
// 대시보드 link 없음. 그룹 아이콘 uil-shop(기본 크기). china/ 파일은 모두 /china 경로로 매핑.
// 미이관 링크는 순차 이관 시 라우트 생성. invoice_print(빈 파일)·invoice_view/modify(링크 대상)는 사이드바 미노출.
export const CHINA_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "group",
    label: "중국 결제 관리",
    icon: "uil-shop",
    id: "sidebarChina",
    children: [
      { label: "중국 결제자 리스트", href: "/china/invoice_member" },
      { label: "중국 결제 상품리스트", href: "/china/invoice_goods" },
      { label: "중국 결제 주문서 작성", href: "/china/invoice_register" },
      { label: "중국 결제요청 리스트", href: "/china/invoice_request" },
      { label: "중국 결제완료 리스트", href: "/china/invoice_list" },
      { label: "중국 누적매출 현황", href: "/china/sales_china_year" },
      { label: "중국 월별매출 현황", href: "/china/sales_china_month" },
      { label: "중국 월별주문 현황", href: "/china/order_china_month" },
    ],
  },
];

// legacy _Admin_/inc/sidebar_statistics.php. 대시보드 link 없음. 9개 그룹, 모든 그룹 markup에서
// `collapse`(초기 접힘, show 없음) → order 선례처럼 아코디언(expandAll=false, active 그룹만 펼침).
// 그룹 아이콘은 모두 uil-shop(기본 크기). statistics/ 파일은 /statistics 경로로 매핑.
// 제외(HTML 주석): 회원 분석 그룹·상품 분석 내 공급처/예약/장바구니/위시리스트·주문 분석 내 실물/누적순위·
// Asset 퍼블리셔/누적·Ztorm 누적·제휴DG 분석·프로모션 분석(별도)·랜덤박스 통계.
// [X] 결제수단별/포인트 적립·사용(sales_settlekind/sales_emoney)은 legacy 파일 부재 → goods Randombox 선례처럼
// [X] 라벨+href 유지, 라우트 미생성(죽은 링크).
export const STATISTICS_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "group",
    label: "상품 분석",
    icon: "uil-shop",
    id: "sidebarGoods",
    children: [
      { label: "인기타이틀 순위", href: "/statistics/goods/title_ranking" },
      { label: "Metacritic Score", href: "/statistics/goods/metacritic_score" },
    ],
  },
  {
    type: "group",
    label: "주문 분석",
    icon: "uil-shop",
    id: "sidebarOrder",
    children: [
      { label: "일별 주문집계", href: "/statistics/order/order_day_count" },
      { label: "월별 주문집계", href: "/statistics/order/order_month_count" },
      { label: "대표상품별 주문통계", href: "/statistics/order/order_title_count" },
      { label: "옵션상품별 주문통계", href: "/statistics/order/order_goods_count" },
      { label: "공급처 주문통계", href: "/statistics/order/order_publisher_count" },
      { label: "공급처 - 옵션상품 통계", href: "/statistics/order/order_goods_publisher_count" },
      { label: "기간별 주문통계", href: "/statistics/order/sales_goods_day" },
    ],
  },
  {
    type: "group",
    label: "Asset 주문 분석",
    icon: "uil-shop",
    id: "sidebarOrderAsset",
    children: [
      { label: "Asset 일별 주문현황", href: "/statistics/order/order_asset_day_count" },
      { label: "Asset 월별 주문현황", href: "/statistics/order/order_asset_month_count" },
    ],
  },
  {
    type: "group",
    label: "Ztorm 주문 분석",
    icon: "uil-shop",
    id: "sidebarOrderZtorm",
    children: [
      { label: "Ztorm 일별 주문현황", href: "/statistics/order/order_ztorm_day_count" },
      { label: "Ztorm 월별 주문현황", href: "/statistics/order/order_ztorm_month_count" },
    ],
  },
  {
    type: "group",
    label: "Genba 주문 분석",
    icon: "uil-shop",
    id: "sidebarOrderGenba",
    children: [
      { label: "Genba 일별 주문현황", href: "/statistics/order/order_genba_day_count" },
      { label: "Genba 월별 주문현황", href: "/statistics/order/order_genba_month_count" },
      { label: "Genba 퍼블리셔 주문현황", href: "/statistics/order/genba_publisher_count" },
      { label: "Genba 누적 주문현황", href: "/statistics/order/genba_total_count" },
    ],
  },
  {
    type: "group",
    label: "Vaultn 주문 분석",
    icon: "uil-shop",
    id: "sidebarOrderVaultn",
    children: [
      { label: "Vaultn 일별 주문현황", href: "/statistics/order/order_vaultn_day_count" },
      { label: "Vaultn 월별 주문현황", href: "/statistics/order/order_vaultn_month_count" },
      { label: "Vaultn 누적 주문현황", href: "/statistics/order/vaultn_total_count" },
      {
        label: "VaultN 월별 주문현황(리포트 비교용)",
        href: "/statistics/order/order_vaultn_month_count_compare",
      },
    ],
  },
  {
    type: "group",
    label: "홀로 모델 주문 분석",
    icon: "uil-shop",
    id: "sidebarOrderHolomodels",
    children: [
      { label: "홀로 모델 월별 주문현황", href: "/statistics/order/order_holomodels_count" },
    ],
  },
  {
    type: "group",
    label: "결제 분석",
    icon: "uil-shop",
    id: "sidebarSales",
    children: [
      { label: "일별 매출현황", href: "/statistics/sales/sales_day" },
      { label: "월별 매출현황", href: "/statistics/sales/sales_month" },
      { label: "PG별 결제현황", href: "/statistics/sales/sales_pg" },
      { label: "[X] 결제수단별 결제현황", href: "/statistics/sales/sales_settlekind" },
      { label: "[X] 포인트 적립/사용 현황", href: "/statistics/sales/sales_emoney" },
    ],
  },
  {
    type: "group",
    label: "할인 프로모션 분석",
    icon: "uil-shop",
    id: "sidebarPromotion",
    children: [{ label: "할인 프로모션 주문통계", href: "/statistics/promotion/promotion_report" }],
  },
];

// legacy _Admin_/inc/sidebar_partner.php. 대시보드 link 없음. 2개 그룹, 둘 다 markup에서
// `collapse show`(초기 펼침) → site/board/china와 동일 expandAll=true. 그룹 아이콘 uil-shop(기본 크기).
// "파트너 현황" 라벨의 링크는 partner_code.php(=파트너 코드 관리)로 연결 — 라벨/href 그대로 유지.
// 이번 단위는 사이드바 전 항목 노출·라우트는 partner_list만 생성(나머지 순차 이관 시 생성).
export const PARTNER_SIDE_NAV: readonly SideNavEntry[] = [
  {
    type: "group",
    label: "파트너 관리",
    icon: "uil-shop",
    id: "sidebarPartner",
    children: [
      { label: "파트너 현황", href: "/partner/partner_code" },
      { label: "파트너 계정 관리", href: "/partner/partner_list" },
      { label: "파트너 PG수수료 관리", href: "/partner/partner_pg_fee" },
      { label: "파트너 알림 주소록 관리", href: "/partner/partner_email" },
    ],
  },
  {
    type: "group",
    label: "리포트 관리",
    icon: "uil-shop",
    id: "sidebarPartnerReport",
    children: [
      { label: "Sales list 동기화", href: "/partner/sales_list" },
      { label: "Refund list 동기화", href: "/partner/refund_list" },
      { label: "리포트 생성", href: "/partner/report_register" },
      { label: "리포트 내역", href: "/partner/report_list" },
    ],
  },
];

export type SideNavConfig = {
  entries: readonly SideNavEntry[];
  // 그룹 펼침 정책: site=전체 펼침(collapse show), goods=아코디언(active 그룹만 show).
  expandAll: boolean;
};

// legacy: 각 페이지가 $sidebar_file로 사이드바 선택. 타겟은 경로 area로 매핑.
// goods 사이드바는 /goods·/steam·/tag·/code 링크를 포함하므로 그 경로들도 goods 트리.
export const resolveSideNav = (pathname: string): SideNavConfig => {
  // stock은 /goods/stock·/goods/asset 경로에 위치 → goods 체크보다 먼저 분기(전체 펼침).
  const stockAreas = ["/goods/stock", "/goods/asset"];
  if (stockAreas.some((area) => pathname === area || pathname.startsWith(`${area}/`))) {
    return { entries: STOCK_SIDE_NAV, expandAll: true };
  }
  const goodsAreas = ["/goods", "/steam", "/tag", "/code"];
  if (goodsAreas.some((area) => pathname === area || pathname.startsWith(`${area}/`))) {
    return { entries: GOODS_SIDE_NAV, expandAll: false };
  }
  if (pathname === "/board" || pathname.startsWith("/board/")) {
    return { entries: BOARD_SIDE_NAV, expandAll: true };
  }
  if (pathname === "/event" || pathname.startsWith("/event/")) {
    return { entries: EVENT_SIDE_NAV, expandAll: true };
  }
  if (pathname === "/promotion" || pathname.startsWith("/promotion/")) {
    return { entries: PROMOTION_SIDE_NAV, expandAll: true };
  }
  if (pathname === "/member" || pathname.startsWith("/member/")) {
    return { entries: MEMBER_SIDE_NAV, expandAll: true };
  }
  // order는 legacy에서 모든 그룹 초기 접힘 → goods와 동일 아코디언(active 그룹만 펼침).
  if (pathname === "/order" || pathname.startsWith("/order/")) {
    return { entries: ORDER_SIDE_NAV, expandAll: false };
  }
  if (pathname === "/china" || pathname.startsWith("/china/")) {
    return { entries: CHINA_SIDE_NAV, expandAll: true };
  }
  // partner는 legacy에서 두 그룹 모두 collapse show → 전체 펼침(expandAll=true).
  if (pathname === "/partner" || pathname.startsWith("/partner/")) {
    return { entries: PARTNER_SIDE_NAV, expandAll: true };
  }
  // statistics는 legacy에서 모든 그룹 초기 접힘 → order와 동일 아코디언(active 그룹만 펼침).
  if (pathname === "/statistics" || pathname.startsWith("/statistics/")) {
    return { entries: STATISTICS_SIDE_NAV, expandAll: false };
  }
  return { entries: SITE_SIDE_NAV, expandAll: true };
};
