import { Fragment, type ReactNode } from "react";

/** breadcrumb 세그먼트. 링크형이면 `href` 지정, 텍스트형이면 생략. */
export interface BreadcrumbItem {
  /** 라벨(legacy sub_title/page_title/sub_title2 조합값). */
  label: ReactNode;
  /** 링크 세그먼트의 href(legacy `text-decoration-none` 앵커). */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * 게임 도메인 공통 breadcrumb (legacy `pc/inc/header.html` L274–284).
 * 고정 루트 `다이렉트 게임즈`(링크 `/`) + 페이지별 세그먼트를 ` > `로 조인.
 * legacy는 `$aside['product_type']`가 game/group/accessories일 때만 렌더 →
 * 타겟은 해당 화면이 이 컴포넌트를 배치하는 것으로 재현(미해당 화면엔 미배치).
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="container mt-3 breadcrumb">
      <div className="font-14">
        <a href="/" className="text-decoration-none">
          다이렉트 게임즈
        </a>
        {items.map((item, index) => (
          <Fragment key={index}>
            {" > "}
            {item.href ? (
              <a href={item.href} className="text-decoration-none">
                {item.label}
              </a>
            ) : (
              item.label
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
