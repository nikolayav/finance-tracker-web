import { ElementType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateCardProps {
  icon: ElementType;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyStateCard({ icon: Icon, title, subtitle, action }: EmptyStateCardProps) {
  return (
    <Card className="dark:bg-gray-900 dark:border-gray-700">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        {subtitle && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
