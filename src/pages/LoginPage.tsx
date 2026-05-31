import { Bot, Loader2, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { setAuth } from "@/state/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("analyst@example.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const auth = await api.login(email, password);
      setAuth(auth);
      navigate("/transactions");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_480px]">
      <section className="hidden bg-[linear-gradient(135deg,#0f766e_0%,#14532d_52%,#f59e0b_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
            <Bot className="h-6 w-6" />
          </span>
          <span className="text-lg font-semibold">AI Excel Q&A Agent</span>
        </div>
        <div className="max-w-2xl">
          <h1 className="text-5xl font-semibold tracking-normal">
            Review workbook questions and answers with AI support.
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Upload processed spreadsheets, confirm generated answers, and export
            validated Q&A data back to Excel.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your workspace account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Password</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </label>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
