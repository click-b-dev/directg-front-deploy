import type { MypageDashboard } from "@entities/mypage-dashboard";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

interface MobileMypageMainScreenProps {
  /** 세션 회원 이름(legacy `$_SESSION['member']['name']`). */
  memberName: string;
  dashboard: MypageDashboard;
}

/** 회원정보/주문정보/고객센터/혜택정보 링크 그룹 — legacy listview. */
const LINK_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "회원정보",
    links: [
      { label: "계정 설정", href: "/mypage/account_settings" },
      { label: "간편로그인 연결", href: "/mypage/sns_login_connect" },
      { label: "회원등급 안내", href: "/mypage/member_level_info" },
    ],
  },
  {
    title: "주문정보",
    links: [
      { label: "입금대기 내역", href: "/mypage/mypage_order_wating" },
      { label: "주문완료 내역", href: "/mypage/mypage_order" },
      { label: "취소요청 내역", href: "/mypage/mypage_cancel_request" },
      { label: "취소완료 내역", href: "/mypage/mypage_cancel_end" },
      { label: "위시리스트 내역", href: "/mypage/mypage_wishlist" },
    ],
  },
  {
    title: "고객센터",
    links: [
      { label: "문의 내역", href: "/mypage/mypage_qna" },
      { label: "문의 하기", href: "/mypage/mypage_qna_register" },
    ],
  },
  {
    title: "혜택정보",
    links: [
      { label: "제공컨텐츠", href: "/mypage/mypage_supply_content" },
      { label: "포인트 내역", href: "/mypage/mypage_point" },
      { label: "쿠폰 내역", href: "/mypage/mypage_coupon" },
      { label: "사은품 내역", href: "/mypage/mypage_gift" },
    ],
  },
];

/**
 * 모바일 마이페이지 대시보드 (legacy `mobile/mypage/mypage_main.html`).
 * MobileSubHeader + profile-head(이름) + profile-stats(집계 5) + listview 4그룹. 세션 가드는 라우트에서.
 * 집계는 PC `getMypageDashboard` 재사용(order_list 등은 모바일 미사용).
 */
export function MobileMypageMainScreen({ memberName, dashboard }: MobileMypageMainScreenProps) {
  const { member_emoney, order_info, cancel_info } = dashboard;
  return (
    <>
      <MobileSubHeader pageTitle="마이페이지" />
      <div id="appCapsuleSub">
        <div className="section pt-2">
          <div className="profile-head">
            <div className="in">
              <h3 className="name">
                {memberName} <small>님 환영합니다.</small>
              </h3>
            </div>
          </div>
        </div>

        <div className="section full mt-2">
          <div className="profile-stats ps-2 pe-2">
            <a href="#" className="item">
              <strong>{member_emoney.toLocaleString()}</strong>보유 포인트
            </a>
            <a href="#" className="item">
              <strong>{order_info.cc.toLocaleString()}</strong>총 주문건수
            </a>
            <a href="#" className="item">
              <strong>{order_info.ss.toLocaleString()}</strong>총 주문금액
            </a>
            <a href="#" className="item">
              <strong>{cancel_info.cc.toLocaleString()}</strong>총 취소건수
            </a>
            <a href="#" className="item">
              <strong>{cancel_info.ss.toLocaleString()}</strong>총 취소금액
            </a>
          </div>
        </div>

        <div className="section full mb-2">
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="listview-title mt-2">{group.title}</div>
              <ul className="listview link-listview mb-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="item">
                      <div className="in">
                        <div className="">{link.label}</div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
