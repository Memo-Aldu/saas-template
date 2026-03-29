"use client";

import { Bar, BarChart, Pie, PieChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@saas-template/ui";

const trafficData = [
  { month: "Jan", desktop: 210, mobile: 82 },
  { month: "Feb", desktop: 305, mobile: 210 },
  { month: "Mar", desktop: 260, mobile: 120 },
  { month: "Apr", desktop: 97, mobile: 198 },
  { month: "May", desktop: 221, mobile: 133 },
  { month: "Jun", desktop: 229, mobile: 142 },
];

const browserData = [
  { name: "Chrome", value: 385, fill: "#f7b966" },
  { name: "Safari", value: 202, fill: "#ff8b1a" },
  { name: "Firefox", value: 198, fill: "#ff6d00" },
  { name: "Edge", value: 150, fill: "#dd5300" },
];

const trafficConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-3)" },
} satisfies ChartConfig;

const browserConfig = {
  chrome: { label: "Chrome", color: "#f7b966" },
  safari: { label: "Safari", color: "#ff8b1a" },
  firefox: { label: "Firefox", color: "#ff6d00" },
  edge: { label: "Edge", color: "#dd5300" },
} satisfies ChartConfig;

export function TrafficChannelsChart() {
  return (
    <ChartContainer config={trafficConfig} className="h-[240px] w-full">
      <BarChart data={trafficData} barGap={6}>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="desktop"
          radius={[4, 4, 0, 0]}
          fill="var(--color-desktop)"
        />
        <Bar
          dataKey="mobile"
          radius={[4, 4, 0, 0]}
          fill="var(--color-mobile)"
        />
      </BarChart>
    </ChartContainer>
  );
}

export function BrowserShareChart() {
  const total = browserData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="space-y-4">
      <ChartContainer
        config={browserConfig}
        className="mx-auto h-[220px] max-w-[300px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
          <Pie
            data={browserData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={75}
            strokeWidth={0}
          />
        </PieChart>
      </ChartContainer>
      <div className="text-center">
        <p className="text-4xl font-semibold tracking-tight">{total}</p>
        <p className="text-sm text-muted-foreground">Visitors</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {browserData.map((item) => (
          <div key={item.name} className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: item.fill }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
