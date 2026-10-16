"use client";

import { postRequestReturn } from "@entities/mypage-order";

interface RequestReturnButtonProps {
  settleNo: string;
  ordno: string;
}

/**
 * 요청철회 버튼 (legacy `requestReturn(settle_no, ordno)`). status==8 행에만 렌더.
 * confirm → POST → success면 alert+reload, 실패/에러면 alert. (legacy jQuery ajax 재현)
 */
export function RequestReturnButton({ settleNo, ordno }: RequestReturnButtonProps) {
  const handleClick = async () => {
    if (!confirm(`주문번호 ${ordno} 주문의 취소 요청을 철회하시겠습니까?`)) {
      return;
    }
    try {
      const data = await postRequestReturn({ settle_no: settleNo, ordno });
      alert(data.message);
      if (data.success) {
        location.reload();
      }
    } catch (error) {
      // legacy: error 콜백 alert(data.message) — jqXHR엔 message 없어 undefined
      alert(error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-primary text-white font-14"
      onClick={handleClick}
    >
      요청철회
    </button>
  );
}
