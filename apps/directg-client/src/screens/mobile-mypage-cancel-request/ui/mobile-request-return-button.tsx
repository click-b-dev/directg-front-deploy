"use client";

import { postRequestReturn } from "@entities/mypage-order";

interface MobileRequestReturnButtonProps {
  settleNo: string;
  ordno: string;
}

/**
 * 모바일 요청철회 버튼 (legacy `requestReturn(settle_no, ordno)`). status==8 카드에만 렌더.
 * confirm → POST → data.success면 alert(message)+reload, 실패/에러면 alert(message). 모바일 btn-block.
 */
export function MobileRequestReturnButton({ settleNo, ordno }: MobileRequestReturnButtonProps) {
  const handleClick = async () => {
    if (!confirm(`주문번호 ${ordno} 주문의 취소 요청을 철회하시겠습니까?`)) {
      return;
    }
    try {
      const data = await postRequestReturn({ settle_no: settleNo, ordno });
      if (data.success) {
        window.alert(data.message);
        window.location.reload();
      } else {
        window.alert(data.message);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <button type="button" className="btn btn-primary btn-block" onClick={handleClick}>
      요청철회
    </button>
  );
}
