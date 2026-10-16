import { useEffect, useRef } from "react";
import {
  useOptionImages,
  useDownloadOptionImage,
  useUploadOptionImage,
} from "@entities/goods-option";
import { OptionSubNav } from "@widgets/option-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type GoodsOptionImageScreenProps = { productCode: string };

// legacy goods/goods_option_image_register.php — 옵션상품 이미지 설정(header 슬롯 단일).
export const GoodsOptionImageScreen = ({ productCode }: GoodsOptionImageScreenProps) => {
  const { data } = useOptionImages(productCode);
  const download = useDownloadOptionImage(productCode);
  const upload = useUploadOptionImage(productCode);
  const productViewer = useProductViewer();
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.title = "이미지 설정";
  }, []);

  if (!data) {
    return null;
  }

  // legacy: display_type이 basic|dlc일 때만 스팀 다운로드 블록 노출.
  const showSteamBlock = data.display_type === "basic" || data.display_type === "dlc";
  const webHeaderSrc = `/upload/product/${data.product_code}/header/header.jpg?t=1`;
  const diskHeaderSrc = `https://image.directg.net/upload/product/${data.product_code}/header/header.jpg?t=20250901`;

  // legacy btn_upload_header — steam_image_download2.php(header_460x215).
  const onDownload = () => {
    download.mutate({
      image_type: "header_460x215",
      image_url: data.steam_url,
      packageid: data.packageid,
      appid: data.steam_appid,
    });
  };
  // legacy btn_header_img_upload — goods_option_ps.php header_upload(multipart).
  const onUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      return;
    }
    upload.mutate({ file_name: file.name });
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
                <li className="breadcrumb-item active">이미지 설정</li>
              </ol>
            </div>
            <h4 className="page-title">
              {data.product_name}({data.product_name_en})
            </h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-2 mb-2 mb-sm-0">
          <OptionSubNav productCode={productCode} active="image" gameType={data.game_type} />
        </div>
        <div className="col-10">
          <div className="row">
            {/* [웹서버] */}
            <div className="col-6">
              <form
                id="frm"
                name="frm"
                method="post"
                className="form-horizontal"
                encType="multipart/form-data"
                onSubmit={(e) => e.preventDefault()}
              >
                <input type="hidden" name="mode" value="image_upload" />
                <div className="card border">
                  <div className="card-header bg-secondary text-white fw-bold font-15">
                    옵션상품 이미지 설정
                  </div>
                  <div className="card-body p-2">
                    <div className="card border">
                      <div className="card-header bg-light fw-bold">
                        웹서버 header 이미지 (460x215)
                      </div>
                      <div className="card-body p-0">
                        {data.web_uploaded ? (
                          <img src={webHeaderSrc} className="img-fluid mx-auto d-block" alt="" />
                        ) : (
                          <div className="d-block py-2 text-center text-danger">
                            header 이미지를 업로드해주세요
                          </div>
                        )}
                      </div>
                      <div className="card-footer text-end">
                        {showSteamBlock && (
                          <div className="mb-2">
                            <span>{data.header_image}</span>{" "}
                            {/* legacy: product_viewer면 스팀 다운로드 버튼 숨김. */}
                            {!productViewer && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm shadow-none"
                                onClick={onDownload}
                              >
                                header 이미지 업로드
                              </button>
                            )}
                          </div>
                        )}
                        <div className="d-flex flex-row">
                          <div className="input-group">
                            <input
                              type="file"
                              name="header_img"
                              className="form-control"
                              ref={fileRef}
                              required
                            />
                            {/* legacy: product_viewer면 저장 버튼 숨김(file input은 유지). */}
                            {!productViewer && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm shadow-none"
                                onClick={onUpload}
                              >
                                header 이미지 저장
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* [디스크엔] */}
            <div className="col-6">
              <div className="card border">
                <div className="card-header bg-secondary text-white fw-bold font-15">
                  디스크엔 (https://www.diskn.com/)
                </div>
                <div className="card-body">
                  {data.disk_exists ? (
                    <img src={diskHeaderSrc} alt="" />
                  ) : (
                    <div className="text-center">
                      <span className="text-danger">디스크엔에 이미지를 업로드해주세요.</span>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  이미지 전체경로: \upload\product\{data.product_code}\header\header.jpg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
