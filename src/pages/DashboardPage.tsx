import {
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Plus,
  Sparkles
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { api } from "@/services/api";
import type { ProcessedFile } from "@/types";

export function DashboardPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .listProcessedFiles()
      .then((items) => {
        if (isMounted) setFiles(items);
      })
      .catch((caught) => {
        if (isMounted) {
          toast.error(caught instanceof Error ? caught.message : "Could not load dashboard");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const completed = files.filter((file) => file.status === "Completed").length;
    const inReview = files.filter((file) => file.status === "In Review").length;
    const failed = files.filter((file) => file.status === "Failed").length;
    const questions = files.reduce((sum, file) => sum + file.questions, 0);

    return {
      completed,
      failed,
      inReview,
      questions,
      totalFiles: files.length
    };
  }, [files]);

  const recentFiles = files.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of Excel Q&A processing activity and portal usage.
          </p>
        </div>
        <Button onClick={() => navigate("/process/new")}>
          <Plus className="h-4 w-4" />
          New Process
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex h-48 items-center justify-center pt-6 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading dashboard
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              description="Processed workbooks"
              icon={FileSpreadsheet}
              label="Total files"
              value={metrics.totalFiles}
            />
            <MetricCard
              description="Confirmed output"
              icon={CheckCircle2}
              label="Completed"
              value={metrics.completed}
            />
            <MetricCard
              description="Generated and reviewed"
              icon={Sparkles}
              label="Questions"
              value={metrics.questions}
            />
            <MetricCard
              description={`${metrics.inReview} in review, ${metrics.failed} failed`}
              icon={ArrowUpRight}
              label="Active review"
              value={metrics.inReview + metrics.failed}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest processed Excel files.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Process ID</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Processed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <button
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            onClick={() => navigate(`/transactions/${file.id}`)}
                          >
                            {file.id}
                          </button>
                        </TableCell>
                        <TableCell>{file.fileName}</TableCell>
                        <TableCell>
                          <StatusBadge status={file.status} />
                        </TableCell>
                        <TableCell>{file.questions}</TableCell>
                        <TableCell>{formatDateTime(file.processedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage summary</CardTitle>
                <CardDescription>Current portal workload.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <SummaryRow label="Completion rate" value={completionRate(metrics)} />
                <SummaryRow label="Average questions/file" value={averageQuestions(metrics)} />
                <SummaryRow label="Files in review" value={String(metrics.inReview)} />
                <SummaryRow label="Failed runs" value={String(metrics.failed)} />
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => navigate("/transactions")}
                >
                  View Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

type MetricCardProps = {
  description: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
};

function MetricCard({ description, icon: Icon, label, value }: MetricCardProps) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function completionRate(metrics: { completed: number; totalFiles: number }) {
  if (!metrics.totalFiles) return "0%";
  return `${Math.round((metrics.completed / metrics.totalFiles) * 100)}%`;
}

function averageQuestions(metrics: { questions: number; totalFiles: number }) {
  if (!metrics.totalFiles) return "0";
  return (metrics.questions / metrics.totalFiles).toFixed(1);
}
