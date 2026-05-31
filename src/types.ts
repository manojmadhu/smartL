export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type ProcessedFile = {
  id: string;
  fileName: string;
  status: "Completed" | "In Review" | "Failed";
  questions: number;
  processedAt: string;
  owner: string;
};

export type QuestionAnswer = {
  id: string;
  question: string;
  answer: string;
};

export type ProcessDetail = {
  file: ProcessedFile;
  questions: QuestionAnswer[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type RagChatRequest = {
  processId: string;
  message: string;
  history: Pick<ChatMessage, "role" | "content">[];
  context: {
    questions: QuestionAnswer[];
  };
};

export type RagChatResponse = {
  answer: string;
};
