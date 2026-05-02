interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
      {error}
    </p>
  );
}
