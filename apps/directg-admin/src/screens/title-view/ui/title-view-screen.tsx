import { useEffect, useState } from "react";
import {
  useDeleteTitleMedia,
  useTitleView,
  type GoodsTag,
  type GoodsTitleView,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleViewScreenProps = { titleId: number };

// legacy goods/title_view.php — 대표상품 상세보기(read-only).
export const TitleViewScreen = ({ titleId }: TitleViewScreenProps) => {
  const { data } = useTitleView(titleId);

  useEffect(() => {
    document.title = "대표상품 상세보기";
  }, []);

  if (!data) {
    return null;
  }
  return <TitleViewBody data={data} />;
};

// legacy: 태그 code 접두문자로 badge 색상 결정.
const tagStyle = (code: string): string => {
  switch (code.charAt(0)) {
    case "G":
      return "bg-primary text-light";
    case "M":
      return "bg-success text-light";
    case "T":
      return "bg-info text-light";
    case "V":
      return "bg-warning text-light";
    case "A":
      return "bg-secondary text-light";
    case "F":
      return "bg-dark text-light";
    default:
      return "bg-secondary text-light";
  }
};

const TitleViewBody = ({ data }: { data: GoodsTitleView }) => {
  const deleteMedia = useDeleteTitleMedia();
  const productViewer = useProductViewer();
  const [playerUrl, setPlayerUrl] = useState(data.media[0]?.media_url ?? "");
  const isDigital = data.title_code === "33";
  // ⚠️ legacy 버그: 심의정보 카드는 title_code가 아닌 title_id를 "33"과 비교 → 사실상 항상 숨김. 그대로 재현.
  const showGrac = String(data.title_id) === "33";

  const onDeleteMedia = (youtubeMediaId: string) => {
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
                <li className="breadcrumb-item active">대표상품 상세보기</li>
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
          <TitleSubNav titleId={data.title_id} titleCode={data.title_code} active="view" />
        </div>
        <div className="col-10">
          <div className="row">
            {/* 좌측 col-8 */}
            <div className="col-8">
              {/* 기본정보 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">대표상품 기본정보</h5>
                <div className="card-body p-2">
                  <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                    <colgroup>
                      <col width="20%" />
                      <col width="*" />
                    </colgroup>
                    <tbody className="font-13">
                      <tr>
                        <th className="bg-light">대표상품코드</th>
                        <td>{data.title_id}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">대표상품SKU</th>
                        <td>{data.sku}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">대표상품명(국문)</th>
                        <td>{data.title_name}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">대표상품명(영문)</th>
                        <td>{data.title_name_en}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">퍼블리셔</th>
                        <td>{data.publisher}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">개발사</th>
                        <td>{data.developer}</td>
                      </tr>
                      {isDigital && (
                        <tr>
                          <th className="bg-light">한국어지원</th>
                          <td>
                            {data.interface_korean === "Y" && (
                              <span className="badge bg-secondary text-light font-12 fw-normal">
                                인터페이스/자막
                              </span>
                            )}{" "}
                            {data.spoken_korean === "Y" && (
                              <span className="badge bg-secondary text-light font-12 fw-normal">
                                음성
                              </span>
                            )}{" "}
                            {data.exclusive_korean === "Y" && (
                              <span className="badge bg-info text-light font-12 fw-normal">
                                독점 한국어
                              </span>
                            )}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th className="bg-light">게임 상세페이지 노출</th>
                        <td>{data.is_view}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">옵션상품 판매상태</th>
                        <td>{data.sales_status}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">출시여부</th>
                        <td>{data.coming_soon}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">출시일</th>
                        <td>{data.release_date}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">출시예정일</th>
                        <td>{data.coming_soon_date}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">제 3자 DRM</th>
                        <td>{data.drm_notice}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">타사계정</th>
                        <td>{data.ext_user_account_notice}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <div className="float-end">
                    <a
                      href={`/goods/title_modify?title_id=${data.title_id}`}
                      className="btn btn-sm btn-secondary shadow-none"
                    >
                      기본정보 설정
                    </a>
                  </div>
                </div>
              </div>

              {/* 동영상정보 */}
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
                              src={`https://img.youtube.com/vi/${media.youtube_media_id}/${media.media_thumb}`}
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
                            {/* legacy: product_viewer면 영상삭제 숨김. */}
                            {!productViewer && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm btn_youtube_delete"
                                onClick={() => onDeleteMedia(media.youtube_media_id)}
                              >
                                영상삭제
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="float-end">
                    <a
                      href={`/goods/title_media_register?title_id=${data.title_id}`}
                      className="btn btn-sm btn-secondary shadow-none"
                    >
                      동영상 설정
                    </a>
                  </div>
                </div>
              </div>

              {/* 스크린샷정보 (legacy: 본문 비어있음) */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">대표상품 스크린샷정보</h5>
                <div className="card-body p-2" />
                <div className="card-footer">
                  <div className="float-end">
                    <a
                      href={`/goods/title_screenshot_register?title_id=${data.title_id}`}
                      className="btn btn-sm btn-secondary shadow-none"
                    >
                      스크린샷 설정
                    </a>
                  </div>
                </div>
              </div>

              {/* 상세설명 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">대표상품 상세설명</h5>
                <div className="card-body p-2">
                  <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                    <colgroup>
                      <col width="15%" />
                      <col width="*" />
                    </colgroup>
                    <tbody className="font-14">
                      <tr>
                        <th className="bg-light">게임정보</th>
                        <td>
                          <div
                            className="description"
                            dangerouslySetInnerHTML={{ __html: data.game_html }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">시스템 요구사항</th>
                        <td>
                          <div
                            className="description"
                            dangerouslySetInnerHTML={{ __html: data.requirements_html }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">권리표기</th>
                        <td dangerouslySetInnerHTML={{ __html: data.legal_text_html }} />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <div className="float-end">
                    <a
                      href={`/goods/title_description_register?title_id=${data.title_id}`}
                      className="btn btn-secondary shadow-none"
                    >
                      상세설명 설정
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 col-4 */}
            <div className="col-4">
              {/* 이미지정보 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">대표상품 이미지정보</h5>
                <div className="card-body p-2">
                  <img
                    src={`/upload/title/${data.title_id}/header/${data.title_id}.jpg`}
                    className="img-fluid mx-auto d-block"
                    alt=""
                  />
                </div>
                <div className="card-footer">{data.short_description}</div>
              </div>

              {/* 심의정보 (legacy 버그: title_id=="33" 게이트 → 사실상 항상 숨김) */}
              {showGrac && (
                <div className="card">
                  <h5 className="card-header bg-secondary text-white">대표상품 심의정보</h5>
                  <div className="card-body p-2">
                    <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                      <colgroup>
                        <col width="25%" />
                        <col width="*" />
                      </colgroup>
                      <tbody className="font-13">
                        <tr>
                          <th className="bg-light">등급분류번호</th>
                          <td>{data.rateno}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">등급분류기관</th>
                          <td>{data.grac?.orgname}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">신청업체명</th>
                          <td>{data.grac?.entname}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">등급분류일자</th>
                          <td>{data.grac?.rateddate}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">결정등급</th>
                          <td>{data.grac?.givenrate}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">내용정보표시</th>
                          <td>{data.grac?.descriptors}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer">
                    <div className="float-end">
                      <a
                        href={`/goods/title_modify?title_id=${data.title_id}`}
                        className="btn btn-sm btn-secondary shadow-none"
                      >
                        심의정보 설정
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 태그정보 */}
              <div className="card">
                <h5 className="card-header bg-secondary text-white">대표상품 태그정보</h5>
                <div className="card-body p-2">
                  <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                    <colgroup>
                      <col width="20%" />
                      <col width="*" />
                    </colgroup>
                    <tbody className="font-13">
                      <tr>
                        <th className="bg-light">장르</th>
                        <td>
                          {data.genres.map((genre: GoodsTag) => (
                            <span
                              key={genre.code}
                              className="badge bg-primary font-13 fw-normal me-2 mb-1"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">카테고리</th>
                        <td>
                          {data.categories.map((category: GoodsTag) => (
                            <span
                              key={category.code}
                              className="badge bg-info font-13 fw-normal me-2 mb-1"
                            >
                              {category.name}
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">태그</th>
                        <td>
                          {data.tags.map((tag: GoodsTag) => (
                            <span
                              key={tag.code}
                              className={`badge ${tagStyle(tag.code)} font-13 fw-normal me-1 mb-1`}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <div className="float-end">
                    <a
                      href={`/goods/title_tag_register?title_id=${data.title_id}`}
                      className="btn btn-sm btn-secondary shadow-none"
                    >
                      태그 설정
                    </a>
                  </div>
                </div>
              </div>

              {/* Steam 부가정보 (title_code==33) */}
              {isDigital && data.steam && (
                <div className="card">
                  <h5 className="card-header bg-secondary text-white">Steam 부가정보</h5>
                  <div className="card-body p-2">
                    <table className="table table-sm table-bordered border-secondary table-centered mb-0">
                      <colgroup>
                        <col width="25%" />
                        <col width="*" />
                      </colgroup>
                      <tbody className="font-13">
                        <tr>
                          <th className="bg-light">Appid</th>
                          <td>{data.steam.steam_appid}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">name</th>
                          <td>{data.steam.name}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">제 3자 DRM</th>
                          <td>{data.steam.drm_notice}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">타사 계정</th>
                          <td>{data.steam.ext_user_account_notice}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">추천수</th>
                          <td>{data.steam.recommendations.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">리뷰 평가</th>
                          <td>
                            {data.steam.review_score} ({data.steam.review_score_desc})
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-light">긍정 리뷰수</th>
                          <td>
                            {data.steam.total_positive.toLocaleString()}{" "}
                            {data.steam.total_reviews > 0 && (
                              <>
                                (
                                {Math.round(
                                  (data.steam.total_positive * 100 * 100) /
                                    data.steam.total_reviews,
                                ) / 100}
                                %)
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <h6>Pakcage 현황</h6>
                            <ol className="list-group list-group-numbered mb-2">
                              {data.steam.packages.map((pkg) => (
                                <li className="list-group-item" key={pkg.packageid}>
                                  {pkg.package_name} [{pkg.packageid}]
                                </li>
                              ))}
                            </ol>
                            <h6>DLC 현황</h6>
                            <ul className="list-group">
                              {data.steam.dlcs.map((dlc) => (
                                <li className="list-group-item" key={dlc.steam_appid}>
                                  {dlc.name} [{dlc.steam_appid}]
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer">
                    <div className="float-end">
                      <a
                        href={`/steam/steam_app_meta?appid=${data.steam.steam_appid}`}
                        className="btn btn-sm btn-info shadow-none"
                      >
                        Steam 정보 자세히보기
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 특전 및 구성안내 (description에 '게임 정보' 포함 시) */}
              {data.perks_html !== null && (
                <div className="card">
                  <h5 className="card-header bg-secondary text-white">대표상품 특전 및 구성안내</h5>
                  <div className="card-body p-1">
                    <div
                      id="etc"
                      className="font-12"
                      dangerouslySetInnerHTML={{ __html: data.perks_html }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
