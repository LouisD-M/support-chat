type ChatErrorProps = {
  message: string;
  fullPage?: boolean;
  onRetry?: () => void;
};

export function ChatError({
  message,
  fullPage = false,
  onRetry,
}: ChatErrorProps) {
  if (!fullPage) {
    return (
      <div className="mx-auto mb-3 max-w-2xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
        {message}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-950">
          Support indisponible
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Réessayer
          </button>
        )}
      </div>
    </main>
  );
}