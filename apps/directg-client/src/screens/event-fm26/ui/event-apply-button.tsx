"use client";

import { postFm26Apply } from "@entities/event";
import type { Fm26ApplyRequest } from "@entities/event";

interface EventApplyButtonProps {
  eventNo: Fm26ApplyRequest["event_no"];
  label: string;
}

/**
 * 이벤트 응모 버튼 (legacy `.btn_event` jQuery AJAX 재현).
 * POST 후 응답 분기: success/fail → alert + reload, request → window.open(구글폼).
 */
export function EventApplyButton({ eventNo, label }: EventApplyButtonProps) {
  const handleClick = async () => {
    try {
      const data = await postFm26Apply({ event_no: eventNo });
      if (data.result_code === "success") {
        alert(data.result_msg);
        location.reload();
      } else if (data.result_code === "request") {
        // legacy: window.open(result_url, "_blank") (reload 없음)
        window.open(data.result_url, "_blank");
      } else {
        // fail — 미달/중복
        alert(data.result_msg);
        location.reload();
      }
    } catch (error) {
      // legacy: error 시 alert(jqXHR)
      alert(error);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-primary btn-lg fw-bold btn_event"
      data-no={eventNo}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
