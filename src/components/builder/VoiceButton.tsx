import { useState, useCallback } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
}

// Check for Web Speech API support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('הדפדפן לא תומך בזיהוי קול')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'he-IL'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript.trim()) {
        onTranscript(transcript.trim())
        setTranscript('')
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      setError(event.error === 'not-allowed' ? 'אין הרשאת מיקרופון' : 'שגיאה בזיהוי קול')
    }

    try {
      recognition.start()
    } catch {
      setError('לא ניתן להפעיל זיהוי קול')
    }
  }, [onTranscript, transcript])

  return (
    <>
      {/* Floating button */}
      <button
        onClick={startListening}
        className={`fixed bottom-44 left-5 z-30 w-14 h-14 rounded-full
                    flex items-center justify-center shadow-lg touch-feedback
                    transition-all duration-200
                    ${isListening
                      ? 'bg-red-500 animate-pulse-ring scale-110'
                      : 'bg-navy hover:bg-navy-light'
                    }`}
      >
        {isListening ? (
          <MicOff size={22} className="text-white" />
        ) : (
          <Mic size={22} className="text-white" />
        )}
      </button>

      {/* Listening indicator */}
      {isListening && (
        <div className="fixed bottom-60 left-5 z-30 bg-navy text-white px-4 py-2 rounded-xl
                        shadow-lg animate-fade-in text-xs font-medium flex items-center gap-2 max-w-[200px]">
          <Loader2 size={14} className="animate-spin" />
          <span className="truncate">{transcript || 'מקשיב...'}</span>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-60 left-5 z-30 bg-red-500 text-white px-4 py-2 rounded-xl
                        shadow-lg animate-fade-in text-xs font-medium">
          {error}
        </div>
      )}
    </>
  )
}
