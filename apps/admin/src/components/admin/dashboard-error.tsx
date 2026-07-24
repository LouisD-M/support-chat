type DashboardErrorProps = {
  message: string;
  onClose: () => void;
};

export function DashboardError({
  message,
  onClose,
}: DashboardErrorProps) {
  return (
    <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <p>{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 font-semibold text-red-500 hover:text-red-700"
          aria-label="Fermer le message d’erreur"
        >
          ×
        </button>
      </div>
    </div>
  );
}