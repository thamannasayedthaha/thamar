export type EventTheme = 'meeting' | 'nikah' | 'haldi' | 'mehendi' | 'sangeet' | 'reception'

export type WeddingEvent = {
  id: string
  title: string
  date: string
  time: string
  venue: string
  address: string
  description: string
  /** Drives the card's colour treatment in style.css */
  theme: EventTheme
  /** Small glyph shown in the timeline marker */
  icon: string
  /** Short line about attire */
  dressCode?: string
  /** Playful extra line under the attire */
  dressNote?: string
  /** Optional map / directions link */
  mapUrl?: string
}

export type TrailStop = {
  id: string
  title: string
  kicker: string
  description: string
  /** Optional photograph shown on the stop card */
  image?: string
  imageAlt?: string
  /** Optional Google Maps (or similar) link */
  mapUrl?: string
}

export type QuizOption = {
  id: string
  label: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  options: QuizOption[]
  /** Option id that counts as correct */
  answerId: string
  /** Revealed after a guest answers */
  coupleNote: string
}

export type GuidePlace = {
  id: string
  title: string
  kind: 'hike' | 'coffee'
  /** Where in the world it is — sits above the title */
  kicker: string
  note: string
  /** Advice revealed on the back of the card */
  tip: string
  /** How far out of the way it is */
  travel: string
  /** Caption inked into the stamp once a guest collects it */
  stamp: string
  mapUrl?: string
}

export type GalleryCategory = 'engagement' | 'nikah' | 'years'

export type GalleryImage = {
  src: string
  alt: string
  caption?: string
  /**
   * Optional photo classification used by the Keepsake Gallery.
   * If omitted, the gallery will infer a category from the image src.
   */
  category?: GalleryCategory
}

export type SocialStoryStatus = 'replay' | 'live' | 'coming'

export type SocialStory = {
  id: string
  label: string
  status: SocialStoryStatus
  /** Portrait used inside the story ring. Coming stories may omit this. */
  image?: string
  /** Glyph shown when there is no photograph yet */
  icon?: string
  /** Placeholder feed caption while the story is still coming */
  caption?: string
}

export type SocialComment = {
  handle: string
  body: string
}

export type SocialPost = {
  /** ISO datetime — drives relative timestamps and feed order */
  date: string
  author: string
  handle: string
  body: string
  image?: string
  imageAlt?: string
  /** Extra frames shown as a swipeable carousel alongside `image` */
  gallery?: string[]
  /** Small line under the author, as on a social post */
  location?: string
  likes?: number
  /** Name shown in the "liked by" line */
  likedBy?: string
  comments?: SocialComment[]
  /** Marks the post as happening now */
  live?: boolean
  /** Keeps the post near the top of the feed, after live posts */
  pinned?: boolean
}

export type SoundtrackTrack = {
  id: string
  title: string
  /** Moment in the story — printed on the cassette J-card */
  moment: string
  /** File in /public/audio, e.g. /audio/01-macclesfield.mp3 */
  src: string
}

export type PhotoUploadConfig = {
  /** Shared album or upload folder link the QR code points to. Empty disables the QR. */
  url: string
  note: string
}

export type RsvpConfig = {
  /** Form POST target (e.g. Formspree). Empty string stores replies in the browser. */
  endpoint: string
  deadline: string
  note: string
}

export type WeddingConfig = {
  couple: {
    partnerOne: string
    partnerTwo: string
    monogram: string
    instagram: {
      thamanna: string
      samar: string
    }
  }
  /** ISO datetime for the countdown (reception) */
  receptionDate: string
  tagline: string
  /** Italic line shown under the names in the hero */
  quote: string
  /** Path to the full-bleed hero photograph */
  heroImage: string
  story: {
    title: string
    image: string
    imageAlt: string
    paragraphs: string[]
  }
  events: WeddingEvent[]
  gallery: GalleryImage[]
  feed: {
    stories: SocialStory[]
    posts: SocialPost[]
  }
  soundtrack: {
    title: string
    lede: string
    tracks: SoundtrackTrack[]
  }
  photoUpload: PhotoUploadConfig
  rsvp: RsvpConfig
  trail: {
    title: string
    lede: string
    stops: TrailStop[]
  }
  quiz: {
    title: string
    lede: string
    questions: QuizQuestion[]
  }
  guide: {
    title: string
    lede: string
    /** Shown once a guest has stamped every place */
    completeNote: string
    places: GuidePlace[]
  }
}
