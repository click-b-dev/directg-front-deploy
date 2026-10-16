"use client";

import type { GenreBestTitle } from "@entities/game-genre";
import { useSplide } from "@shared/lib/use-splide";

/** legacy game_genre 캐러셀 Splide 옵션(verbatim). arrowPath는 커스텀 SVG. */
const SPLIDE_OPTIONS = {
  type: "loop",
  focus: "center",
  arrows: true,
  arrowPath:
    "M33.1875 26.1313L15.7719 42.725C15.4813 43.002 15.0952 43.1566 14.6937 43.1566C14.2923 43.1566 13.9062 43.002 13.6156 42.725L13.5969 42.7063C13.4555 42.572 13.3429 42.4103 13.266 42.2312C13.1891 42.052 13.1494 41.859 13.1494 41.6641C13.1494 41.4691 13.1891 41.2762 13.266 41.097C13.3429 40.9178 13.4555 40.7562 13.5969 40.6219L29.9969 24.9969L13.5969 9.37813C13.4555 9.24384 13.3429 9.0822 13.266 8.90303C13.1891 8.72387 13.1494 8.53092 13.1494 8.33595C13.1494 8.14096 13.1891 7.94802 13.266 7.76886C13.3429 7.58969 13.4555 7.42805 13.5969 7.29376L13.6156 7.27501C13.9062 6.99799 14.2923 6.84346 14.6937 6.84346C15.0952 6.84346 15.4813 6.99799 15.7719 7.27501L33.1875 23.8688C33.3407 24.0147 33.4626 24.1902 33.5459 24.3847C33.6292 24.5791 33.6722 24.7885 33.6722 25C33.6722 25.2116 33.6292 25.4209 33.5459 25.6154C33.4626 25.8098 33.3407 25.9853 33.1875 26.1313Z",
  pagination: false,
  autoplay: true,
  interval: 4000,
};

/** legacy `date("Y년 m월 d일")` — 2자리 zero-pad. */
function formatReleaseDate(releaseDate: string): string {
  const d = new Date(releaseDate);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}년 ${mm}월 ${dd}일`;
}

/**
 * 장르 베스트 캐러셀 (legacy `game_genre_*.html` `#game_page > #splide`, Splide 4.1.4).
 * getGenreBestTitle 상위 5 타이틀. 장르 badge→game_genre_thumb, 카테고리 badge→game_category_thumb.
 */
export function GenreBestCarousel({ titles }: { titles: GenreBestTitle[] }) {
  const ref = useSplide<HTMLElement>(SPLIDE_OPTIONS);

  return (
    <section className="splide" id="splide" ref={ref}>
      <div className="splide__track">
        <ul className="splide__list">
          {titles.map((title) => (
            <li className="splide__slide" key={title.titleId}>
              <div className="splide__slide__container">
                <div className="card mb-3">
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img
                        src={`${title.domain}/upload/title/${title.titleId}/header/${title.titleId}.jpg`}
                        className="img-fluid rounded-start"
                        alt="..."
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body p-0">
                        <h4 className="card-title mx-4 py-3 ps-1 border-bottom">
                          {title.titleName}
                        </h4>
                      </div>
                      <ul className="list-group list-group-flush bg-transparent px-4">
                        <li className="list-group-item bg-transparent py-2">
                          <small className="pe-1 text-secondary-emphasis font-14">장르: </small>{" "}
                          {title.genres.map((g) => (
                            <a
                              key={g.code}
                              href={`/game/game_genre_thumb?genre_code=${g.code}`}
                              title={g.name}
                            >
                              <span className="badge font-12 mb-1 me-2 fw-normal">{g.name}</span>
                            </a>
                          ))}
                        </li>
                        <li className="list-group-item bg-transparent py-2">
                          <small className="pe-1 text-secondary-emphasis font-14">카테고리:</small>{" "}
                          {title.categories.map((c) => (
                            <a
                              key={c.code}
                              href={`/game/game_category_thumb?category_code=${c.code}`}
                              title={c.name}
                            >
                              <span className="badge font-12 mb-1 me-2 fw-normal">{c.name}</span>
                            </a>
                          ))}
                        </li>
                        <li className="list-group-item bg-transparent pb-0">
                          <small className="pe-1 text-secondary-emphasis font-14">출시일:</small>{" "}
                          {formatReleaseDate(title.releaseDate)}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
