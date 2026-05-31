import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionAnswer } from "@/types";

type EditableQaTableProps = {
  rows: QuestionAnswer[];
  onRowsChange: (rows: QuestionAnswer[]) => void;
};

function renumberRows(rows: QuestionAnswer[]) {
  return rows.map((row, index) => ({
    ...row,
    id: String(index + 1)
  }));
}

export function EditableQaTable({ rows, onRowsChange }: EditableQaTableProps) {
  function updateRow(id: string, field: keyof QuestionAnswer, value: string) {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    onRowsChange(renumberRows([
      ...rows,
      {
        id: "",
        question: "",
        answer: ""
      }
    ]));
  }

  function removeRow(id: string) {
    onRowsChange(renumberRows(rows.filter((row) => row.id !== id)));
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="font-semibold">Questions and answers</h2>
          <p className="text-sm text-muted-foreground">
            Edit identified questions, add new ones, and review AI answers.
          </p>
        </div>
        <Button variant="outline" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead className="min-w-80">Question</TableHead>
            <TableHead className="min-w-96">Answer</TableHead>
            <TableHead className="w-16 text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>
                <Textarea
                  value={row.question}
                  onChange={(event) => updateRow(row.id, "question", event.target.value)}
                  placeholder="Enter question"
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={row.answer}
                  onChange={(event) => updateRow(row.id, "answer", event.target.value)}
                  placeholder="AI answer will appear here"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  className="h-9 w-9 px-0 text-destructive"
                  aria-label={`Delete question ${row.id}`}
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
