import { FileSpreadsheet, FolderOpen, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, isExcelFile } from "@/lib/utils";

type FileDropZoneProps = {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
};

export function FileDropZone({ selectedFile, onFileChange }: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function acceptFileList(files: FileList | null) {
    if (!files?.length) return;

    const excelFile = Array.from(files).find(isExcelFile);
    if (!excelFile) {
      onFileChange(null);
      toast.error("Choose an Excel or CSV file.");
      return;
    }

    onFileChange(excelFile);
    toast.success(`${excelFile.name} selected.`);
  }

  return (
    <div>
      <div
        className={cn(
          "flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center transition-colors",
          isDragging && "border-primary bg-primary/5"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          acceptFileList(event.dataTransfer.files);
        }}
      >
        <UploadCloud className="mb-4 h-10 w-10 text-primary" />
        <h2 className="text-lg font-semibold">Drop an Excel file here</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Select a workbook from your PC, drag it into this area, or scan a directory
          for the first supported Excel file.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4" />
            Select File
          </Button>
          <Button variant="outline" onClick={() => directoryInputRef.current?.click()}>
            <FolderOpen className="h-4 w-4" />
            Select Directory
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.xlsm,.csv"
          onChange={(event) => acceptFileList(event.target.files)}
        />
        <input
          ref={directoryInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.xlsm,.csv"
          multiple
          // Browser-supported directory picking attributes.
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
          onChange={(event) => acceptFileList(event.target.files)}
        />
      </div>

      {selectedFile && (
        <div className="mt-4 rounded-md border bg-secondary px-4 py-3 text-sm">
          Selected: <span className="font-medium">{selectedFile.name}</span>
        </div>
      )}
    </div>
  );
}
