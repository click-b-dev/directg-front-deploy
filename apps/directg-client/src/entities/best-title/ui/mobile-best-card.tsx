import type { BestTitle } from "../model/types";

/** game_type별 badge (legacy 모바일 `#main_best` — GAME/DLC/Music/번들). */
function gameTypeBadge(gameType: string): { text: string; className: string } | null {
  switch (gameType) {
    case "game":
      return { text: "GAME", className: "bg-cinfo" };
    case "dlc":
      return { text: "DLC", className: "bg-ccontent" };
    case "music":
      return { text: "Music", className: "bg-ccontent" };
    case "bundle":
      return { text: "번들", className: "bg-csuccess" };
    default:
      return null;
  }
}

/**
 * 모바일 인기게임 순위 카드 — legacy `mobile/index.php` `#main_best`(L506~566) 마크업 재현.
 * 커버(library_600x900) + 순위 badge + game_type badge. (가격/onerror 없음 — legacy 주석처리·미적용.)
 * PC `BestTitleCard`와 다르다(모바일은 splide 슬라이드·game_type badge, onerror fallback 없음).
 */
export function MobileBestCard({ title, ranking }: { title: BestTitle; ranking: number }) {
  const badge = gameTypeBadge(title.game_type);

  return (
    <li className="splide__slide">
      <div className="card product-card">
        <div className="card-img position-relative rounded-0">
          <a href={`/game/game_view?product_id=${title.sku}`} title={title.title_name}>
            <div className="position-absolute top-0 start-0">
              {/*
                legacy inline `background:#313E4F !important`. Bootstrap `.bg-secondary`가
                background-color를 !important로 지정 → 일반 inline으로는 못 이김.
                --bs-secondary-rgb(#313E4F=rgb(49,62,79)) 오버라이드로 동일 색 재현(클래스 보존).
              */}
              <div
                className="bg-secondary text-dark text-center"
                style={
                  {
                    width: "32px",
                    height: "32px",
                    "--bs-secondary-rgb": "49, 62, 79",
                  } as React.CSSProperties
                }
              >
                <span className="badge rounded-0 fs-5 my-1">{ranking}</span>
              </div>
            </div>
            <img
              src={`${title.domain}/upload/title/${title.title_id}/library/library_600x900.jpg`}
              className="imaged w-100 square"
              alt={title.title_name}
            />
          </a>
          <div className="position-absolute bottom-0 start-0">
            {badge && <span className={`badge ${badge.className} rounded-0`}>{badge.text}</span>}
          </div>
        </div>
      </div>
    </li>
  );
}
