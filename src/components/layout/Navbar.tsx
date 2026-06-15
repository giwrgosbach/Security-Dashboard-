import { Show , SignInButton, UserButton } from "@clerk/react"


export default function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <span className="text-sm font-medium text-slate-500">
        Security Operations Dashboard
      </span>

      {/* user menu + dark-mode toggle will live here (Day 4 / Day 8) */}


      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
              Sign in
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}
