import type { Photo } from '@/lib/content/types'

/**
 * MAPAC's photographs, carried over from mapacnc.com. MAPAC took these and granted
 * permission to use them.
 *
 * The `dinner-*` images carry a "© The Visual Advocate" credit line burned into the
 * frame. It is left intact deliberately: permission to use a photograph is not
 * permission to remove its credit, and cropping it would also cut into the composition.
 *
 * Alt text describes only what is visibly in the frame, plus the event where the podium
 * placard in the photographs themselves identifies it ("MAPAC 9th Annual Dinner", on an
 * N.C. State University lectern). It names no individual, since no caption on the source
 * site identified anyone.
 */

const dinner = (
  id: string,
  src: string,
  alt: string,
  width: number,
  height: number,
): Photo => ({ id, src, alt, width, height, group: 'Annual dinner' })

export const photos = {
  // --- 2024 community forum (MAPAC's own photographs, no credit line) ---
  forumBanner: {
    id: 'forum-banner',
    src: '/photos/community-forum-banner.jpg',
    alt: 'Six MAPAC members and guests standing together beside a MAPAC banner reading "Muslim American Public Affairs Council — United, We Make a Difference".',
    width: 1900,
    height: 1425,
    group: 'Community forum',
  },
  conversation: {
    id: 'forum-conversation',
    src: '/photos/community-conversation.jpg',
    alt: 'Attendees talking together in small groups at a MAPAC community forum.',
    width: 1425,
    height: 1900,
    group: 'Community forum',
  },
  meeting: {
    id: 'forum-discussion',
    src: '/photos/community-meeting.jpg',
    alt: 'A speaker addressing seated attendees at a MAPAC community forum.',
    width: 1425,
    height: 1900,
    group: 'Community forum',
  },
  families: {
    id: 'forum-families',
    src: '/photos/forum-families.jpg',
    alt: 'Families seated together at a table during a MAPAC community forum.',
    width: 1900,
    height: 1425,
    group: 'Community forum',
  },

  // --- Strategy session ---
  planning: {
    id: 'planning-session',
    src: '/photos/planning-session.jpg',
    alt: 'Eight MAPAC members standing together in front of a hand-drawn priorities chart after a planning session.',
    width: 1900,
    height: 1425,
    group: 'Planning',
  },

  // --- MAPAC 9th Annual Dinner, N.C. State University ---
  dinnerHallFlags: dinner(
    'dinner-hall-flags',
    '/photos/dinner-hall-flags.jpg',
    'Guests seated at round tables facing a speaker at a lectern, with a MAPAC sign and the United States and North Carolina flags behind the stage.',
    1224,
    816,
  ),
  dinnerHallWide: dinner(
    'dinner-hall-wide',
    '/photos/dinner-hall-wide.jpg',
    'A wide view of a full banquet hall at the MAPAC annual dinner, with a speaker at the lectern.',
    1224,
    816,
  ),
  dinnerKeynote: dinner(
    'dinner-keynote',
    '/photos/dinner-keynote.jpg',
    'A speaker delivering remarks from an N.C. State University lectern beneath a MAPAC sign, with a placard reading "MAPAC 9th Annual Dinner".',
    1137,
    879,
  ),
  dinnerPodiumRemarks: dinner(
    'dinner-podium-remarks',
    '/photos/dinner-podium-remarks.jpg',
    'A speaker at the lectern reading from notes at the MAPAC annual dinner, with another participant seated beside the stage.',
    1137,
    879,
  ),
  dinnerStageRemarks: dinner(
    'dinner-stage-remarks',
    '/photos/dinner-stage-remarks.jpg',
    'A speaker gesturing while addressing the room from the lectern, with two other participants on stage.',
    1224,
    816,
  ),
  dinnerRecognition: dinner(
    'dinner-recognition',
    '/photos/dinner-recognition.jpg',
    'Two people shaking hands beside the lectern as an award is presented, beneath a MAPAC sign.',
    1137,
    879,
  ),
  dinnerPressInterview: dinner(
    'dinner-press-interview',
    '/photos/dinner-press-interview.jpg',
    'A participant being interviewed on camera by a television news crew at the MAPAC annual dinner.',
    1224,
    816,
  ),
  dinnerPressCamera: dinner(
    'dinner-press-camera',
    '/photos/dinner-press-camera.jpg',
    'A television reporter and camera operator recording an interview at the MAPAC annual dinner.',
    1224,
    816,
  ),
  dinnerAudience: dinner(
    'dinner-audience',
    '/photos/dinner-audience.jpg',
    'Attendees seated at tables listening to a speaker at the MAPAC annual dinner.',
    1224,
    816,
  ),
  dinnerAttendeesListening: dinner(
    'dinner-attendees-listening',
    '/photos/dinner-attendees-listening.jpg',
    'Several young women seated together, listening during the MAPAC annual dinner.',
    1224,
    816,
  ),
  dinnerGuestsTalking: dinner(
    'dinner-guests-talking',
    '/photos/dinner-guests-talking.jpg',
    'Guests talking with one another before dinner at the MAPAC annual dinner.',
    1224,
    816,
  ),
  dinnerTableConversation: dinner(
    'dinner-table-conversation',
    '/photos/dinner-table-conversation.jpg',
    'Two attendees in conversation over dinner at the MAPAC annual dinner.',
    1137,
    879,
  ),
} as const satisfies Record<string, Photo>

/** Every photograph, for the gallery. Ordered newest grouping first. */
export const galleryPhotos: Photo[] = [
  photos.forumBanner,
  photos.meeting,
  photos.conversation,
  photos.families,
  photos.planning,
  photos.dinnerHallFlags,
  photos.dinnerKeynote,
  photos.dinnerStageRemarks,
  photos.dinnerPodiumRemarks,
  photos.dinnerRecognition,
  photos.dinnerPressInterview,
  photos.dinnerPressCamera,
  photos.dinnerAudience,
  photos.dinnerAttendeesListening,
  photos.dinnerGuestsTalking,
  photos.dinnerTableConversation,
  photos.dinnerHallWide,
]

/** The credit shown beneath the annual-dinner photographs. */
export const DINNER_PHOTO_CREDIT = 'Annual dinner photographs by The Visual Advocate.'
