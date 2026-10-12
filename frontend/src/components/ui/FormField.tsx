import type {
  ChangeEvent,
  HTMLInputTypeAttribute,
} from "react";


interface FormFieldProps {
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  autoComplete?: string;
  disabled?: boolean;
}


function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="form-field">

      <label className="form-field__label">
        {label}
      </label>

      <input
        className="form-field__input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
      />

    </div>
  );
}


export default FormField;