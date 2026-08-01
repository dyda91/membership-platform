interface LockedMediaProps {
  tierName?: string | null
}

export default function LockedMedia({ tierName }: LockedMediaProps) {
  return (
    <div className="flex h-48 flex-col items-center justify-center rounded bg-gray-100 text-center">
      <span className="text-3xl" aria-hidden="true">
        🔒
      </span>

      <p className="mt-2 text-sm font-medium text-gray-700">
        Conteúdo exclusivo
      </p>

      {tierName && (
        <p className="mt-1 text-xs text-gray-500">
          Disponível para o tier {tierName}
        </p>
      )}
    </div>
  )
}
