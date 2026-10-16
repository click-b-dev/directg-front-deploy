// legacy youtube/* — Youtube Data API 연동(상품 홍보 영상 메타).

// youtube_channel_list.php — getYoutubeChannelList (50/page, videoCount desc)
export type YoutubeChannelSearch = {
  page: number;
  search_channelId?: string;
  search_channel_name?: string;
};
export type YoutubeChannelItem = {
  channelId: string;
  channelTitle: string;
  customUrl: string; // 빈 문자열이면 "정보 동기화" 버튼 노출
  thumbnails: string; // 채널로고 URL
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
};
export type YoutubePagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};
export type YoutubeChannelListResponse = {
  items: YoutubeChannelItem[];
  pagination: YoutubePagination;
};

// youtube_api.php mode=channel_info — 채널 정보 동기화.
export type YoutubeChannelInfoRequest = { channelId: string };
export type YoutubeActionResult = { success: boolean };
