// Type definitions for Web Speech API
// These are needed because TypeScript doesn't include complete definitions

interface Window {
  SpeechRecognition?: typeof SpeechRecognition
  webkitSpeechRecognition?: typeof SpeechRecognition
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: (event: Event) => void
  onend: (event: Event) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onresult: (event: SpeechRecognitionEvent) => void
  onnomatch: (event: Event) => void
  onaudiostart: (event: Event) => void
  onaudioend: (event: Event) => void
  onsoundstart: (event: Event) => void
  onsoundend: (event: Event) => void
  onspeechstart: (event: Event) => void
  onspeechend: (event: Event) => void
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}
