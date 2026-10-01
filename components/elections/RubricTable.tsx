import type { Rubric } from '@/lib/content/types'

export function RubricTable({ rubric }: { rubric: Rubric }) {
  const total = rubric.rows.reduce((sum, row) => sum + row.weight * 5, 0)

  return (
    <div>
      <h3 className="text-lg">{rubric.office}</h3>
      <div
        className="mt-3 overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={`Scoring rubric for ${rubric.office}, scrollable`}
      >
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Scoring rubric for {rubric.office}: weight factor and percentage points per criterion.
          </caption>
          <thead>
            <tr className="border-b border-navy text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-navy">
                Evaluation criterion
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-navy">
                Most favorable score
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-navy">
                Weight factor
              </th>
              <th scope="col" className="py-2 text-right font-semibold text-navy">
                Percentage points
              </th>
            </tr>
          </thead>
          <tbody>
            {rubric.rows.map((row) => (
              <tr key={row.criterion} className="border-b border-border-subtle">
                <th scope="row" className="py-2 pr-4 text-left font-normal">
                  {row.criterion}
                </th>
                <td className="py-2 pr-4 text-right">5</td>
                <td className="py-2 pr-4 text-right">{row.weight}</td>
                <td className="py-2 text-right">{row.weight * 5}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="py-2 pr-4 text-right font-semibold text-navy">
                Total possible points
              </th>
              <td className="py-2 text-right font-semibold text-navy">{total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
