import { useEffect, useRef, useState } from "react";
import {
  useOptionScreenshots,
  useDeleteOptionScreenshot,
  useSortOptionScreenshot,
  useDownloadOptionScreenshot,
  useUploadOptionScreenshot,
  type OptionScreenshotData,
  type OptionSteamScreenshotCandidate,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionScreenshotScreenProps = { productCode: string };

// legacy goods/goods_option_screenshot_register.php — 옵션상품 스크린샷 설정.
export const GoodsOptionScreenshotScreen = ({ productCode }: GoodsOptionScreenshotScreenProps) => {
  const { data } = useOptionScreenshots(productCode);

  useEffect(() => {
    document.title = "DLC 스크린샷 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <ScreenshotSettings productCode={productCode} data={data} />;
};

const ScreenshotSettings = ({
  productCode,
  data,
}: {
  productCode: string;
  data: OptionScreenshotData;
}) => {
  const productViewer = useProductViewer();
  const deleteShot = useDeleteOptionScreenshot(productCode);
  const sortShot = useSortOptionScreenshot(productCode);
  const downloadShot = useDownloadOptionScreenshot(productCode);
  const uploadShot = useUploadOptionScreenshot(productCode);
  const [previewUrl, setPreviewUrl] = useState(data.screenshots[0]?.url ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const onDelete = (screenshotNum: string) => deleteShot.mutate(screenshotNum);
  const onSort = (idx: number, dir: "up" | "down") => sortShot.mutate({ idx, dir });
  const onDownload = (candidate: OptionSteamScreenshotCandidate) =>
    downloadShot.mutate({
      id: candidate.id,
      path_full: candidate.path_full,
      path_thumbnail: candidate.path_thumbnail,
      num: candidate.id + 1,
    });
  const onUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      return;
    }
    uploadShot.mutate({ file_name: file.name });
  };

  const diskScreenshots = data.screenshots.filter((s) => s.disk_exists);

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
                    옵션상품 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">DLC 스크린샷 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.product.product_name} <small>({data.product.product_name_en})</small>{" "}
              <span className="badge bg-dark">{data.product.game_type}</span>{" "}
              <span className="badge bg-dark">{data.product.platform_name}</span>
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav
            productCode={productCode}
            active="screenshot"
            gameType={data.product.game_type}
          />
        </div>
        <div className="col-7">
          {/* 스크린샷 미리보기 + 썸네일 + 스팀 다운로드 */}
          <div className="card">
            <h5 className="card-header bg-secondary text-white">옵션상품 스크린샷</h5>
            <div className="card-body p-2">
              {previewUrl && (
                <div className="d-block mb-3 text-center">
                  <img
                    src={`${previewUrl}?t=1`}
                    className="img-fluid"
                    style={{ maxWidth: "812px" }}
                    alt="스크린샷"
                    id="screenshot"
                  />
                </div>
              )}
              <div id="screenshot_thumbnail">
                <div className="d-flex flex-row justify-content-start flex-nowrap mb-2">
                  {data.screenshots.map((screenshot, index) => (
                    <div className="text-center me-2" key={screenshot.idx}>
                      <div className="d-flex flex-column">
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          <img
                            src={screenshot.thumbnail}
                            className="img-fluid img-thumbnail p-0 thumbnail_list"
                            style={{ maxWidth: "120px" }}
                            alt="스크린샷 썸네일"
                            onClick={() => setPreviewUrl(screenshot.url)}
                          />
                        </a>
                        {!productViewer && (
                          <button
                            type="button"
                            className="btn btn-sm btn-light shadow-none border mt-1 font-12 btn_screenshot_delete"
                            onClick={() => onDelete(screenshot.screenshot_num)}
                          >
                            스크린샷 {index + 1} 삭제
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-flex flex-wrap">
                {data.steam_candidates.map((candidate) => (
                  <div className="mb-2 px-1" key={candidate.id}>
                    {candidate.downloaded ? (
                      <span className="font-13">스크린샷 {candidate.id + 1} 완료</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm shadow-none btn_screenshot_download font-13"
                        onClick={() => onDownload(candidate)}
                      >
                        스크린샷 {candidate.id + 1} <br />
                        다운로드
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 직접 업로드 */}
          <div className="card">
            <h5 className="card-header bg-secondary text-white">옵션상품 스크린샷 직접업로드</h5>
            <div className="card-body p-2">
              <div className="mb-2">
                <div className="d-flex flex-row">
                  <span className="me-2">스크린샷 크기: 856px * 480px</span>
                </div>
              </div>
              <div className="mb-2">
                <span>스크린샷 썸네일 크기: 112px * 63px</span>
              </div>
              <div className="mb-2">
                <div className="d-flex flex-row">
                  <div className="input-group">
                    <input
                      type="file"
                      name="screenshot_img"
                      id="screenshot_img"
                      className="form-control"
                      ref={fileRef}
                      required
                    />
                    {!productViewer && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm shadow-none"
                        id="btn_upload_screenshot"
                        onClick={onUpload}
                      >
                        스크린샷 업로드
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 디스크엔 업로드 상태 (remoteFileExist 200 항목만) */}
        <div className="col-3">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">디스크엔 업로드 상태</h5>
            <div className="card-body p-2">
              <ul className="list-group">
                {diskScreenshots.map((screenshot) => (
                  <li className="list-group-item" key={screenshot.idx}>
                    <div className="d-flex flex-row align-items-center justify-content-start">
                      <div className="me-2">{screenshot.sort}</div>
                      <div className="me-2">
                        <img
                          src={`https://image.directg.net/${screenshot.thumbnail}`}
                          className="img-fluid img-thumbnail p-0 thumbnail_list border-0"
                          style={{ maxWidth: "120px" }}
                          alt="스크린샷 썸네일"
                        />
                      </div>
                      <div className="d-flex flex-column">
                        {!productViewer && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm p-0 btn_sort_up"
                              onClick={() => onSort(screenshot.idx, "up")}
                            >
                              <i className="mdi mdi-chevron-up-box mdi-24px" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm p-0 btn_sort_down"
                              onClick={() => onSort(screenshot.idx, "down")}
                            >
                              <i className="mdi mdi-chevron-down-box mdi-24px" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
