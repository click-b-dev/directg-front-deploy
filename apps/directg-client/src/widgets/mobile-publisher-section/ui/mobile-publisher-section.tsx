/**
 * 퍼블리셔 안내 정적 목록 (legacy `mobile/index.php` `#publisher_list`, L785~884).
 * 순서·이름·링크·이미지 고정. `border0`는 legacy card-header `border-0` 유무(Paradox만 누락 quirk, L813).
 */
const PUBLISHERS: { name: string; href: string; img: string; border0: boolean }[] = [
  {
    name: "2K",
    href: "/game/publisher_2k_thumb",
    img: "https://image.directg.net/N84CVZeIW8",
    border0: true,
  },
  {
    name: "SEGA",
    href: "/game/publisher_sega_thumb",
    img: "https://image.directg.net/I84CVZipaf",
    border0: true,
  },
  {
    name: "CAPCOM",
    href: "/game/publisher_capcom_thumb",
    img: "https://image.directg.net/upload/main/publisher_capcom.png",
    border0: true,
  },
  {
    name: "Paradox Interactive",
    href: "/game/publisher_paradox_thumb",
    img: "https://image.directg.net/y84CVZhNXz",
    border0: false,
  },
  {
    name: "PlayStation PC LLC",
    href: "/game/publisher_playstation_thumb",
    img: "https://image.directg.net/T84CVZi7pP",
    border0: true,
  },
  {
    name: "NEOWIZ",
    href: "/game/publisher_neowiz_thumb",
    img: "https://image.directg.net/upload/main/publisher_neowiz.png",
    border0: true,
  },
  {
    name: "Arc System Works",
    href: "/game/publisher_asw_thumb",
    img: "https://image.directg.net/I84CVZeZrr",
    border0: true,
  },
  {
    name: "THQ Nordic",
    href: "/game/publisher_thq_thumb",
    img: "https://image.directg.net/B84CVZiYCO",
    border0: true,
  },
  {
    name: "505 Games",
    href: "/game/publisher_505_games_thumb",
    img: "https://image.directg.net/R84CVZeS5n",
    border0: true,
  },
  {
    name: "Focus Entertainment",
    href: "/game/publisher_focus_thumb",
    img: "https://image.directg.net/C86t87TuRI",
    border0: true,
  },
  {
    name: "Hooded Horse",
    href: "/game/publisher_hooded_horse_thumb",
    img: "https://image.directg.net/E84CVZfcs2",
    border0: true,
  },
  {
    name: "Clouded Leopard Entertainment",
    href: "/game/publisher_clouded_leopard_thumb",
    img: "https://image.directg.net/P84CVZf632",
    border0: true,
  },
];

/**
 * 모바일 퍼블리셔 안내 섹션 (legacy `mobile/index.php` `#publisher_list`, L781~885).
 * 정적 12개, col-6 2열 그리드(splide5는 legacy 주석처리 → 캐러셀 아님).
 */
export function MobilePublisherSection() {
  return (
    <div className="section">
      <div className="section-title py-2 px-0">
        <h2 className="mb-0">퍼블리셔 안내</h2>
      </div>
      <div className="col" id="publisher_list">
        <ul className="list-unstyled d-flex flex-wrap">
          {PUBLISHERS.map((publisher) => (
            <li className="col-6 p-0" key={publisher.href}>
              <div className="card rounded-top card-shadow">
                <div className={`card-header${publisher.border0 ? " border-0" : ""} text-truncate`}>
                  <span className="mb-0">{publisher.name}</span>
                </div>
                <a href={publisher.href} className="" title={publisher.name}>
                  <img src={publisher.img} className="w-100" alt={publisher.name} />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
