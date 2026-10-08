import { defineField, defineType } from 'sanity'

export const endorsement = defineType({
  name: 'endorsement',
  title: 'Endorsement',
  type: 'document',
  fields: [
    defineField({
      name: 'candidate',
      title: 'Candidate',
      type: 'string',
      description: 'Full name as it should appear on the site.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'office',
      title: 'Office',
      type: 'string',
      description: 'For example "NC House, District 34" or "Wake County Board of Education".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cycle',
      title: 'Election',
      type: 'string',
      description:
        'Endorsements are grouped under this heading, so type it exactly the same way for every candidate in the same election. For example "November 2026 General".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date announced',
      type: 'date',
      description: 'Newest endorsements are listed first.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statementUrl',
      title: 'Statement link (optional)',
      type: 'url',
      description: 'A link to MAPAC’s announcement or statement, if there is one.',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'candidate', subtitle: 'office' } },
})
