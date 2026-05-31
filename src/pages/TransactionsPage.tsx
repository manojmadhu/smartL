import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
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

export function TransactionsPage() {
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
          toast.error(caught instanceof Error ? caught.message : "Could not load files");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Processed Excel files</h1>
          <p className="text-sm text-muted-foreground">
            View completed workbook runs and begin a new AI Q&A process.
          </p>
        </div>
        <Button onClick={() => navigate("/process/new")}>
          <Plus className="h-4 w-4" />
          New Process
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Recent workbook processing history.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading files
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process ID</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Processed At</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
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
                    <TableCell>{file.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
