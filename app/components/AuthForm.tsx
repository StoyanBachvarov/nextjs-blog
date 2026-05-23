"use client";

import Link from "next/link";
import { useActionState } from "react";

export type ActionState = {
  error?: string;
  success?: boolean;
};

type AuthFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  buttonLabel: string;
  footerHref: string;
  footerLabel: string;
  footerText: string;
};

export function AuthForm({
  action,
  buttonLabel,
  footerHref,
  footerLabel,
  footerText,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Password</span>
        <input
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        />
      </label>

      {state?.error && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {pending ? "Loading..." : buttonLabel}
      </button>

      <div className="text-center text-sm mt-4 text-zinc-600">
        {footerText}{" "}
        <Link href={footerHref} className="font-medium text-indigo-600 hover:text-indigo-500">
          {footerLabel}
        </Link>
      </div>
    </form>
  );
}