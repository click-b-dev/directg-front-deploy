/**
 * Daum Postcode(우편번호 찾기) 재사용 헬퍼 (legacy `postcode.v2.js` 동일 로드).
 * 배송지·사은품·주문 등에서 공유. client 전용(window/document 사용).
 */

// legacy 배송지는 구 엔드포인트(ssl.daumcdn.net/dmaps/…, 현재 로드 실패)를 쓰나,
// legacy 사은품(gift)은 현행 엔드포인트를 사용한다. 동일 Daum Postcode 위젯이므로 현행 URL로 로드.
const SCRIPT_SRC = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

interface DaumPostcodeData {
  userSelectedType: "R" | "J";
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  bname: string;
  buildingName: string;
}

interface DaumPostcodeInstance {
  open: () => void;
}

interface DaumPostcodeCtor {
  new (opts: {
    oncomplete: (data: DaumPostcodeData) => void;
    onclose?: (state: string) => void;
  }): DaumPostcodeInstance;
}

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcodeCtor };
  }
}

let loadPromise: Promise<void> | null = null;

/** postcode.v2.js를 1회 로드(이미 있으면 즉시 resolve). */
function loadScript(): Promise<void> {
  if (typeof window !== "undefined" && window.daum?.Postcode) {
    return Promise.resolve();
  }
  if (!loadPromise) {
    loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Daum Postcode 스크립트 로드 실패"));
      };
      document.body.appendChild(script);
    });
  }
  return loadPromise;
}

export interface DaumPostcodeResult {
  /** 5자리 우편번호. */
  zonecode: string;
  /** 조합된 최종 주소(도로명이면 참고항목 괄호 포함). */
  address: string;
}

/**
 * 우편번호 찾기 팝업을 열고 선택 결과를 반환한다(취소 시 resolve 안 됨 — legacy도 미처리).
 * 주소 조합은 legacy `sample4_execDaumPostcode` 로직 그대로: 도로명/지번 + bname + buildingName.
 */
export async function openDaumPostcode(): Promise<DaumPostcodeResult> {
  await loadScript();
  return new Promise<DaumPostcodeResult>((resolve) => {
    new window.daum!.Postcode({
      oncomplete: (data) => {
        let fullAddr = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        if (data.userSelectedType === "R") {
          let extraAddr = "";
          if (data.bname !== "") {
            extraAddr += data.bname;
          }
          if (data.buildingName !== "") {
            extraAddr += extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
          }
          fullAddr += extraAddr !== "" ? " (" + extraAddr + ")" : "";
        }

        resolve({ zonecode: data.zonecode, address: fullAddr });
      },
    }).open();
  });
}
