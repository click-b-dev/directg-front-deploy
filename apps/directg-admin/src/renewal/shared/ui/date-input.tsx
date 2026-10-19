import { useEffect, useState } from "react";
import { TextInput, type TextInputProps } from "./text-input";

// Figma 날짜 입력은 `2026.08.01` 형식의 텍스트 박스다. 값(value)은 API 형식 `YYYY-MM-DD`를 쓴다.
const toDisplay = (value: string) => value.replaceAll("-", ".");

const isValid = (display: string) => {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(display);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
};

type DateInputProps = Omit<TextInputProps, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
};

export const DateInput = ({ value, onValueChange, onBlur, ...props }: DateInputProps) => {
  const [text, setText] = useState(toDisplay(value));

  useEffect(() => setText(toDisplay(value)), [value]);

  return (
    <TextInput
      inputMode="numeric"
      placeholder="YYYY.MM.DD"
      maxLength={10}
      value={text}
      onChange={(event) => {
        const next = event.target.value.replace(/[^\d.]/g, "");
        setText(next);
        if (isValid(next)) onValueChange(next.replaceAll(".", "-"));
      }}
      onBlur={(event) => {
        if (!isValid(text)) setText(toDisplay(value));
        onBlur?.(event);
      }}
      {...props}
    />
  );
};
