import { ArrowLeft, Download, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditableQaTable } from "@/components/EditableQaTable";
import { FileDropZone } from "@/components/FileDropZone";
import { RagChatPanel } from "@/components/RagChatPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { QuestionAnswer } from "@/types";

export function NewProcessPage() {
  const navigate = useNavigate();
  const qaSectionRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processId, setProcessId] = useState("");
  const [rows, setRows] = useState<QuestionAnswer[]>([]);
  const [busyAction, setBusyAction] = useState<"upload" | "ai" | "save" | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "upload" | "ai" | "save" | "export" | null
  >(null);

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
      window.setTimeout(() => {
        qaSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
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

  function requestConfirmation(action: NonNullable<typeof pendingAction>) {
    setPendingAction(action);
  }

  async function runConfirmedAction() {
    const action = pendingAction;
    setPendingAction(null);

    if (action === "upload") await uploadFile();
    if (action === "ai") await processWithAi();
    if (action === "save") await saveAnswers();
    if (action === "export") exportToExcel();
  }

  const confirmation = getConfirmationContent(pendingAction, file?.name);

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
          <Button
            disabled={!file || busyAction !== null}
            onClick={() => requestConfirmation("upload")}
          >
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
          <div ref={qaSectionRef} className="scroll-mt-24">
            <EditableQaTable rows={rows} onRowsChange={setRows} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              disabled={!hasQuestions || busyAction !== null}
              onClick={() => requestConfirmation("ai")}
            >
              {busyAction === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Process With AI
            </Button>
            <Button
              disabled={!canExport || busyAction !== null}
              onClick={() => requestConfirmation("save")}
            >
              {busyAction === "save" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save and Confirm
            </Button>
            <Button
              variant="outline"
              disabled={!canExport}
              onClick={() => requestConfirmation("export")}
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        confirmLabel={confirmation.confirmLabel}
        description={confirmation.description}
        isOpen={pendingAction !== null}
        isProcessing={busyAction !== null}
        onCancel={() => setPendingAction(null)}
        onConfirm={runConfirmedAction}
        title={confirmation.title}
      />
      <RagChatPanel processId={processId} questions={rows} disabled={!processId} />
    </div>
  );
}

function getConfirmationContent(
  action: "upload" | "ai" | "save" | "export" | null,
  fileName?: string
) {
  if (action === "upload") {
    return {
      confirmLabel: "Upload",
      title: "Upload workbook?",
      description: `This will upload ${fileName ?? "the selected workbook"} and identify questions from the file.`
    };
  }

  if (action === "ai") {
    return {
      confirmLabel: "Process",
      title: "Process questions with AI?",
      description:
        "This will send the current question list to the AI service and update the answer column with generated responses."
    };
  }

  if (action === "save") {
    return {
      confirmLabel: "Save",
      title: "Save and confirm answers?",
      description:
        "This will store the current questions and answers as the confirmed data for this process."
    };
  }

  if (action === "export") {
    return {
      confirmLabel: "Export",
      title: "Export answers to Excel?",
      description:
        "This will download the current question and answer table as an Excel file."
    };
  }

  return {
    confirmLabel: "Confirm",
    title: "Confirm transaction",
    description: "Please confirm this transaction before continuing."
  };
}
