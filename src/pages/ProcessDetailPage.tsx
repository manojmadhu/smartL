import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { RagChatPanel } from "@/components/RagChatPanel";
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
import type { ProcessDetail } from "@/types";

export function ProcessDetailPage() {
  const navigate = useNavigate();
  const { processId = "" } = useParams();
  const [detail, setDetail] = useState<ProcessDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .getProcessDetail(processId)
      .then((response) => {
        if (isMounted) setDetail(response);
      })
      .catch((caught) => {
        if (isMounted) {
          toast.error(caught instanceof Error ? caught.message : "Could not load details");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [processId]);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" className="mb-2 px-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold tracking-normal">Process details</h1>
        <p className="text-sm text-muted-foreground">
          Review the identified questions and confirmed answers.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex h-48 items-center justify-center pt-6 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading process details
          </CardContent>
        </Card>
      ) : detail ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{detail.file.id}</CardTitle>
              <CardDescription>{detail.file.fileName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={detail.file.status} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Questions</p>
                  <p className="mt-1 font-medium">{detail.questions.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Processed At</p>
                  <p className="mt-1 font-medium">
                    {formatDateTime(detail.file.processedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="mt-1 font-medium">{detail.file.owner}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question and answer list</CardTitle>
              <CardDescription>Final answers captured for this process.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead className="min-w-80">Question</TableHead>
                    <TableHead className="min-w-96">Answer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.questions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell>{row.question}</TableCell>
                      <TableCell>{row.answer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <RagChatPanel processId={detail.file.id} questions={detail.questions} />
        </>
      ) : null}
    </div>
  );
}
