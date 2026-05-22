import { Card, CardContent, Skeleton } from "@devhop/ui";
import { cn } from "@devhop/ui";
import type { LucideIcon } from "lucide-react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string }; // +/- % vs yesterday
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = trend && trend.value >= 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight truncate">
              {value}
            </p>
            {trend && (
              <div className="mt-1 flex items-center gap-1">
                {isPositive ? (
                  <TrendingUpIcon className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <TrendingDownIcon className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-green-600" : "text-red-600",
                  )}
                >
                  {isPositive ? "+" : ""}
                  {trend.value.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
            {subtitle && !trend && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10",
              iconColor,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
