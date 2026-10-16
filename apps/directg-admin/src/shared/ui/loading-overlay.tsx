import "./loading-overlay.css";

// legacy admin_head.php `LoadingOverlay(action)` 재현.
// 명령형 전역함수(show/hide) → React `show` prop. AJAX 대기 중 표시하던 전화면 오버레이.
export const LoadingOverlay = ({ show }: { show: boolean }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="loading-overlay" id="_loading_overlay">
      <div className="loading-overlay__spinner" />
    </div>
  );
};
