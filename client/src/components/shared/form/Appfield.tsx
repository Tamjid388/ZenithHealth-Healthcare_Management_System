import { cn } from "@/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form";

type AppFieldProps = {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
  append?: React.ReactNode;
  prepend?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string")
      return error.message;
  }
  return String(error);
};

const AppField = ({
  field,
  label,
  type = "text",
  placeholder,
  append,
  prepend,
  disabled = false,
  className,
}: AppFieldProps) => {
  const firstError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0
      ? field.state.meta.errors[0]
      : null;

  const hasError = firstError !== null;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={field.name}
        className={cn(hasError ? "text-red-500" : "text-gray-900")}
      >
        {label}
      </label>

      <div className="relative">
        {prepend && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            {prepend}
          </div>
        )}

        <input
          type={type}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${field.name}-error` : undefined}
          className={cn(
            "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            prepend && "pl-10",
            append && "pr-10",
            hasError && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {append && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
            {append}
          </div>
        )}

        {hasError && (
          <p
            id={`${field.name}-error`}
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            {getErrorMessage(firstError)}
          </p>
        )}
      </div>
    </div>
  );
};

export default AppField;
