import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function extractError(error: unknown): string {
  const err = error as { response?: { data?: unknown } }
  const data = err.response?.data
  if (typeof data === 'string') return data.slice(0, 200)
  if (data && typeof data === 'object') {
    const campos = data as Record<string, unknown>
    if (typeof campos.detail === 'string') return campos.detail
    for (const value of Object.values(campos)) {
      if (typeof value === 'string') return value
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
    }
  }
  return 'Ocurrió un error. Intenta de nuevo.'
}

export function getContext() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Mutaciones que muestran su propio error inline pueden silenciar el toast
        if (mutation.options.meta?.silentError) return
        toast.error(extractError(error))
      },
    }),
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
