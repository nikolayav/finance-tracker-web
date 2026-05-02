import { InputHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function InputField({ label, id, className, ...props }: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="dark:text-gray-300">
        {label}
      </Label>
      <Input
        id={inputId}
        className={`dark:bg-gray-800 dark:border-gray-600 dark:text-white ${className ?? ""}`}
        {...props}
      />
    </div>
  );
}
