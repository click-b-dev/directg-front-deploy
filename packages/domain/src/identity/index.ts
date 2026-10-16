export const PHONE_CARRIER_OPTIONS = [
  { value: "SKT", label: "SKT" },
  { value: "KT", label: "KT" },
  { value: "LGU", label: "LG U+" },
  { value: "MVNO_SKT", label: "SKT 알뜰폰" },
  { value: "MVNO_KT", label: "KT 알뜰폰" },
  { value: "MVNO_LGU", label: "LG U+ 알뜰폰" },
] as const;

export type PhoneCarrier = (typeof PHONE_CARRIER_OPTIONS)[number]["value"];

export const PASSWORD_POLICY_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/;

export const onlyDigits = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

export const formatKoreanPhoneNumber = (value: string) => {
  const digits = onlyDigits(value, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const rest = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${rest}`;
};

export const birthDateFromRrn = (yymmdd: string, rrnFirstDigit: string): string | null => {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  if (!/^[1-8]$/.test(rrnFirstDigit)) return null;

  const yy = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const digit = Number.parseInt(rrnFirstDigit, 10);
  const century = digit === 1 || digit === 2 || digit === 5 || digit === 6 ? "19" : "20";

  return `${century}${yy}-${mm}-${dd}`;
};

export const birthDateFromDomesticRrn = (yymmdd: string, rrnFirstDigit: string): string | null => {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  if (!/^[1-4]$/.test(rrnFirstDigit)) return null;

  return birthDateFromRrn(yymmdd, rrnFirstDigit);
};

export const isPasswordPolicyMatched = (value: string) => PASSWORD_POLICY_PATTERN.test(value);
