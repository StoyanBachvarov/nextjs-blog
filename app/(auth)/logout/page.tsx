import { logoutAction } from "@/actions/auth";

export const dynamic = "force-static";

export default function LogoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 px-5 py-12">
      <section className="w-full rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">Log out</h1>
        <p className="mt-2 text-zinc-600">
          End your session on this browser.
        </p>
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-lg bg-zinc-950 hover:bg-zinc-800 transition-colors px-5 py-3 font-semibold text-white w-full sm:w-auto"
          >
            Log out
          </button>
        </form>
      </section>
    </div>
  );
}