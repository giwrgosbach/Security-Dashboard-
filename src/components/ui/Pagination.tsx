import { useSearchParams } from 'react-router-dom'

interface PaginationProps {
  page: number
  totalPages: number
}

// Like EventFilters, this writes its state (the page number) to the URL.
export default function Pagination({ page, totalPages }: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  function goTo(target: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(target))
    setSearchParams(next, { replace: true })
  }

  const btn =
    'rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 ' +
    'disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button type="button" onClick={() => goTo(page - 1)} disabled={page <= 1} className={btn}>
          Previous
        </button>
        <button type="button" onClick={() => goTo(page + 1)} disabled={page >= totalPages} className={btn}>
          Next
        </button>
      </div>
    </div>
  )
}
