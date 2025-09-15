import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Calendar, CalendarDays, Tag } from "lucide-react";
import { type Category } from "@shared/schema";

interface StatsCardsProps {}

export function StatsCards({}: StatsCardsProps) {
  const { data: summary, isLoading } = useQuery<{
    total: number;
    monthly: number;
    weekly: number;
  }>({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Expenses",
      value: summary ? formatCurrency(summary.total) : "$0.00",
      icon: TrendingDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "+12.5%",
      changeText: "from last month",
      changeColor: "text-red-600",
      testId: "stat-total-expenses",
    },
    {
      title: "This Month",
      value: summary ? formatCurrency(summary.monthly) : "$0.00",
      icon: Calendar,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "-8.2%",
      changeText: "from last month",
      changeColor: "text-green-600",
      testId: "stat-monthly-expenses",
    },
    {
      title: "This Week",
      value: summary ? formatCurrency(summary.weekly) : "$0.00",
      icon: CalendarDays,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "-15.3%",
      changeText: "from last week",
      changeColor: "text-green-600",
      testId: "stat-weekly-expenses",
    },
    {
      title: "Categories",
      value: categories ? categories.length.toString() : "0",
      icon: Tag,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "Active",
      changeText: "tracking system",
      changeColor: "text-blue-600",
      testId: "stat-categories",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <p
                    className="text-2xl font-bold text-foreground mt-1"
                    data-testid={stat.testId}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`${stat.changeColor} font-medium`}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">{stat.changeText}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
