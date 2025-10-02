import * as React from "react";

type PossibleRef<T> = React.MutableRefObject<T | null> | React.RefCallback<T> | null | undefined;

export function mergeRefs<T>(...refs: PossibleRef<T>[]) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}
