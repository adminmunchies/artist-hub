import { loginAction } from "@/app/login/actions";

export default function LoginInline({ className = "" }: { className?: string }) {
  return (
    <form action={loginAction} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <input
        type="hidden"
        name="next"
        value="/dashboard"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className="border rounded-md px-3 py-2 text-sm w-full sm:w-56"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className="border rounded-md px-3 py-2 text-sm w-full sm:w-40"
      />
      <button
        type="submit"
        className="rounded-full border px-4 py-2 text-sm"
      >
        Sign in
      </button>
    </form>
  );
}
