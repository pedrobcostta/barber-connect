import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";

interface MaskedInputProps extends InputProps {
  mask: string;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, ...props }, ref) => {
    const applyMask = (inputValue: string) => {
      const numericValue = inputValue.replace(/\D/g, "");
      let maskedValue = "";
      let valueIndex = 0;

      for (let i = 0; i < mask.length && valueIndex < numericValue.length; i++) {
        if (mask[i] === "9") {
          maskedValue += numericValue[valueIndex++];
        } else {
          maskedValue += mask[i];
        }
      }
      return maskedValue;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const newMaskedValue = applyMask(rawValue);
      
      // Create a new event to pass up to react-hook-form
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: newMaskedValue,
        },
      };

      // @ts-ignore
      onChange?.(syntheticEvent);
    };

    const maskedValue = value ? applyMask(String(value)) : "";

    return (
      <Input
        {...props}
        ref={ref}
        value={maskedValue}
        onChange={handleChange}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };