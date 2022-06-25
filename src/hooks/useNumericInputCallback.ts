import { NumericInputProps } from '@blueprintjs/core';
import { useState, useLayoutEffect } from 'react';

export const useNumericInputCallback = (
  value: number,
  callback?: (value: number) => void
): [string, number, NumericInputProps['onValueChange']] => {
  const [numberValue, setNumberValue] = useState(value);
  const [stringValue, setStringValue] = useState(value.toString());

  useLayoutEffect(() => {
    setNumberValue(value);
    setStringValue(value.toString());
  }, [value]);

  const onChange = (valueAsNumber: number, valueAsString: string) => {
    if (!valueAsString) {
      setStringValue('');
      return;
    }

    if (!valueAsString.match(/^\d+$/)) return;

    const value = Math.round(valueAsNumber);

    if (isNaN(value)) return;

    callback?.(value);

    setNumberValue(value);
    setStringValue(valueAsString);
  };

  return [stringValue, numberValue, onChange];
};
