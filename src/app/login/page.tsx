'use client';

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending} variant="cyber">
      {pending ? "AUTHENTICATING..." : "ACCESS CONTROL TOWER"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 p-4">
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <Card className="z-10 w-full max-w-md border-cyan-500/30 bg-navy-900/80 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/50">
            <Shield className="h-6 w-6 text-cyan-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            ONYX COMMAND NODE
          </CardTitle>
          <CardDescription className="text-slate-400">
            Restricted Access. Authorized Personnel Only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p>{state.error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="operative@onyx.dev"
                required
                className="border-slate-700 bg-navy-950/50 text-white focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="border-slate-700 bg-navy-950/50 text-white focus:border-cyan-500"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-slate-500">
          <p className="w-full">
            Unauthorized access attempts will be logged and reported.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
