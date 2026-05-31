import { ArrowLeft, Download, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { EditableQaTable } from "@/components/EditableQaTable";
import { FileDropZone } from "@/components/FileDropZone";
import { RagChatPanel } from "@/components/RagChatPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { QuestionAnswer } from "@/types";

export function NewProcessPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [processId, setProcessId] = useState("");
  const [rows, setRows] = useState<QuestionAnswer[]>([]);
  const [busyAction, setBusyAction] = useState<"upload" | "ai" | "save" | null>(null);

  const hasQuestions = rows.some((row) => row.question.trim());
  const canExport = useMemo(
    () => rows.some((row) => row.question.trim() || row.answer.trim()),
    [rows]
  );

  async function uploadFile() {
    if (!file) return;
    setBusyAction("upload");

    try {
      const response = await api.uploadExcel(file);
      setProcessId(response.processId);
      setRows(response.questions);
      toast.success("Questions identified from the workbook.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setBusyAction(null);
    }
  }

  async function processWithAi() {
    setBusyAction("ai");

    try {
      const response = await api.processWithAi(processId, rows);
      setRows(response.questions);
      toast.success("AI answers generated. Review and edit before saving.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "AI processing failed");
    } finally {
      setBusyAction(null);
    }
  }

  async function saveAnswers() {
    setBusyAction("save");

    try {
      await api.saveAnswers(processId, rows);
      toast.success("Answers saved and confirmed.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Save failed");
    } finally {
      setBusyAction(null);
    }
  }

  function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        ID: row.id,
        Question: row.question,
        Answer: row.answer
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Q&A");
    XLSX.writeFile(workbook, `${processId || "ai-excel-qa"}-answers.xlsx`);
    toast.success("Excel export started.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Button variant="ghost" className="mb-2 px-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal">New Excel process</h1>
          <p className="text-sm text-muted-foreground">
            Upload a workbook, confirm questions, generate answers, and export the final table.
          </p>
        </div>
        {processId && (
          <div className="rounded-md border bg-card px-4 py-2 text-sm">
            Process ID: <span className="font-semibold">{processId}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workbook upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileDropZone selectedFile={file} onFileChange={setFile} />
          <Button disabled={!file || busyAction !== null} onClick={uploadFile}>
            {busyAction === "upload" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <>
          <EditableQaTable rows={rows} onRowsChange={setRows} />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              disabled={!hasQuestions || busyAction !== null}
              onClick={processWithAi}
            >
              {busyAction === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Process With AI
            </Button>
            <Button disabled={!canExport || busyAction !== null} onClick={saveAnswers}>
              {busyAction === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save and Confirm
            </Button>
            <Button variant="outline" disabled={!canExport} onClick={exportToExcel}>
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </>
      )}

      <RagChatPanel processId={processId} questions={rows} disabled={!processId} />
    </div>
  );
}
