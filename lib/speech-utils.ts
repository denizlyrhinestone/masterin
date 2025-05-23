// Check if speech recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition || false)
}

// Check if speech synthesis is supported
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && window.speechSynthesis !== undefined
}

// Initialize speech recognition
export function initSpeechRecognition({
  onResult,
  onStart,
  onEnd,
  onError,
}: {
  onResult: (transcript: string) => void
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: any) => void
}) {
  if (!isSpeechRecognitionSupported()) {
    throw new Error("Speech recognition is not supported in this browser")
  }

  // Get the SpeechRecognition constructor
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  // Configure recognition
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = "en-US"

  // Set up event handlers
  recognition.onstart = () => {
    onStart?.()
  }

  recognition.onend = () => {
    onEnd?.()
  }

  recognition.onerror = (event) => {
    onError?.(event)
  }

  let finalTranscript = ""
  recognition.onresult = (event) => {
    let interimTranscript = ""

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    // If we have a final transcript, call the callback
    if (finalTranscript) {
      onResult(finalTranscript)
    } else if (interimTranscript) {
      // For interim results, we can optionally do something
      // console.log("Interim transcript:", interimTranscript);
    }
  }

  try {
    recognition.start()
  } catch (error) {
    onError?.(error)
    throw error
  }

  return recognition
}

// Get preferred voice
export async function getPreferredVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!isSpeechSynthesisSupported()) {
    return null
  }

  // Wait for voices to load if needed
  if (window.speechSynthesis.getVoices().length === 0) {
    await new Promise<void>((resolve) => {
      const voicesChanged = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", voicesChanged)
        resolve()
      }
      window.speechSynthesis.addEventListener("voiceschanged", voicesChanged)
    })
  }

  const voices = window.speechSynthesis.getVoices()

  // Preferred voices in order (English voices that sound natural)
  const preferredVoiceNames = [
    "Google UK English Female",
    "Google UK English Male",
    "Google US English",
    "Samantha",
    "Alex",
    "Daniel",
  ]

  // Try to find a preferred voice
  for (const name of preferredVoiceNames) {
    const voice = voices.find((v) => v.name === name)
    if (voice) return voice
  }

  // Fallback to any English voice
  const englishVoice = voices.find((voice) => voice.lang.startsWith("en-"))
  if (englishVoice) return englishVoice

  // Last resort: just use the first available voice
  return voices[0] || null
}

// Speak text
export async function speakText(
  text: string,
  options: {
    rate?: number
    pitch?: number
    voice?: SpeechSynthesisVoice | null
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: any) => void
  } = {},
): Promise<void> {
  if (!isSpeechSynthesisSupported()) {
    throw new Error("Speech synthesis is not supported in this browser")
  }

  // Stop any ongoing speech
  stopSpeaking()

  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text)

      // Set options
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      if (options.voice) {
        utterance.voice = options.voice
      }

      // Set event handlers
      utterance.onstart = () => {
        options.onStart?.()
      }

      utterance.onend = () => {
        options.onEnd?.()
        resolve()
      }

      utterance.onerror = (event) => {
        options.onError?.(event)
        reject(event)
      }

      // Speak the text
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      options.onError?.(error)
      reject(error)
    }
  })
}

// Stop speaking
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}
