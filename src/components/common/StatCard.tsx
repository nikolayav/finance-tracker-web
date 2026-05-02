import { ElementType } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
}

export function StatCard({ icon: Icon, iconBg, iconColor, label, value, valueColor }: StatCardProps) {
  return (
    <Card className="dark:bg-gray-900 dark:border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-lg font-semibold ${valueColor ?? "text-gray-900 dark:text-white"}`}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
