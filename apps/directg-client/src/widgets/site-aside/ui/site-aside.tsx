/**
 * 공통 서브페이지 좌측 aside (legacy `pc/inc/aside_service.html`·`aside_customer.html` 셸).
 * `#sidebar` + 제목 + list-group 단순형을 재현한다. 각 페이지가 active 항목을 지정한다.
 * (mypage의 그룹 구분(`<hr>`+섹션 제목) 변형은 후속 단위에서 확장.)
 */
export interface AsideMenuItem {
  /** 표시 라벨 (legacy는 "- 다이렉트 게임즈"처럼 하이픈 프리픽스 포함) */
  label: string;
  href: string;
  /** 현재 페이지 강조 (legacy `$aside_menu[key] = "text-primary fw-bold"`) */
  active?: boolean;
  /** 외부 링크 — legacy는 `target="_blank"` */
  external?: boolean;
}

interface SiteAsideProps {
  title: string;
  items: AsideMenuItem[];
}

export function SiteAside({ title, items }: SiteAsideProps) {
  return (
    <div id="sidebar" className="rounded-0 bg-dark-subtle border mb-0">
      <div className="d-flex flex-column flex-shrink-0">
        <div className="bg-primary fw-bold fs-3 py-3 text-center border-bottom">{title}</div>
        <div className="p-3 bg-dark-subtle">
          <div className="list-group list-group-flush bg-dark-subtle">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={
                  "list-group-item bg-dark-subtle border-0 font-16" +
                  (item.active ? " text-primary fw-bold" : "")
                }
                {...(item.external ? { target: "_blank" } : {})}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
