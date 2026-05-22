import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Skeleton,
  type ChartConfig,
} from "@devhop/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface Props {
  data: { date: string; revenue: string; count: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  revenue: {
    label: "ຍອດຂາຍ",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("lo-LA", { month: "short", day: "numeric" });
}

function formatRevenue(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export function RevenueChart({ data, isLoading }: Props) {
  const chartData = data.map((d) => ({
    date: d.date,
    label: formatDateLabel(d.date),
    revenue: Number(d.revenue),
    count: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ຍອດຂາຍ 7 ວັນລ່າສຸດ</CardTitle>
        <CardDescription>ຍອດລວມຄຳສັ່ງຊື້ທຸກສະຖານະ</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={formatRevenue}
                width={44}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `${Number(value).toLocaleString("lo-LA")} ກີບ`
                    }
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
