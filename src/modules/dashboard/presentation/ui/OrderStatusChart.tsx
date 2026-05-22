import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Skeleton,
  type ChartConfig,
} from "@devhop/ui";
import { Cell, Pie, PieChart } from "recharts";

interface Props {
  data: { status: string; count: number }[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--chart-1)",
  CONFIRMED: "var(--chart-2)",
  PROCESSING: "var(--chart-3)",
  SHIPPED: "var(--chart-4)",
  DELIVERED: "var(--chart-5)",
  CANCELLED: "#ef4444",
  REFUNDED: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ລໍຖ້າ",
  CONFIRMED: "ຢືນຢັນ",
  PROCESSING: "ດຳເນີນ",
  SHIPPED: "ຈັດສົ່ງ",
  DELIVERED: "ສົ່ງຮອດ",
  CANCELLED: "ຍົກເລີກ",
  REFUNDED: "ຄືນເງິນ",
};

export function OrderStatusChart({ data, isLoading }: Props) {
  const chartConfig = Object.fromEntries(
    data.map((d) => [
      d.status,
      {
        label: STATUS_LABELS[d.status] ?? d.status,
        color: STATUS_COLORS[d.status] ?? "#94a3b8",
      },
    ]),
  ) satisfies ChartConfig;

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ສຳຫຼວດຄຳສັ່ງຊື້</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
        ) : total === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            ຍັງບໍ່ມີຄຳສັ່ງຊື້
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="status"
                    formatter={(value, name) =>
                      `${STATUS_LABELS[name as string] ?? name}: ${value} ລາຍການ`
                    }
                  />
                }
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                wrapperStyle={{ paddingTop: "8px", fontSize: "11px" }}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
