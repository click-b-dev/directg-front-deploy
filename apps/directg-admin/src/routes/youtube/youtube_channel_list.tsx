import { createFileRoute } from "@tanstack/react-router";
import { YoutubeChannelListScreen } from "@screens/youtube-channel-list";
import type { YoutubeChannelSearch } from "@entities/youtube";

// legacy pc/_Admin_/youtube/youtube_channel_list.php → /youtube/youtube_channel_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const YoutubeChannelListRoute = () => {
  const search = Route.useSearch();
  return <YoutubeChannelListScreen {...search} />;
};

export const Route = createFileRoute("/youtube/youtube_channel_list")({
  validateSearch: (search: Record<string, unknown>): YoutubeChannelSearch => ({
    page: Number(search.page) || 1,
    search_channelId: str(search.search_channelId),
    search_channel_name: str(search.search_channel_name),
  }),
  component: YoutubeChannelListRoute,
});
