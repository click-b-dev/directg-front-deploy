/** 퍼블리셔 목록 (legacy index.php #goods_publisher, 하드코딩). */
const PUBLISHERS = [
  {
    name: "2K",
    href: "/game/publisher_2k_thumb",
    img: "https://image.directg.net/N84CVZeIW8",
  },
  {
    name: "SEGA",
    href: "/game/publisher_sega_thumb",
    img: "https://image.directg.net/I84CVZipaf",
  },
  {
    name: "CAPCOM",
    href: "/game/publisher_capcom_thumb",
    img: "https://image.directg.net/upload/main/publisher_capcom.png",
  },
  {
    name: "Paradox Interactive",
    href: "/game/publisher_paradox_thumb",
    img: "https://image.directg.net/y84CVZhNXz",
  },
  {
    name: "PlayStation PC LLC",
    href: "/game/publisher_playstation_thumb",
    img: "https://image.directg.net/T84CVZi7pP",
  },
  {
    name: "NEOWIZ",
    href: "/game/publisher_neowiz_thumb",
    img: "https://image.directg.net/upload/main/publisher_neowiz.png",
  },
  {
    name: "Arc System Works",
    href: "/game/publisher_asw_thumb",
    img: "https://image.directg.net/I84CVZeZrr",
  },
  {
    name: "THQ Nordic",
    href: "/game/publisher_thq_thumb",
    img: "https://image.directg.net/B84CVZiYCO",
  },
  {
    name: "505 Games",
    href: "/game/publisher_505_games_thumb",
    img: "https://image.directg.net/R84CVZeS5n",
  },
  {
    name: "Focus Entertainment",
    href: "/game/publisher_focus_thumb",
    img: "https://image.directg.net/C86t87TuRI",
  },
  {
    name: "Hooded Horse",
    href: "/game/publisher_hooded_horse_thumb",
    img: "https://image.directg.net/E84CVZfcs2",
  },
  {
    name: "Clouded Leopard Entertainment",
    href: "/game/publisher_clouded_leopard_thumb",
    img: "https://image.directg.net/P84CVZf632",
  },
];

/** 퍼블리셔 안내 섹션 (legacy index.php #goods_publisher). */
export function PublisherSection() {
  return (
    <section id="goods_publisher" className="mb-2">
      <div className="container">
        <h2 className="fw-bold">퍼블리셔 안내</h2>
        <div className="d-grid" id="publisher_area">
          {PUBLISHERS.map((publisher) => (
            <div key={publisher.name} className="card rounded-0 card-shadow border-0">
              <div className="card-header font-14 ps-2 border-0">{publisher.name}</div>
              <div className="card-body p-0">
                <a href={publisher.href} className="stretched-link" title={publisher.name}>
                  <img src={publisher.img} className="w-100" />
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
