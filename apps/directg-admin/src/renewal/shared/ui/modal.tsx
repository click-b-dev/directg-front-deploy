import type { ReactNode } from "react";
import { AlertDialog, Dialog } from "@click-b/ui";
import iconClose from "@/renewal/assets/icon-close.svg";
import { cx } from "../lib/cx";
import { Button } from "./button";

// 딤: Figma `Background` rgba(0,0,0,0.4). 모달 본체: 흰색 · radius 12.
const BACKDROP = "rn:fixed rn:inset-0 rn:z-40 rn:bg-dim";
const POSITIONER = "rn:fixed rn:inset-0 rn:z-50 rn:flex rn:items-center rn:justify-center rn:p-24";
const SURFACE = "rn:flex rn:flex-col rn:rounded-12 rn:bg-surface";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** 하단(modal-bottom) 영역 — 보통 닫기 버튼 */
  footer?: ReactNode;
  className?: string;
};

// Figma `modal`(w600): modal-header(제목 + 닫기, 아래 선) / body(p20) / modal-bottom
export const Modal = ({ open, onOpenChange, title, children, footer, className }: ModalProps) => {
  // @click-b/ui Dialog는 외부에서 `open`을 제어하면 열 때 동기화 효과가 충돌해 무한 렌더가 난다.
  // 그래서 열려 있을 때만 마운트하고(defaultOpen), 닫힘은 onOpenChange로 부모에 알린다.
  if (!open) return null;
  return (
    <Dialog.Root defaultOpen onOpenChange={(next) => !next && onOpenChange(false)}>
      <Dialog.Backdrop className={BACKDROP} />
      <Dialog.Positioner className={POSITIONER}>
        <Dialog.Content className={cx(SURFACE, "rn:max-h-full rn:w-600 rn:max-w-full", className)}>
          <div className="rn:flex rn:shrink-0 rn:items-start rn:gap-16 rn:border-b rn:border-solid rn:border-line rn:px-20 rn:pt-20 rn:pb-12">
            <Dialog.Title className="rn:flex-1 rn:text-body1 rn:font-medium rn:text-ink">
              {title}
            </Dialog.Title>
            <Dialog.CloseTrigger aria-label="닫기" className="rn:flex rn:pt-2">
              <img src={iconClose} alt="" width={28} height={28} />
            </Dialog.CloseTrigger>
          </div>
          {/* 화면 높이가 모자라면 헤더/하단은 고정하고 본문만 스크롤한다. */}
          <div className="rn:flex rn:min-h-0 rn:flex-1 rn:flex-col rn:gap-24 rn:overflow-y-auto rn:p-20">
            {children}
          </div>
          {footer && <div className="rn:shrink-0 rn:px-20 rn:pt-16 rn:pb-24">{footer}</div>}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
};

// Figma `alert_modal`(w480): 메시지(body1 Medium) + 취소/확인 버튼 2개(M, 균등)
export const ConfirmModal = ({
  open,
  onOpenChange,
  message,
  onConfirm,
  confirmLabel = "확인",
  cancelLabel = "취소",
  pending = false,
}: ConfirmModalProps) => {
  // Modal과 같은 이유로 열려 있을 때만 마운트한다(AlertDialog도 제어 모드에서 무한 렌더).
  if (!open) return null;
  return (
    <AlertDialog.Root defaultOpen onOpenChange={(next) => !next && onOpenChange(false)}>
      <AlertDialog.Backdrop className={BACKDROP} />
      <AlertDialog.Positioner className={POSITIONER}>
        <AlertDialog.Content className={cx(SURFACE, "rn:w-480 rn:max-w-full")}>
          <AlertDialog.Title className="rn:px-20 rn:pt-24 rn:pb-16 rn:text-body1 rn:font-medium rn:text-ink">
            {message}
          </AlertDialog.Title>
          <div className="rn:flex rn:gap-8 rn:px-20 rn:pt-16 rn:pb-24">
            <AlertDialog.CloseTrigger className="rn:inline-flex rn:h-50 rn:flex-1 rn:items-center rn:justify-center rn:rounded-8 rn:border rn:border-solid rn:border-line rn:bg-surface rn:px-12 rn:py-10 rn:text-body2 rn:font-medium rn:text-ink">
              {cancelLabel}
            </AlertDialog.CloseTrigger>
            <Button className="rn:flex-1" onClick={onConfirm} disabled={pending}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Positioner>
    </AlertDialog.Root>
  );
};
