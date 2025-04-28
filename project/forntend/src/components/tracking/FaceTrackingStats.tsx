// src/components/tracking/FaceTrackingStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  faceTrackingService,
  FaceTrackingStatistics,
  StatisticPeriod,
} from "@/services/tracking/faceTrackingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FaceTrackingStatsProps {
  officeId: string;
}

const FaceTrackingStats: React.FC<FaceTrackingStatsProps> = ({ officeId }) => {
  const [statistics, setStatistics] = useState<{
    [key in StatisticPeriod]: FaceTrackingStatistics;
  }>({
    DAY: { totalAttempts: 0, presentAttempts: 0, presentPercentage: 0 },
    WEEK: { totalAttempts: 0, presentAttempts: 0, presentPercentage: 0 },
    MONTH: { totalAttempts: 0, presentAttempts: 0, presentPercentage: 0 },
  });
  const [selectedPeriod, setSelectedPeriod] = useState<StatisticPeriod>(
    StatisticPeriod.DAY
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      try {
        const periods = Object.values(StatisticPeriod);
        const statsPromises = periods.map((period) =>
          faceTrackingService.getUserTrackingStatistics(officeId, period)
        );

        const results = await Promise.all(statsPromises);
        const statsMap = periods.reduce((acc, period, index) => {
          acc[period] = results[index];
          return acc;
        }, {} as { [key in StatisticPeriod]: FaceTrackingStatistics });

        setStatistics(statsMap);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [officeId]);

  const currentStats = statistics[selectedPeriod];
  const chartData = [
    { name: "Total", value: currentStats.totalAttempts },
    { name: "Present", value: currentStats.presentAttempts },
  ];

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Face Tracking Statistics</CardTitle>
        <div className="flex gap-2 mt-2">
          {Object.values(StatisticPeriod).map((period) => (
            <Badge
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              onClick={() => setSelectedPeriod(period)}
              className="cursor-pointer"
            >
              {period}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 p-4 space-y-4">
          <div>
            <p className="text-sm font-medium">Total Attempts</p>
            <p className="text-2xl font-bold">{currentStats.totalAttempts}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Present Attempts</p>
            <p className="text-2xl font-bold">{currentStats.presentAttempts}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Present Percentage</p>
            <p className="text-2xl font-bold">
              {currentStats.presentPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceTrackingStats;
