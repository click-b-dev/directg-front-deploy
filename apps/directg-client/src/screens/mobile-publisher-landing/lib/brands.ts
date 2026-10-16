/** 퍼블리셔 랜딩 브랜드 config (legacy publisher_<brand>.html 하드코딩 — code/title/배너). */
export interface PublisherBrand {
  /** supplier_code (legacy $publisher_code). */
  publisherCode: string;
  /** page_title (legacy 하드코딩 — getPublisher 아님). */
  title: string;
  /** 배너 외부 링크(target=_blank). */
  bannerLink: string;
  /** 배너 이미지 URL(image.directg.net 전체 경로). */
  bannerImage: string;
  /** 배너 alt (legacy verbatim — gmode/neowiz는 "2K" 오타 그대로). */
  bannerAlt: string;
  /** 뷰/sort base 경로(예: "/game/publisher_capcom"). */
  basePath: string;
}

/** legacy 무접미 랜딩 8종(2k/capcom/gmode/marvelous/neowiz/paradox/playstation/sega). */
export const PUBLISHER_BRANDS: Record<string, PublisherBrand> = {
  "2k": {
    publisherCode: "12",
    title: "2K",
    bannerLink: "https://2k.com",
    bannerImage: "https://image.directg.net/G82mEwpkDD",
    bannerAlt: "2K",
    basePath: "/game/publisher_2k",
  },
  capcom: {
    publisherCode: "34",
    title: "CAPCOM",
    bannerLink: "https://www.capcom-games.com/en-asia/",
    bannerImage: "https://image.directg.net/C82mEwprAr",
    bannerAlt: "CAPCOM",
    basePath: "/game/publisher_capcom",
  },
  gmode: {
    publisherCode: "372",
    title: "G-MODE",
    bannerLink: "https://gmodecorp.com/",
    bannerImage: "https://image.directg.net/f82IlCVzDO",
    bannerAlt: "2K", // legacy alt 오타 verbatim
    basePath: "/game/publisher_gmode",
  },
  marvelous: {
    publisherCode: "314",
    title: "Marvelous",
    bannerLink: "https://corp.marv.jp/",
    bannerImage: "https://image.directg.net/t82mEwpxJ3",
    bannerAlt: "Marvelous",
    basePath: "/game/publisher_marvelous",
  },
  neowiz: {
    publisherCode: "117",
    title: "NEOWIZ",
    bannerLink: "https://www.neowiz.com/",
    bannerImage: "https://image.directg.net/D82mEwpECv",
    bannerAlt: "2K", // legacy alt 오타 verbatim
    basePath: "/game/publisher_neowiz",
  },
  paradox: {
    publisherCode: "30",
    title: "Paradox Interactive",
    bannerLink: "https://www.paradoxinteractive.com/",
    bannerImage: "https://image.directg.net/p82mEwtz5A",
    bannerAlt: "Paradox Interactive",
    basePath: "/game/publisher_paradox",
  },
  playstation: {
    publisherCode: "162",
    title: "PlayStation Publishing LLC",
    bannerLink: "https://www.playstation.com/ko-kr/games/pc-games/",
    bannerImage: "https://image.directg.net/y82mEwtRKA",
    bannerAlt: "PlayStation Publishing LLC",
    basePath: "/game/publisher_playstation",
  },
  sega: {
    publisherCode: "93",
    title: "SEGA",
    bannerLink: "https://www.sega-spk.co.kr",
    bannerImage: "https://image.directg.net/q82mEwpdAv",
    bannerAlt: "SEGA",
    basePath: "/game/publisher_sega",
  },
};
