import { Card } from '@/components/ui/Card'
import { content } from '@/lib/content'

export async function ResearchResources() {
  const categories = await content.getResearchCategories()

  return (
    <ol className="mt-8 grid gap-5 md:grid-cols-2">
      {categories.map((category, i) => (
        <li key={category.id}>
          <Card className="h-full">
            <h3 className="text-base">
              <span aria-hidden="true" className="mr-2 font-serif text-crimson">
                {String(i + 1).padStart(2, '0')}
              </span>
              {category.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{category.description}</p>
            {category.links.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {category.links.map((link) => (
                  <li key={link.label}>
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-crimson-deep underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span className="text-sm">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </li>
      ))}
    </ol>
  )
}
