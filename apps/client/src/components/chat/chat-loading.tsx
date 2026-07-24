export function ChatLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm font-medium text-slate-600">
          Ouverture du support…
        </p>
      </div>
    </main>
  );
}