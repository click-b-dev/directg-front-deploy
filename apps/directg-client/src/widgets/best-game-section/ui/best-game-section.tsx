import { BestTitleCard, type BestTitle } from "@entities/best-title";

/** 인기게임 섹션 (legacy index.php #best_game). 순위는 1부터. */
export function BestGameSection({ titles }: { titles: BestTitle[] }) {
  return (
    <section id="best_game" className="mb-2">
      <div className="container">
        <h2 className="fw-bold">인기게임</h2>
        <div className="d-grid">
          {titles.map((title, index) => (
            <BestTitleCard key={title.title_id} title={title} ranking={index + 1} />
          ))}
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
