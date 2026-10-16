type SitemapLink = {
  label: string;
  href: string;
};

type SitemapColumn = {
  title?: string;
  titleHref?: string;
  titleClassName?: string;
  links?: SitemapLink[];
};

type SitemapSection = {
  label: string;
  columns: SitemapColumn[];
};

const SECTIONS: SitemapSection[] = [
  {
    label: "Header",
    columns: [
      { title: "로그인" },
      { title: "회원가입" },
      { title: "마이페이지" },
      { title: "장바구니" },
      { title: "위시리스트" },
    ],
  },
  {
    label: "GNB",
    columns: [
      {
        title: "서비스소개",
        titleHref: "/service/service",
        titleClassName: "font-16",
      },
      {
        title: "할인프로모션",
        titleClassName: "font-16",
        links: [
          { label: "- 진행중인 프로모션", href: "/promotion/promotion_ing" },
          { label: "- 타임딜", href: "/promotion/time_deal" },
        ],
      },
      {
        title: "이벤트",
        titleHref: "/event/event",
        titleClassName: "font-16",
      },
      {
        title: "공지사항",
        titleHref: "/board/notice",
        titleClassName: "font-16",
      },
      {
        title: "이용안내",
        links: [
          { label: "- 다이렉트 게임즈", href: "/service/guide" },
          { label: "- 스팀", href: "/service/guide_steam" },
          { label: "- 에픽 게임즈", href: "/service/guide_epic" },
          { label: "- 락스타 게임즈", href: "/service/guide_rockstar" },
        ],
      },
      {
        title: "고객지원",
        links: [
          { label: "- 자주묻는질문", href: "/board/faq" },
          { label: "- 문의하기", href: "/board/qna" },
          { label: "- 자료실", href: "/board/dataroom" },
        ],
      },
    ],
  },
  {
    label: "네비바",
    columns: [
      {
        title: "플랫폼별",
        links: [
          { label: "- 스팀(Steam)", href: "/game/game_list?platform=1" },
          { label: "- 에픽 게임즈 (Epic Games)", href: "/game/game_list?platform=34" },
          { label: "- 락스타 게임즈 (Rockstar Games)", href: "/game/game_list?platform=35" },
        ],
      },
      {
        title: "장르별",
        links: [
          { label: "- 액션", href: "#" },
          { label: "- RPG", href: "#" },
          { label: "- 시뮬레이션", href: "#" },
          { label: "- 전략", href: "#" },
          { label: "- 캐쥬얼", href: "#" },
          { label: "- 퍼즐", href: "#" },
          { label: "- 스포츠", href: "#" },
          { label: "- 레이싱", href: "#" },
          { label: "- 인디", href: "#" },
        ],
      },
      {
        title: "카테고리별",
        links: [
          { label: "- 싱글플레이 지원", href: "/game/game_category?group_code=P0101" },
          { label: "- 멀티플레이 지원", href: "/game/game_category?group_code=P0201" },
          { label: "- 공유/화면분할 지원", href: "/game/game_category?group_code=P0202" },
          { label: "- 컨트롤러 지원", href: "/game/game_category?group_code=P0301" },
          { label: "- VR 지원", href: "/game/game_category?group_code=P0302" },
          { label: "- 편의/접근성 지원", href: "/game/game_category?group_code=P0401" },
          { label: "- 크로스 플레이 지원", href: "/game/game_category?group_code=P0402" },
        ],
      },
      {
        title: "한국어지원",
        links: [
          { label: "- 인터페이스/자막 한국어", href: "/game/game_list?interface_korean=Y" },
          { label: "- 음성 한국어", href: "/game/game_list?spoken_korean=Y" },
          { label: "- 독점 한국어", href: "/game/game_list?exclusive_korean=Y" },
        ],
      },
      {
        title: "예약구매",
        titleHref: "/game/game_preorder",
        titleClassName: "font-16",
      },
    ],
  },
  {
    label: "퍼블리셔 - 전용",
    columns: [
      { links: [{ label: "2k", href: "/game/publisher_2k" }] },
      { links: [{ label: "SEGA", href: "/game/publisher_sega" }] },
      { links: [{ label: "CAPCOM", href: "/game/publisher_capcom" }] },
      { links: [{ label: "Paradox Interactive", href: "/game/publisher_paradox" }] },
      { links: [{ label: "PlayStation PC LLC", href: "/game/publisher_playstation" }] },
      { links: [{ label: "NEOWIZ", href: "/game/publisher_neowiz" }] },
    ],
  },
  {
    label: "회원",
    columns: [
      {
        title: "로그인",
        titleHref: "/member/login",
        titleClassName: "font-16",
      },
      { title: "로그아웃" },
      {
        title: "회원가입",
        links: [
          { label: "- 가입방법 선택", href: "/member/join_step1" },
          { label: "- 약관동의", href: "/member/join_step2" },
          { label: "- 정보입력", href: "/member/join_step3" },
          { label: "- 가입완료", href: "/member/join_step4" },
        ],
      },
      { title: "비밀번호 재설정" },
    ],
  },
  {
    label: "주문",
    columns: [
      { links: [{ label: "장바구니", href: "/order/cart" }] },
      { links: [{ label: "주문하기", href: "/order/order" }] },
      { links: [{ label: "결제하기", href: "/order/settle" }] },
      { links: [{ label: "주문완료 - 입금대기", href: "/order/order_ready" }] },
      { links: [{ label: "주문완료 - 결제완료", href: "/order/order_end" }] },
    ],
  },
  {
    label: "마이페이지",
    columns: [
      { links: [{ label: "대시보드", href: "/mypage/mypage_main" }] },
      {
        title: "회원정보",
        links: [
          { label: "- 정보수정", href: "/mypage/account_update" },
          { label: "- 간편로그인 연결", href: "/mypage/sns_login_connect" },
          { label: "- 회원탈퇴 요청", href: "/mypage/member_leave" },
          { label: "- 회원등급 안내", href: "/mypage/member_level_info" },
        ],
      },
      {
        title: "주문정보",
        links: [
          { label: "- 주문 내역", href: "/mypage/mypage_order" },
          { label: "- 취소 내역", href: "/mypage/mypage_refund" },
          { label: "- 위시리스트 내역", href: "/mypage/mypage_wishlist" },
        ],
      },
      {
        title: "문의정보",
        links: [
          { label: "- 문의 내역", href: "/mypage/mypage_qna" },
          { label: "- 문의 하기", href: "/mypage/mypage_qna_register" },
        ],
      },
      {
        title: "혜택정보",
        links: [
          { label: "- 포인트 내역", href: "/mypage/member_point" },
          { label: "- 쿠폰 내역", href: "/mypage/mypage_coupon" },
          { label: "- 사은품 내역", href: "/mypage/mypage_event_gift" },
        ],
      },
    ],
  },
  {
    label: "Footer",
    columns: [
      { links: [{ label: "개인정보처리방침", href: "/service/private" }] },
      { links: [{ label: "이용약관", href: "/service/agreement" }] },
      { links: [{ label: "청소년보호정책", href: "/service/youthpolicy" }] },
      { links: [{ label: "환불정책", href: "/service/refund_policy" }] },
      { links: [{ label: "사이트맵", href: "/service/sitemap" }] },
    ],
  },
];

function SitemapColumnView({ column }: { column: SitemapColumn }) {
  return (
    <div className="flex-fill p-2">
      {column.title ? (
        <h5 className={column.titleClassName}>
          {column.titleHref ? (
            <a href={column.titleHref} className="nav-link text-white">
              {column.title}
            </a>
          ) : (
            column.title
          )}
        </h5>
      ) : null}
      {column.links ? (
        <ul className="nav flex-column ps-2">
          {column.links.map((link) => (
            <li key={`${link.href}-${link.label}`} className="nav-item mb-2">
              <a href={link.href} className="nav-link p-0 font-14 text-body-secondary">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SitemapSectionView({ section }: { section: SitemapSection }) {
  return (
    <div className="row g-0 mb-2 border">
      <div className="col-2 bg-primary p-2 font-14">{section.label}</div>
      <div className="col-10">
        <div className="d-flex flex-row p-2">
          {section.columns.map((column, index) => (
            <SitemapColumnView key={`${section.label}-${index}`} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 사이트맵 (legacy `pc/service/sitemap.html`).
 * 전 구간 정적 SSR. legacy 주석 블록과 주석 처리된 항목은 미렌더.
 */
export function ServiceSitemapScreen() {
  return (
    <div className="container">
      <main className="mb-5">
        <h3 className="page-title py-3 fw-bold mb-3 border-bottom">사이트맵</h3>
        {SECTIONS.map((section) => (
          <SitemapSectionView key={section.label} section={section} />
        ))}
      </main>
    </div>
  );
}
