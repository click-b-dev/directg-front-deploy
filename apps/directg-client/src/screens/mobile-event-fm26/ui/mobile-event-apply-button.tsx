"use client";

import { postFm26Apply, type Fm26ApplyRequest } from "@entities/event";

interface MobileEventApplyButtonProps {
  eventNo: Fm26ApplyRequest["event_no"];
  label: string;
  className?: string;
}

/**
 * 모바일 FM26 이벤트 응모 버튼 — legacy `.btn_event` AJAX 분기 재현.
 * success/fail은 alert 후 reload, request는 구글폼 새 창만 연다.
 */
export function MobileEventApplyButton({
  eventNo,
  label,
  className = "btn btn-primary btn-sm font-15 fw-bold rounded-1 btn_event",
}: MobileEventApplyButtonProps) {
  const handleClick = async () => {
    try {
      const data = await postFm26Apply({ event_no: eventNo });
      if (data.result_code === "success") {
        alert(data.result_msg);
        location.reload();
      } else if (data.result_code === "request") {
        window.open(data.result_url, "_blank");
      } else {
        alert(data.result_msg);
        location.reload();
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <button type="button" className={className} data-no={eventNo} onClick={handleClick}>
      {label}
    </button>
  );
}
