/** 플랫폼 목록 (legacy index.php #platform, 하드코딩). */
const PLATFORMS = [
  {
    name: "다이렉트 게임즈",
    href: "/service/guide",
    title: "다이렉트 게임즈 이용안내",
    img: "/assets/images/common/platform_dg_v2.png",
  },
  {
    name: "스팀",
    href: "/service/guide_steam",
    title: "스팀 게임즈 이용안내",
    img: "/assets/images/common/platform_steam.png",
  },
  {
    name: "에픽 게임즈",
    href: "/service/guide_epic",
    title: "에픽 게임즈 이용안내",
    img: "/assets/images/common/platform_epic.png",
  },
  {
    name: "락스타 게임즈",
    href: "/service/guide_rockstar",
    title: "락스타 게임즈 이용안내",
    img: "/assets/images/common/platform_rockstar.png",
  },
];

/** 플랫폼 이용안내 섹션 (legacy index.php #platform). */
export function PlatformSection() {
  return (
    <section id="platform" className="mb-2">
      <div className="container">
        <h2 className="fw-bold">플랫폼 이용안내</h2>
        <div className="d-grid">
          {PLATFORMS.map((platform) => (
            <div key={platform.name} className="">
              <div className="card rounded-0 card-shadow border-0">
                <div className="card-header font-14 ps-2 bg-card text-secondary border-0">
                  {platform.name}
                </div>
                <div className="card-body p-0">
                  <a href={platform.href} title={platform.title}>
                    <img src={platform.img} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
