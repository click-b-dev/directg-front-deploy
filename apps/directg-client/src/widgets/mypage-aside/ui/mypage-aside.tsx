import { Fragment } from "react";

/** aside_mypage active 키 (legacy `$aside_menu[key]`). */
export type MypageAsideKey =
  | "profile"
  | "sns_login"
  | "member_level_info"
  | "order_wating"
  | "order2"
  | "cancel_request"
  | "cancel_end"
  | "wishlist"
  | "qna"
  | "qna_ragister"
  | "supply_content"
  | "point"
  | "coupon"
  | "gift";

interface AsideItem {
  label: string;
  href: string;
  key: MypageAsideKey;
}

/** legacy `pc/inc/aside_mypage.html` 그룹. 문의정보·혜택정보 id="mypageBenefits" 중복은 legacy 버그 그대로. */
const MYPAGE_ASIDE_GROUPS: { id: string; title: string; items: AsideItem[] }[] = [
  {
    id: "mypageMember",
    title: "회원정보",
    items: [
      { label: "- 계정 설정", href: "/mypage/account_settings", key: "profile" },
      { label: "- 간편로그인 연결", href: "/mypage/sns_login_connect", key: "sns_login" },
      {
        label: "- 회원등급 안내",
        href: "/mypage/member_level_info",
        key: "member_level_info",
      },
    ],
  },
  {
    id: "mypageOrder",
    title: "주문정보",
    items: [
      { label: "- 입금대기 내역", href: "/mypage/mypage_order_wating", key: "order_wating" },
      { label: "- 주문완료 내역", href: "/mypage/mypage_order", key: "order2" },
      {
        label: "- 취소요청 내역",
        href: "/mypage/mypage_cancel_request",
        key: "cancel_request",
      },
      { label: "- 취소완료 내역", href: "/mypage/mypage_cancel_end", key: "cancel_end" },
      { label: "- 위시리스트 내역", href: "/mypage/mypage_wishlist", key: "wishlist" },
    ],
  },
  {
    id: "mypageBenefits",
    title: "문의정보",
    items: [
      { label: "- 문의 내역", href: "/mypage/mypage_qna", key: "qna" },
      { label: "- 문의 하기", href: "/mypage/mypage_qna_register", key: "qna_ragister" },
    ],
  },
  {
    id: "mypageBenefits",
    title: "혜택정보",
    items: [
      {
        label: "- 제공콘텐츠",
        href: "/mypage/mypage_supply_content_v2",
        key: "supply_content",
      },
      { label: "- 포인트 내역", href: "/mypage/mypage_point", key: "point" },
      { label: "- 쿠폰 내역", href: "/mypage/mypage_coupon", key: "coupon" },
      { label: "- 사은품 내역", href: "/mypage/mypage_gift", key: "gift" },
    ],
  },
];

/**
 * 마이페이지 공통 좌측 aside (legacy `pc/inc/aside_mypage.html`).
 * 4그룹(회원정보/주문정보/문의정보/혜택정보)을 `<hr>`로 구분. 각 페이지가 active 항목 지정.
 */
export function MypageAside({ active }: { active?: MypageAsideKey }) {
  return (
    <div id="sidebar" className="bg-dark-subtle rounded-0 border mb-0">
      <div className="d-flex flex-column flex-shrink-0">
        <div className="bg-primary fw-bold fs-3 py-3 text-center border-bottom">마이페이지</div>
        {MYPAGE_ASIDE_GROUPS.map((group, index) => (
          <Fragment key={group.title}>
            {index > 0 && <hr className="my-0" />}
            <div className="p-3" id={group.id}>
              <div className="mb-2">
                <strong className="font-16">{group.title}</strong>
              </div>
              <div className="list-group list-group-flush">
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={
                      "list-group-item bg-dark-subtle border-0 font-14" +
                      (item.key === active ? " text-primary fw-bold" : "")
                    }
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
