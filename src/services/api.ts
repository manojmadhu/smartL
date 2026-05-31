import { getAuthToken } from "@/state/auth";
import type {
  LoginResponse,
  RagChatRequest,
  RagChatResponse,
  ProcessDetail,
  ProcessedFile,
  QuestionAnswer
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const RAG_CHAT_PATH = import.meta.env.VITE_RAG_CHAT_PATH ?? "/chat/rag";
const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== "false";

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function withMockFallback<T>(
  request: () => Promise<T>,
  fallback: () => Promise<T>
) {
  if (!ENABLE_MOCKS) return request();

  try {
    return await request();
  } catch {
    return fallback();
  }
}

const wait = (ms = 450) => new Promise((resolve) => window.setTimeout(resolve, ms));

const mockProcessedFiles = [
  {
    id: "PR-1042",
    fileName: "regional-sales-q1.xlsx",
    status: "Completed",
    questions: 8,
    processedAt: "2026-05-30T11:24:00.000Z",
    owner: "Demo Analyst"
  },
  {
    id: "PR-1041",
    fileName: "inventory-aging.xlsx",
    status: "In Review",
    questions: 5,
    processedAt: "2026-05-29T15:10:00.000Z",
    owner: "Finance Ops"
  }
] satisfies ProcessedFile[];

const mockQuestions = [
  {
    id: "1",
    question: "What are the top revenue categories in this workbook?",
    answer: "Software subscriptions, implementation services, and renewals are the top categories."
  },
  {
    id: "2",
    question: "Which rows contain missing or inconsistent values?",
    answer: "Rows with blank region values and negative quantity counts should be reviewed."
  },
  {
    id: "3",
    question: "What trends are visible across the latest reporting period?",
    answer: "Revenue increased month over month while support costs remained mostly stable."
  }
] satisfies QuestionAnswer[];

export const api = {
  login(email: string, password: string) {
    return withMockFallback(
      () =>
        apiRequest<LoginResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        }),
      async () => {
        await wait();
        return {
          token: "local-demo-token",
          user: {
            id: "usr-demo",
            name: "Demo Analyst",
            email
          }
        };
      }
    );
  },

  listProcessedFiles() {
    return withMockFallback(
      () => apiRequest<ProcessedFile[]>("/excel/processes"),
      async () => {
        await wait(250);
        return mockProcessedFiles;
      }
    );
  },

  getProcessDetail(processId: string) {
    return withMockFallback(
      () => apiRequest<ProcessDetail>(`/excel/processes/${processId}`),
      async () => {
        await wait(250);
        const file =
          mockProcessedFiles.find((item) => item.id === processId) ??
          mockProcessedFiles[0];

        return {
          file: {
            ...file,
            id: processId
          },
          questions: mockQuestions.map((question, index) => ({
            ...question,
            id: String(index + 1)
          }))
        };
      }
    );
  },

  uploadExcel(file: File) {
    const data = new FormData();
    data.append("file", file);

    return withMockFallback(
      () =>
        apiRequest<{ processId: string; questions: QuestionAnswer[] }>(
          "/excel/analyze",
          {
            method: "POST",
            body: data
          }
        ),
      async () => {
        await wait(700);
        return {
          processId: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
          questions: [
            {
              id: "1",
              question: "What are the top revenue categories in this workbook?",
              answer: ""
            },
            {
              id: "2",
              question: "Which rows contain missing or inconsistent values?",
              answer: ""
            },
            {
              id: "3",
              question: "What trends are visible across the latest reporting period?",
              answer: ""
            }
          ]
        };
      }
    );
  },

  processWithAi(processId: string, questions: QuestionAnswer[]) {
    return withMockFallback(
      () =>
        apiRequest<{ questions: QuestionAnswer[] }>("/excel/process-ai", {
          method: "POST",
          body: JSON.stringify({ processId, questions })
        }),
      async () => {
        await wait(850);
        return {
          questions: questions.map((row) => ({
            ...row,
            answer:
              row.answer ||
              "AI-generated answer placeholder. Replace this after connecting the backend response."
          }))
        };
      }
    );
  },

  saveAnswers(processId: string, questions: QuestionAnswer[]) {
    return withMockFallback(
      () =>
        apiRequest<{ saved: boolean; processId: string }>("/excel/save", {
          method: "POST",
          body: JSON.stringify({ processId, questions })
        }),
      async () => {
        await wait(350);
        return { saved: true, processId };
      }
    );
  },

  ragChat(request: RagChatRequest) {
    return withMockFallback(
      () =>
        apiRequest<RagChatResponse>(RAG_CHAT_PATH, {
          method: "POST",
          body: JSON.stringify(request)
        }),
      async () => {
        await wait(650);
        const matchedQuestion = request.context.questions.find((row) =>
          request.message
            .toLowerCase()
            .split(/\s+/)
            .some((word) => word.length > 4 && row.question.toLowerCase().includes(word))
        );

        return {
          answer: matchedQuestion?.answer
            ? `Based on process ${request.processId}, ${matchedQuestion.answer}`
            : `I checked the available workbook context for process ${request.processId}. Connect your RAG API to return grounded answers from the uploaded Excel content.`
        };
      }
    );
  }
};
