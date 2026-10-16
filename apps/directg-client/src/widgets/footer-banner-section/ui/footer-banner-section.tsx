/** footer_banner 노출 구간 (legacy 하드코딩: 2026-06-12 00:00 ~ 2026-07-12 23:00). */
const isFooterBannerOpen = (now: Date) =>
  now >= new Date("2026-06-12T00:00:00") && now < new Date("2026-07-12T23:00:00");

/** 기획 고정배너2 (legacy inc/footer_banner.html #event_banner). 날짜조건일 때만(현재 만료). */
export function FooterBannerSection() {
  if (!isFooterBannerOpen(new Date())) return null;

  return (
    <section id="event_banner" className="mt-4">
      <a href="/board/notice_view?idx=374">
        <img
          src="https://image.directg.net/n89JgzGXIY"
          className="d-block"
          alt="네이버페이 결제이벤트 최대 3,000원 혜택,기간 :2026-06-12 ~ 2026-07-12"
        />
      </a>
    </section>
  );
}
