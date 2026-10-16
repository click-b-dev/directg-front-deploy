import { apiClient } from "@shared/api/client";
import type {
  YoutubeChannelSearch,
  YoutubeChannelListResponse,
  YoutubeChannelInfoRequest,
  YoutubeActionResult,
} from "../model/types";

// legacy youtube_channel_list.php — Youtube 채널 현황(50/page, videoCount desc).
export const fetchYoutubeChannelList = (query: YoutubeChannelSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.page) {
    searchParams.page = String(query.page);
  }
  if (query.search_channelId) {
    searchParams.search_channelId = query.search_channelId;
  }
  if (query.search_channel_name) {
    searchParams.search_channel_name = query.search_channel_name;
  }
  return apiClient.get<YoutubeChannelListResponse>("/admin/youtube/channels", { searchParams });
};

// legacy youtube_api.php mode=channel_info — 채널 정보 동기화.
export const syncYoutubeChannelInfo = (payload: YoutubeChannelInfoRequest) =>
  apiClient.post<YoutubeActionResult>("/admin/youtube/channel-info", payload);
