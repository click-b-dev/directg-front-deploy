"use client";

import { postSupplyContentLog } from "@entities/mypage-supply-content";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface SupplyDownloadButtonProps {
  fileUrl: string;
  ordno: string;
  patchName: string;
}

/**
 * 제공콘텐츠 다운로드 버튼 (legacy `.btn_download`). window.open + gtag 이벤트 + fire-and-forget 로그.
 */
export function SupplyDownloadButton({ fileUrl, ordno, patchName }: SupplyDownloadButtonProps) {
  const handleClick = () => {
    window.open(fileUrl, "_blank");
    window.gtag?.("event", "download_click", {
      event_category: "제공콘텐츠",
      event_label: patchName,
    });
    void postSupplyContentLog({ file_url: fileUrl, ordno, patch_name: patchName });
  };

  return (
    <button className="btn btn-sm btn-danger btn_download" onClick={handleClick}>
      다운로드
    </button>
  );
}
