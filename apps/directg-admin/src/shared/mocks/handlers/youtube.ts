import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy youtube_channel_list.php — youtube_channel (videoCount desc).
// customUrl 빈 채널(UC-EMPTY)은 "정보 동기화" 버튼 노출 케이스.
const YOUTUBE_CHANNEL_LIST = [
  {
    channelId: "UCk8GzjMOrta8yxDcKfylJYw",
    channelTitle: "PlayStation",
    customUrl: "@playstation",
    thumbnails: "https://yt3.ggpht.com/ytc/playstation=s88",
    viewCount: 1200345678,
    subscriberCount: 13400000,
    videoCount: 8421,
  },
  {
    channelId: "UCoLtP8pfhCmdbGVWM4mfeww",
    channelTitle: "Xbox",
    customUrl: "@xbox",
    thumbnails: "https://yt3.ggpht.com/ytc/xbox=s88",
    viewCount: 890123456,
    subscriberCount: 6200000,
    videoCount: 5310,
  },
  {
    channelId: "UC-EMPTYCUSTOMURL000000",
    channelTitle: "DirectG 신규 채널",
    customUrl: "",
    thumbnails: "https://yt3.ggpht.com/ytc/directg=s88",
    viewCount: 15230,
    subscriberCount: 412,
    videoCount: 37,
  },
];
const PER_PAGE = 50;

export const youtubeHandlers = [
  // legacy youtube_channel_list.php — Youtube 채널 현황.
  http.get(api("/admin/youtube/channels"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const channelId = url.searchParams.get("search_channelId") || "";
    const channelName = url.searchParams.get("search_channel_name") || "";

    let rows = [...YOUTUBE_CHANNEL_LIST];
    if (channelId) {
      rows = rows.filter((r) => r.channelId === channelId); // 등호
    }
    if (channelName) {
      rows = rows.filter((r) => r.channelTitle.includes(channelName)); // REGEXP 부분일치
    }
    rows.sort((a, b) => b.videoCount - a.videoCount); // videoCount desc

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const start = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy youtube_api.php mode=channel_info — 채널 정보 동기화.
  http.post(api("/admin/youtube/channel-info"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),
];
