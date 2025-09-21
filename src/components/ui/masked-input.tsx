import * as React from "react";
import InputMask, { Props as InputMaskProps } from "react-input-mask";
import { Input, InputProps } from "@/components/ui/input";

// Combine props from react-input-mask and your custom Input component
interface MaskedInputProps extends Omit<InputMaskProps, 'children'> {
  inputProps?: InputProps;
  children?: React.ReactNode; // Make children optional
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, onBlur, name, inputProps, ...props }, ref) => {
    return (
      <InputMask
        mask={mask}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        {...props}
      >
        {/* The `any` type is used here because the props passed by InputMask don't perfectly match what the shadcn Input expects, but it works in practice. */}
        {(inputMaskProps: any) => <Input {...inputMaskProps} {...inputProps} ref={ref} />}
      </InputMask>
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };