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
  /** Revealed after a guest votes */
  coupleNote: string
}

export type GuidePlace = {
  title: string
  kind: 'hike' | 'coffee'
  note: string
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
}

export type SocialPost = {
  /** ISO datetime — drives relative timestamps and feed order */
  date: string
  author: string
  handle: string
  body: string
  image?: string
  imageAlt?: string
  likes?: number
  /** Marks the post as happening now */
  live?: boolean
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
    places: GuidePlace[]
  }
}
