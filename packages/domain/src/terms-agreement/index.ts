import { useCallback, useMemo, useState } from "react";

export type TermDefinition<TKey extends string = string> = {
  key: TKey;
  label: string;
  required: boolean;
  hasDetail?: boolean;
  title?: string;
  body?: string;
  href?: string;
  revisionDate?: string;
};

export type TermsAgreementValues<TKey extends string = string> = Record<TKey, boolean>;

export type TermsAgreementChangeReason = "term" | "all" | "reset";

export type TermsAgreementChange<TKey extends string> = {
  reason: TermsAgreementChangeReason;
  key?: TKey;
  checked?: boolean;
};

export type UseTermsAgreementOptions<TKey extends string> = {
  terms: readonly TermDefinition<TKey>[];
  value?: Partial<TermsAgreementValues<TKey>>;
  defaultValue?: Partial<TermsAgreementValues<TKey>>;
  onChange?: (values: TermsAgreementValues<TKey>, change: TermsAgreementChange<TKey>) => void;
};

export type UseTermsAgreementReturn<TKey extends string> = {
  values: TermsAgreementValues<TKey>;
  requiredTerms: readonly TermDefinition<TKey>[];
  optionalTerms: readonly TermDefinition<TKey>[];
  acceptedKeys: TKey[];
  allChecked: boolean;
  allRequiredChecked: boolean;
  isAccepted: (key: TKey) => boolean;
  setTerm: (key: TKey, checked: boolean) => void;
  setAll: (checked?: boolean) => void;
  reset: () => void;
};

export const createTermsAgreementValues = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
  initialValues: Partial<TermsAgreementValues<TKey>> = {},
): TermsAgreementValues<TKey> => {
  const values = {} as TermsAgreementValues<TKey>;

  for (const term of terms) {
    values[term.key] = initialValues[term.key] === true;
  }

  return values;
};

export const getRequiredTerms = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
): TermDefinition<TKey>[] => terms.filter((term) => term.required);

export const getOptionalTerms = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
): TermDefinition<TKey>[] => terms.filter((term) => !term.required);

export const getAcceptedTermKeys = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
  values: Partial<TermsAgreementValues<TKey>>,
): TKey[] => terms.filter((term) => values[term.key] === true).map((term) => term.key);

export const areAllTermsAccepted = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
  values: Partial<TermsAgreementValues<TKey>>,
) => terms.length > 0 && terms.every((term) => values[term.key] === true);

export const areRequiredTermsAccepted = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
  values: Partial<TermsAgreementValues<TKey>>,
) => getRequiredTerms(terms).every((term) => values[term.key] === true);

export const setTermAgreementValue = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
  values: Partial<TermsAgreementValues<TKey>>,
  key: TKey,
  checked: boolean,
): TermsAgreementValues<TKey> => {
  const next = createTermsAgreementValues(terms, values);

  if (terms.some((term) => term.key === key)) {
    next[key] = checked;
  }

  return next;
};

export const setAllTermsAgreementValues = <TKey extends string>(
  terms: readonly TermDefinition<TKey>[],
  checked: boolean,
): TermsAgreementValues<TKey> => {
  const next = {} as TermsAgreementValues<TKey>;

  for (const term of terms) {
    next[term.key] = checked;
  }

  return next;
};

export const useTermsAgreement = <TKey extends string>(
  options: UseTermsAgreementOptions<TKey>,
): UseTermsAgreementReturn<TKey> => {
  const { terms, value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [uncontrolledValues, setUncontrolledValues] = useState(() =>
    createTermsAgreementValues(terms, defaultValue),
  );

  const values = useMemo(
    () => createTermsAgreementValues(terms, isControlled ? value : uncontrolledValues),
    [isControlled, terms, uncontrolledValues, value],
  );

  const requiredTerms = useMemo(() => getRequiredTerms(terms), [terms]);
  const optionalTerms = useMemo(() => getOptionalTerms(terms), [terms]);
  const acceptedKeys = useMemo(() => getAcceptedTermKeys(terms, values), [terms, values]);
  const allChecked = useMemo(() => areAllTermsAccepted(terms, values), [terms, values]);
  const allRequiredChecked = useMemo(
    () => areRequiredTermsAccepted(terms, values),
    [terms, values],
  );

  const commit = useCallback(
    (nextValues: TermsAgreementValues<TKey>, change: TermsAgreementChange<TKey>) => {
      if (!isControlled) {
        setUncontrolledValues(nextValues);
      }
      onChange?.(nextValues, change);
    },
    [isControlled, onChange],
  );

  const isAccepted = useCallback((key: TKey) => values[key] === true, [values]);

  const setTerm = useCallback(
    (key: TKey, checked: boolean) => {
      commit(setTermAgreementValue(terms, values, key, checked), {
        reason: "term",
        key,
        checked,
      });
    },
    [commit, terms, values],
  );

  const setAll = useCallback(
    (checked = !allChecked) => {
      commit(setAllTermsAgreementValues(terms, checked), {
        reason: "all",
        checked,
      });
    },
    [allChecked, commit, terms],
  );

  const reset = useCallback(() => {
    commit(createTermsAgreementValues(terms, defaultValue), { reason: "reset" });
  }, [commit, defaultValue, terms]);

  return {
    values,
    requiredTerms,
    optionalTerms,
    acceptedKeys,
    allChecked,
    allRequiredChecked,
    isAccepted,
    setTerm,
    setAll,
    reset,
  };
};
