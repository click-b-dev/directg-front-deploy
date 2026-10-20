import { useState, type ComponentProps } from "react";
import { Input } from "@click-b/ui";
import iconEyeOff from "@/renewal/assets/icon-eye-off.svg";
import { cx } from "../lib/cx";

// Figma `Placeholder/Peek`(size L): min-h50 · px12 py6 · 글자 18 · 오른쪽 눈 아이콘(24).
// 눈 아이콘을 누르면 비밀번호를 보였다 숨긴다. (보이는 상태용 "eye" 아이콘 에셋은 아직 디자인에 없어 같은 아이콘을 쓴다.)
export type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export const PasswordInput = ({ className, invalid, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={cx(
        "rn:flex rn:min-h-50 rn:w-full rn:items-center rn:gap-4 rn:rounded-8 rn:border rn:border-solid rn:bg-surface rn:px-12 rn:py-6",
        invalid ? "rn:border-error" : "rn:border-line rn:focus-within:border-line-2",
        className,
      )}
    >
      <Input
        {...props}
        type={visible ? "text" : "password"}
        invalid={invalid}
        className="rn:min-w-0 rn:flex-1 rn:bg-transparent rn:pr-4 rn:text-body1 rn:text-ink rn:outline-none rn:placeholder:text-ink-3"
      />
      <button
        type="button"
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="rn:flex rn:size-24 rn:shrink-0 rn:items-center rn:justify-center"
      >
        <img src={iconEyeOff} alt="" width={24} height={24} />
      </button>
    </div>
  );
};
