import { useEffect, useRef } from "react";
import {
  useDownloadImage,
  useImages,
  useUploadImage,
  type ImageSlotKey,
  type ImageSlotState,
  type TitleImages,
} from "@entities/goods-title";
import { TitleSubNav } from "@widgets/title-sub-nav";
import { useProductViewer } from "@shared/lib/use-product-viewer";

type TitleImageScreenProps = { titleId: number };

// legacy goods/title_image_register.php — 대표상품 이미지 설정.
export const TitleImageScreen = ({ titleId }: TitleImageScreenProps) => {
  const { data } = useImages(titleId);

  useEffect(() => {
    document.title = "대표상품 이미지 설정";
  }, []);

  if (!data) {
    return null;
  }
  return <ImageSettings data={data} />;
};

// 슬롯별 정적 config(라벨/치수/경로/버튼). 동적 상태(업로드/존재/steam_url)는 API.
type SlotConfig = {
  key: ImageSlotKey;
  webLabel: string;
  webPath: (id: number) => string; // /upload/title/..
  diskLabel: string;
  diskPath: (id: number) => string; // image.directg.net/..
  filePath: (id: number) => string;
  steamButtonLabel: string;
  saveButtonLabel: string;
  placeholder: string; // [웹서버] 미업로드 문구
  diskPlaceholder: string; // [디스크엔] 미존재 문구(라벨과 별개)
  maxWidth?: string;
};

const SLOTS: SlotConfig[] = [
  {
    key: "header",
    webLabel: "Header  460 x 215 px",
    webPath: (id) => `/upload/title/${id}/header/${id}.jpg`,
    diskLabel: "header 이미지 (460x215)",
    diskPath: (id) => `https://image.directg.net/upload/title/${id}/header/${id}.jpg`,
    filePath: (id) => `/upload/title/${id}/header/${id}.jpg`,
    steamButtonLabel: "header 이미지 업로드",
    saveButtonLabel: "header 이미지 저장",
    placeholder: "header 이미지를 업로드해주세요",
    diskPlaceholder: "header 이미지를 업로드해주세요",
  },
  {
    key: "capsule231",
    webLabel: "Small capsule: 231 x 87 px (현재는 사용되는 곳 없음)",
    webPath: (id) => `/upload/title/${id}/capsule/capsule_231x87.jpg`,
    diskLabel: "capsule 이미지 (231x87)",
    diskPath: (id) => `https://image.directg.net/upload/title/${id}/capsule/capsule_231x87.jpg`,
    filePath: (id) => `/upload/title/${id}/capsule/capsule_231x87.jpg`,
    steamButtonLabel: "capsule(231x87) 이미지 업로드",
    saveButtonLabel: "capsule(231x87) 이미지 저장",
    placeholder: "capsule 이미지를 업로드해주세요",
    diskPlaceholder: "capsule(231x87) 이미지를 업로드해주세요",
  },
  {
    key: "library",
    webLabel: "Library capsule: 600 x 900 px",
    webPath: (id) => `/upload/title/${id}/library/library_600x900.jpg`,
    diskLabel: "library(600x900)",
    diskPath: (id) => `https://image.directg.net/upload/title/${id}/library/library_600x900.jpg`,
    filePath: (id) => `/upload/title/${id}/library/library_600x900.jpg`,
    steamButtonLabel: "",
    saveButtonLabel: "library 이미지 저장",
    placeholder: "library 이미지를 업로드해주세요",
    diskPlaceholder: "library(600x900) 이미지를 업로드해주세요",
    maxWidth: "300px",
  },
  {
    key: "hero",
    webLabel: "Vertical capsule: 374x448 px",
    webPath: (id) => `/upload/title/${id}/hero/hero_capsule.jpg`,
    diskLabel: "Vertical capsule: 374x448 px",
    diskPath: (id) => `https://image.directg.net/upload/title/${id}/hero/hero_capsule.jpg`,
    filePath: (id) => `/upload/title/${id}/hero/hero_capsule.jpg`,
    steamButtonLabel: "Vertical capsule(374x448) 이미지 업로드",
    saveButtonLabel: "hero_capsule 이미지 저장",
    placeholder: "hero_capsule 이미지를 업로드해주세요",
    diskPlaceholder: "hero_capsule(374x448) 이미지를 업로드해주세요",
  },
];

const ImageSettings = ({ data }: { data: TitleImages }) => {
  const downloadImage = useDownloadImage();
  const uploadImage = useUploadImage();
  const productViewer = useProductViewer();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const onDownload = (key: ImageSlotKey) => {
    downloadImage.mutate({ titleId: data.title_id, payload: { key } });
  };
  const onUpload = (key: ImageSlotKey) => {
    const file = fileRefs.current[key]?.files?.[0];
    if (!file) {
      return;
    }
    uploadImage.mutate({ titleId: data.title_id, payload: { key, file_name: file.name } });
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
                <li className="breadcrumb-item active">이미지 설정</li>
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
          <TitleSubNav titleId={data.title_id} titleCode="33" active="image" />
        </div>
        <div className="col-10">
          <div className="row">
            {/* [웹서버] */}
            <div className="col-6">
              <div className="card border">
                <div className="card-header bg-secondary text-white fw-bold font-15">
                  대표상품 이미지 설정 - [웹서버]
                </div>
                <div className="card-body p-2">
                  {SLOTS.map((slot) => (
                    <WebSlotCard
                      key={slot.key}
                      slot={slot}
                      state={data.slots[slot.key]}
                      titleId={data.title_id}
                      onDownload={() => onDownload(slot.key)}
                      onUpload={() => onUpload(slot.key)}
                      productViewer={productViewer}
                      fileRef={(el) => {
                        fileRefs.current[slot.key] = el;
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* [디스크엔] */}
            <div className="col-6">
              <div className="card">
                <h5 className="card-header bg-secondary text-white">
                  대표상품 이미지설정 - [디스크엔]
                </h5>
                <div className="card-body p-2">
                  {SLOTS.map((slot) => (
                    <DiskSlotCard
                      key={slot.key}
                      slot={slot}
                      state={data.slots[slot.key]}
                      titleId={data.title_id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Placeholder = ({ text }: { text: string }) => (
  <div className="d-block py-2 text-center text-danger">{text}</div>
);

const WebSlotCard = ({
  slot,
  state,
  titleId,
  onDownload,
  onUpload,
  productViewer,
  fileRef,
}: {
  slot: SlotConfig;
  state: ImageSlotState;
  titleId: number;
  onDownload: () => void;
  onUpload: () => void;
  productViewer: boolean;
  fileRef: (el: HTMLInputElement | null) => void;
}) => {
  // legacy: capsule231은 steam 존재 시 다운로드 버튼, 아니면 파일 업로드(either-or). 그 외는 파일 업로드 항상.
  // steam_available = remoteFileExist(steam_url)==200 (스팀 CDN 실제 존재). appid 유무만으로 판정하지 않음.
  const steamAvailable = state.steam_available;
  const showFileUpload = slot.key === "capsule231" ? !steamAvailable : true;
  const showSteamButton =
    slot.key === "header" ? true : slot.key === "library" ? false : steamAvailable;

  return (
    <div className="card border">
      <div className="card-header bg-light fw-bold">{slot.webLabel}</div>
      <div className="card-body p-0">
        {state.web_uploaded ? (
          <img
            src={`${slot.webPath(titleId)}?t=1`}
            className="img-fluid mx-auto d-block"
            style={slot.maxWidth ? { maxWidth: slot.maxWidth } : undefined}
            alt=""
          />
        ) : (
          <Placeholder text={slot.placeholder} />
        )}
      </div>
      <div className="card-footer text-end">
        {slot.key === "header" && (
          <div className="mb-2">
            <span>{state.steam_url}</span>{" "}
            {/* legacy: product_viewer면 스팀 다운로드 버튼 숨김(URL은 유지). */}
            {!productViewer && (
              <button
                type="button"
                className="btn btn-secondary btn-sm shadow-none"
                onClick={onDownload}
              >
                {slot.steamButtonLabel}
              </button>
            )}
          </div>
        )}
        {showSteamButton && slot.key !== "header" && !productViewer && (
          <div className={slot.key === "hero" ? "mt-3" : undefined}>
            <button
              type="button"
              className="btn btn-secondary btn-sm shadow-none"
              onClick={onDownload}
            >
              {slot.steamButtonLabel}
            </button>
          </div>
        )}
        {showFileUpload && (
          <div className="d-flex flex-row">
            <div className="input-group">
              <input type="file" className="form-control" ref={fileRef} required />
              {/* legacy: product_viewer면 저장 버튼 숨김(파일 input은 유지). */}
              {!productViewer && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm shadow-none"
                  onClick={onUpload}
                >
                  {slot.saveButtonLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DiskSlotCard = ({
  slot,
  state,
  titleId,
}: {
  slot: SlotConfig;
  state: ImageSlotState;
  titleId: number;
}) => (
  <div className="card border">
    <div className="card-header bg-light fw-bold">{slot.diskLabel}</div>
    <div className="card-body p-0">
      {state.disk_exists ? (
        <img
          src={`${slot.diskPath(titleId)}?t=1`}
          className="img-fluid mx-auto d-block"
          style={slot.maxWidth ? { maxWidth: slot.maxWidth } : undefined}
          alt=""
        />
      ) : (
        // legacy: header만 remoteFileExist 코드 줄을 함께 표기.
        <div className="d-block py-2 text-center text-danger">
          {slot.key === "header" && (
            <>
              http code:{state.http_code}
              <br />
            </>
          )}
          {slot.diskPlaceholder}
        </div>
      )}
    </div>
    <div className="card-footer bg-light">파일경로: {slot.filePath(titleId)}</div>
  </div>
);
