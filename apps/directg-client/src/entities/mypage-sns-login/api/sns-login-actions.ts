import { apiClient } from "@shared/api/client";
import type {
  PaycoDisconnectResponse,
  SnsConnectType,
  SnsConnectUrlResponse,
  SnsDisconnectResponse,
} from "../model/types";

const PROVIDER_PATH: Record<SnsConnectType, string> = {
  PAYCO: "payco",
  KAKAO: "kakao",
  NAVER: "naver",
};

/** SNS 계정연결 OAuth URL. legacy `{mode:"payco_connect"|"kakao_connect"|"naver_connect"}`. */
export async function postSnsConnectUrl(type: SnsConnectType): Promise<SnsConnectUrlResponse> {
  const provider = PROVIDER_PATH[type];
  return apiClient.post<SnsConnectUrlResponse>(`mypage/sns/${provider}/connect-url`, {
    mode: `${provider}_connect`,
  });
}

/** PAYCO 연결해제. legacy 성공값은 raw `"0"`. */
export async function postPaycoDisconnect(): Promise<PaycoDisconnectResponse> {
  return apiClient.post<PaycoDisconnectResponse>("mypage/sns/payco/disconnect", {
    sns_type: "PAYCO",
  });
}

/** KAKAO/NAVER 연결해제. legacy `{code,msg}` JSON. */
export async function postSnsDisconnect(type: Extract<SnsConnectType, "KAKAO" | "NAVER">) {
  const provider = PROVIDER_PATH[type];
  return apiClient.post<SnsDisconnectResponse>(`mypage/sns/${provider}/disconnect`, {
    sns_type: type,
  });
}
