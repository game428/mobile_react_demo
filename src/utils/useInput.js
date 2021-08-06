import { useState } from "react";

export function useInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  function onChange(v) {
    setValue(v);
  }

  return [
    {
      value,
      onChange,
    },
    (v) => setValue(v),
  ];
}
