import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isExcelFile(file: File) {
  const excelExtensions = [".xlsx", ".xls", ".xlsm", ".csv"];
  return excelExtensions.some((extension) =>
    file.name.toLowerCase().endsWith(extension)
  );
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
