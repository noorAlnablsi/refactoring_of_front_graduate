import { AUDIO_EVENT_THROTTLE_MS } from '../../constants/proctoring'
import { throttle } from '../../lib/proctoring/eventThrottle'

/**
 * Microphone level monitoring via Web Audio API.
 * No speech recognition. Reports via callbacks only.
 */
export class AudioService {
  constructor({ onActivity, onAnomaly } = {}) {
    this.onActivity = onActivity
    this.onAnomaly = onAnomaly
    this.audioContext = null
    this.analyser = null
    this.source = null
    this.rafId = null
    this.stream = null
    this.ownsStream = false
    this.running = false
    this.loudStreakMs = 0
    this.lastSampleAt = 0

    this.emitActivity = throttle((payload) => this.onActivity?.(payload), AUDIO_EVENT_THROTTLE_MS)
    this.emitAnomaly = throttle((payload) => this.onAnomaly?.(payload), AUDIO_EVENT_THROTTLE_MS)
  }

  async start({ stream = null, createMicStream = true } = {}) {
    if (this.running) return

    if (stream) {
      this.stream = stream
      this.ownsStream = false
    } else if (createMicStream) {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      this.ownsStream = true
    } else {
      throw new Error('AudioService requires a MediaStream or createMicStream')
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AudioCtx()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 512
    this.source = this.audioContext.createMediaStreamSource(this.stream)
    this.source.connect(this.analyser)

    this.running = true
    this.loudStreakMs = 0
    this.lastSampleAt = performance.now()
    this.#tick()
  }

  #tick() {
    if (!this.running || !this.analyser) return

    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteTimeDomainData(data)

    let sumSquares = 0
    for (let i = 0; i < data.length; i += 1) {
      const centered = (data[i] - 128) / 128
      sumSquares += centered * centered
    }
    const rms = Math.sqrt(sumSquares / data.length)
    const volume = Math.min(1, rms * 4)

    const now = performance.now()
    const delta = now - this.lastSampleAt
    this.lastSampleAt = now

    if (volume >= 0.35) {
      this.loudStreakMs += delta
      this.emitActivity({ volume: Number(volume.toFixed(3)), duration_ms: Math.round(this.loudStreakMs) })

      if (this.loudStreakMs >= 5000) {
        this.emitAnomaly({
          reason: 'continuous_voice_detected',
          duration_ms: Math.round(this.loudStreakMs),
          volume: Number(volume.toFixed(3)),
        })
        this.loudStreakMs = 0
      }
    } else {
      this.loudStreakMs = 0
    }

    this.rafId = requestAnimationFrame(() => this.#tick())
  }

  stop() {
    this.running = false

    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    this.emitActivity.cancel?.()
    this.emitAnomaly.cancel?.()

    try {
      this.source?.disconnect()
    } catch {
      // ignore
    }
    this.source = null
    this.analyser = null

    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }

    if (this.ownsStream && this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }
    this.stream = null
    this.ownsStream = false
  }
}
