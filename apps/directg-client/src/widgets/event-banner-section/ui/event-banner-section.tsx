/** 이벤트 배너 노출 구간 (legacy 하드코딩: 2025-08-27 16:00 ~ 2025-09-01 00:00). */
const isEventOpen = (now: Date) =>
  now >= new Date("2025-08-27T16:00:00") && now < new Date("2025-09-01T00:00:00");

/** 이벤트 배너 섹션 (legacy index.php #event_banner2). 날짜조건일 때만 렌더(현재 만료). */
export function EventBannerSection() {
  if (!isEventOpen(new Date())) return null;

  return (
    <section id="event_banner2" className="mb-0">
      <div className="container">
        <div id="event_banner_carousel" className="carousel slide">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <h2 className="font-24 text-white">다이렉트 게임즈 X 네이버페이 즉시할인 이벤트</h2>
              <a href="/board/notice_view?idx=30">
                <img
                  src="https://image.directg.net/X82k22XCkH"
                  className="d-block"
                  alt="다이렉트 게임즈 X 네이버페이 즉시할인 이벤트"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="b-example-divider"></div>
      </div>
    </section>
  );
}
