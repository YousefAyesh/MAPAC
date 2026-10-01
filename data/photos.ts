export type Photo = {
  src: string
  /** Describes only what is visibly in the frame. Never asserts an event, date or name. */
  alt: string
  width: number
  height: number
}

/**
 * MAPAC's own photographs, carried over from mapacnc.com.
 *
 * Only unwatermarked images showing adults are used here. The `ZF-5026-*` banquet set on
 * the old site carries a "© The Visual Advocate" watermark, so it is third-party work
 * MAPAC would need to confirm a licence for -- and cropping the watermark out would be
 * worse, not better. One further photo (IMG_2429) shows identifiable children and a
 * readable name badge, so republishing it is MAPAC's call, not ours.
 *
 * Alt text describes what is actually visible. It deliberately does not name the event,
 * date or people, none of which could be verified from the source.
 */
export const photos = {
  forumBanner: {
    src: '/photos/community-forum-banner.jpg',
    alt: 'Six MAPAC members and guests standing together beside a MAPAC banner reading "Muslim American Public Affairs Council — United, We Make a Difference".',
    width: 1900,
    height: 1425,
  },
  conversation: {
    src: '/photos/community-conversation.jpg',
    alt: 'Attendees talking together in small groups at a MAPAC community gathering.',
    width: 1425,
    height: 1900,
  },
  meeting: {
    src: '/photos/community-meeting.jpg',
    alt: 'A speaker addressing seated attendees at a MAPAC community meeting.',
    width: 1425,
    height: 1900,
  },
} as const satisfies Record<string, Photo>
