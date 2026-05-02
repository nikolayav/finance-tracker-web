import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ErrorAlert } from "./ErrorAlert";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  error?: string;
  onSubmit: (e: { preventDefault(): void }) => void;
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  children: ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  error,
  onSubmit,
  submitLabel,
  submittingLabel = "Saving...",
  isSubmitting,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorAlert error={error} />}
          {children}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 dark:text-white"
            >
              <PlusIcon className="w-4 h-4" />
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
