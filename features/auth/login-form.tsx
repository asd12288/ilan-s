"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { loginAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "מתחבר…" : "כניסה"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="w-full">
      <FieldGroup>
        <Field data-invalid={Boolean(state?.error)}>
          <FieldLabel htmlFor="password">סיסמה</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={Boolean(state?.error)}
          />
          <FieldError>{state?.error}</FieldError>
        </Field>
        <SubmitButton />
      </FieldGroup>
    </form>
  );
}
