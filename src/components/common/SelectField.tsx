import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
}

export function SelectField({ label, value, onValueChange, placeholder, children }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="dark:text-gray-300">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}
