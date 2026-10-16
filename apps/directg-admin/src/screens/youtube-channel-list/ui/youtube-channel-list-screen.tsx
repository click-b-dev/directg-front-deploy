import {
  useYoutubeChannelList,
  useSyncYoutubeChannelInfo,
  type YoutubeChannelSearch,
  type YoutubeChannelItem,
} from "@entities/youtube";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/youtube/youtube_channel_list";
const PER_PAGE = 50;

// legacy youtube_channel_list.php — Youtube 채널 현황.
export const YoutubeChannelListScreen = (search: YoutubeChannelSearch) => {
  const { data } = useYoutubeChannelList(search);

  if (!data) {
    return null;
  }

  const { total_results, current_page, total_pages } = data.pagination;

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Youtube 동영상 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Youtube 채널 현황</li>
              </ol>
            </div>
            <h4 className="page-title">Youtube 채널 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">Youtube 채널 검색</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row">
                <div className="col-3 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_channelId"
                      className="col-sm-3 col-form-labe col-form-label-sm bg-light border"
                    >
                      channelId
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_channelId"
                        name="search_channelId"
                        placeholder="channelId"
                        defaultValue={search.search_channelId}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-5 mb-2">
                  <div className="row">
                    <label
                      htmlFor="search_channel_name"
                      className="col-sm-3 col-form-labe col-form-label-sm bg-light border"
                    >
                      채널명
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="search_channel_name"
                        name="search_channel_name"
                        placeholder="채널명"
                        defaultValue={search.search_channel_name}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      Youtube 채널 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-12">
          <div className="float-start">{total_results.toLocaleString()} 개</div>
          <div className="float-end"></div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">Youtube 채널 리스트</h5>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered w-100 nowrap table-sm table-bordered" id="">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">번호</th>
                      <th className="text-center">채널로고</th>
                      <th className="text-center">channelId</th>
                      <th className="text-center">채널명</th>
                      <th className="text-center">채널주소</th>
                      <th className="text-center">동영상 뷰수</th>
                      <th className="text-center">구독자수</th>
                      <th className="text-center">동영상수</th>
                      <th className="text-center">비고</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {data.items.map((item, index) => (
                      <YoutubeChannelRow
                        key={item.channelId}
                        item={item}
                        num={index + 1 + (current_page - 1) * PER_PAGE}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-center mt-3">
                <ServerPagination
                  page={current_page}
                  totalPages={total_pages}
                  baseUrl={BASE_URL}
                  params={{
                    search_channelId: search.search_channelId,
                    search_channel_name: search.search_channel_name,
                  }}
                />
              </div>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

// legacy: customUrl 빈 행에만 "정보 동기화" 버튼 → youtube_api.php channel_info → location.reload().
const YoutubeChannelRow = ({ item, num }: { item: YoutubeChannelItem; num: number }) => {
  const syncInfo = useSyncYoutubeChannelInfo();

  return (
    <tr>
      <td className="text-center">{num}</td>
      <td className="text-center">
        <img src={item.thumbnails} alt="" />
      </td>
      <td className="text-center">{item.channelId}</td>
      <td>{item.channelTitle}</td>
      <td>
        <a href={`https://www.youtube.com/${item.customUrl}`} target="_blank" rel="noreferrer">
          {item.customUrl}
        </a>
      </td>
      <td className="text-end">{item.viewCount.toLocaleString()}</td>
      <td className="text-end">{item.subscriberCount.toLocaleString()}</td>
      <td className="text-end">{item.videoCount.toLocaleString()}</td>
      <td className="text-center table-action">
        {item.customUrl === "" && (
          <button
            type="button"
            className="btn btn-sm btn-secondary shadow-none btn_channel_info"
            data-channelid={item.channelId}
            onClick={() => syncInfo.mutate({ channelId: item.channelId })}
          >
            정보 동기화
          </button>
        )}
      </td>
    </tr>
  );
};
