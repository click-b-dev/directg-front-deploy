import { useEffect, useState } from "react";
import {
  useAddTitleMedia,
  useDeleteTitleMedia,
  useMediaSettings,
  type TitleMediaSettings,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleMediaScreenProps = { titleId: number };

// legacy goods/title_media_register.php — 대표상품 동영상 설정.
export const TitleMediaScreen = ({ titleId }: TitleMediaScreenProps) => {
  const { data } = useMediaSettings(titleId);

  useEffect(() => {
    document.title = "대표상품 동영상 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <MediaSettings data={data} />;
};

// legacy date('Y-m-d H:i:s', unixSeconds)
const pad2 = (n: number) => String(n).padStart(2, "0");
const formatDateTime = (unixSeconds: number) => {
  const d = new Date(unixSeconds * 1000);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const MediaSettings = ({ data }: { data: TitleMediaSettings }) => {
  const addMedia = useAddTitleMedia();
  const deleteMedia = useDeleteTitleMedia();
  const productViewer = useProductViewer();
  const [playerUrl, setPlayerUrl] = useState(data.media[0]?.media_url ?? "");
  const [mediaInput, setMediaInput] = useState("");

  const onAdd = (youtubeMediaId: string) => {
    if (!youtubeMediaId.trim()) {
      return;
    }
    addMedia.mutate(
      { titleId: data.title_id, payload: { youtube_media_id: youtubeMediaId } },
      { onSuccess: () => setMediaInput("") },
    );
  };

  const onDelete = (youtubeMediaId: string) => {
    deleteMedia.mutate({ titleId: data.title_id, youtubeMediaId });
  };

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    상품
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    대표상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">동영상 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.title_name} <small>({data.title_name_en})</small>
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <TitleSubNav titleId={data.title_id} titleCode="33" active="media" />
        </div>
        <div className="col-7">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">대표상품 동영상정보</h5>
            <div className="card-body p-2">
              <div className="ratio ratio-16x9">
                <iframe
                  id="media_player"
                  className="embed-responsive-item"
                  src={playerUrl}
                  frameBorder="0"
                  allowFullScreen
                  title="media_player"
                />
              </div>
              <div className="container">
                <div className="row">
                  {data.media.map((media) => (
                    <div className="col-2" key={media.youtube_media_id}>
                      <div className="d-block mb-2 text-center">
                        <span className="font-12">{media.youtube_media_id}</span>
                      </div>
                      <div
                        className="position-relative"
                        style={{ cursor: "pointer" }}
                        onClick={() => setPlayerUrl(media.media_url)}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${media.youtube_media_id}/mqdefault.jpg`}
                          className="img-fluid img-thumbnail youtube_thumbnail"
                          alt="Product-img"
                        />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <div className="text-danger">
                            <i className="mdi mdi-48px mdi-youtube" />
                          </div>
                        </div>
                      </div>
                      <div className="d-block mt-2 text-center">
                        {!productViewer && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm btn_youtube_delete"
                            onClick={() => onDelete(media.youtube_media_id)}
                          >
                            영상삭제
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="mt-0 p-3 rounded">
                    <form
                      className="needs-validation"
                      name="youtubeFrm"
                      id="youtubeFrm"
                      onSubmit={(event) => {
                        event.preventDefault();
                        onAdd(mediaInput);
                      }}
                    >
                      <div className="row">
                        <div className="col mb-0 mb-sm-0">
                          <div className="input-group">
                            <div className="input-group-text">https://www.youtube.com/embed/</div>
                            <input
                              type="text"
                              className="form-control"
                              name="youtube_media_id"
                              placeholder="유튜브동영상 아이디를 입력해 주세요."
                              value={mediaInput}
                              onChange={(event) => setMediaInput(event.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-sm-auto">
                          <div className="btn-group">
                            <div className="d-grid">
                              {!productViewer && (
                                <button
                                  type="button"
                                  className="btn btn-success shadow-none"
                                  id="btn_youtube_register"
                                  onClick={() => onAdd(mediaInput)}
                                >
                                  영상추가
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer p-2">
              {data.candidates.map((video) => (
                <div className="card mb-3" key={video.videoId}>
                  <div className="d-flex flex-row">
                    <img src={video.thumbnails} className="img-fluid rounded-start" alt="..." />
                    <div className="card-body p-2">
                      <h5 className="card-title font-14">{video.title}</h5>
                      <p className="card-text">
                        <small className="text-body-secondary">{video.videoId}</small>
                        <br />
                        <small className="text-body-secondary">{video.channelTitle}</small>
                        <br />
                        <small className="text-body-secondary">
                          등록일: {formatDateTime(video.publishedAt)} | 조회수:{" "}
                          {video.viewCount.toLocaleString()}
                        </small>
                      </p>
                    </div>
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm shadow-none btn_video_register"
                        onClick={() => onAdd(video.videoId)}
                      >
                        등록
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
