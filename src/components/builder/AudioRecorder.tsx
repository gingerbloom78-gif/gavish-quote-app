import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Play, Pause, Trash2, Radio } from 'lucide-react'
import type { AudioClip } from '../../types'

export type { AudioClip }

interface AudioRecorderProps {
  clips: AudioClip[]
  onAddClip: (clip: AudioClip) => void
  onDeleteClip: (id: string) => void
}

export default function AudioRecorder({ clips, onAddClip, onDeleteClip }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result as string
          onAddClip({
            id: crypto.randomUUID(),
            dataUrl,
            durationSec: seconds,
            createdAt: new Date().toISOString(),
          })
          setSeconds(0)
        }
        reader.readAsDataURL(blob)
      }

      mr.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('אין הרשאת מיקרופון')
    }
  }, [onAddClip, seconds])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }, [])

  const handlePlay = (clip: AudioClip) => {
    if (playingId === clip.id) {
      audioRefs.current[clip.id]?.pause()
      setPlayingId(null)
      return
    }
    // Pause any currently playing
    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId].pause()
    }
    let audio = audioRefs.current[clip.id]
    if (!audio) {
      audio = new Audio(clip.dataUrl)
      audioRefs.current[clip.id] = audio
      audio.onended = () => setPlayingId(null)
    }
    audio.play()
    setPlayingId(clip.id)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="space-y-3">
      {/* Record button */}
      <div className="flex items-center gap-3">
        {recording ? (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-500 text-white font-bold text-sm
                       py-2.5 px-4 rounded-xl shadow-md touch-feedback animate-pulse"
          >
            <Square size={15} />
            עצור ({formatTime(seconds)})
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-navy text-white font-bold text-sm
                       py-2.5 px-4 rounded-xl shadow-md touch-feedback"
          >
            <Mic size={15} />
            הקלט מזכר קולי
          </button>
        )}
        {recording && (
          <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
            <Radio size={12} className="animate-pulse" />
            מקליט...
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Clips list */}
      {clips.length > 0 && (
        <div className="space-y-2">
          {clips.map((clip, i) => (
            <div
              key={clip.id}
              className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200"
            >
              <button
                onClick={() => handlePlay(clip)}
                className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0 touch-feedback"
              >
                {playingId === clip.id
                  ? <Pause size={14} className="text-white" />
                  : <Play size={14} className="text-white" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">מזכר {i + 1}</p>
                <p className="text-xs text-gray-400">{formatTime(clip.durationSec)}</p>
              </div>
              <button
                onClick={() => onDeleteClip(clip.id)}
                className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center touch-feedback"
              >
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
