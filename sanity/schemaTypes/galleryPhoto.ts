import { defineField, defineType } from 'sanity'

export const galleryPhoto = defineType({
  name: 'galleryPhoto',
  title: 'Gallery photo',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Description',
      type: 'string',
      description:
        'One sentence describing what is in the photo, read aloud to visitors who cannot see it. For example "Attendees seated at round tables during the annual dinner." Do not name people.',
      validation: (rule) => rule.required().min(10),
    }),
    defineField({
      name: 'group',
      title: 'Event',
      type: 'string',
      description:
        'Photos are grouped under this heading on the Gallery page, so type it exactly the same way for every photo from the same event. For example "2026 Annual Dinner".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'takenOn',
      title: 'Date of the event',
      type: 'date',
      description: 'Newer events appear higher on the Gallery page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'credit',
      title: 'Photographer credit (optional)',
      type: 'string',
    }),
  ],
  orderings: [
    { title: 'Newest event first', name: 'takenOnDesc', by: [{ field: 'takenOn', direction: 'desc' }] },
  ],
  preview: { select: { title: 'group', subtitle: 'alt', media: 'image' } },
})
