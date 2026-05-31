import { Mail, ShieldCheck, UserCircle2 } from "lucide-react";
import type { ComponentType } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAuth } from "@/state/auth";

export function ProfilePage() {
  const { auth } = useAuth();
  const initials =
    auth?.user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">User profile</h1>
        <p className="text-sm text-muted-foreground">
          Account information for the current portal session.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-secondary text-2xl font-semibold">
              {initials}
            </div>
            <CardTitle>{auth?.user.name}</CardTitle>
            <CardDescription>{auth?.user.email}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Basic identity and access information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <ProfileRow
              icon={UserCircle2}
              label="User ID"
              value={auth?.user.id ?? "Unavailable"}
            />
            <ProfileRow
              icon={Mail}
              label="Email"
              value={auth?.user.email ?? "Unavailable"}
            />
            <ProfileRow icon={ShieldCheck} label="Role" value="Excel Q&A Analyst" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type ProfileRowProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function ProfileRow({ icon: Icon, label, value }: ProfileRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
