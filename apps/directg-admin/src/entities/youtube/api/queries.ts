import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchYoutubeChannelList, syncYoutubeChannelInfo } from "./fetcher";
import type { YoutubeChannelSearch, YoutubeChannelInfoRequest } from "../model/types";

const YOUTUBE_KEY = ["admin", "youtube"] as const;

export const youtubeChannelListQueryKey = (query: YoutubeChannelSearch) =>
  [...YOUTUBE_KEY, "channels", query] as const;

// legacy youtube_channel_list.php — Youtube 채널 현황.
export const useYoutubeChannelList = (query: YoutubeChannelSearch) =>
  useQuery({
    queryKey: youtubeChannelListQueryKey(query),
    queryFn: () => fetchYoutubeChannelList(query),
  });

// legacy youtube_api.php channel_info → location.reload() = Youtube invalidate.
export const useSyncYoutubeChannelInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: YoutubeChannelInfoRequest) => syncYoutubeChannelInfo(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: YOUTUBE_KEY }),
  });
};
