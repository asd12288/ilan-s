"use server";

import { redirect } from "next/navigation";

import { passwordsMatch } from "./password";
import { clearSessionCookie, setSessionCookie } from "./session";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const configuredPassword = process.env.APP_PASSWORD;
  if (!configuredPassword) throw new Error("APP_PASSWORD is required");

  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    !passwordsMatch(password, configuredPassword)
  ) {
    return { error: "סיסמה שגויה" };
  }

  await setSessionCookie();
  redirect("/");
}

export async function logoutAction(): Promise<never> {
  await clearSessionCookie();
  redirect("/login");
}
