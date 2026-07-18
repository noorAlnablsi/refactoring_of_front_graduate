/**
 * Camera MediaStream lifecycle for proctoring.
 * Does not send events — ProctoringService owns reporting.
 */
export class CameraService {
  constructor() {
    this.stream = null
    this.videoElement = null
  }

  async start({ video = true, audio = true } = {}) {
    if (this.stream) return this.stream

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: video === false ? false : true,
      audio: audio === false ? false : true,
    })

    return this.stream
  }

  attachToVideo(videoEl) {
    this.videoElement = videoEl || null
    if (!videoEl || !this.stream) return
    videoEl.srcObject = this.stream
    videoEl.muted = true
    videoEl.playsInline = true
    const playPromise = videoEl.play?.()
    if (playPromise?.catch) playPromise.catch(() => {})
  }

  getStream() {
    return this.stream
  }

  getVideoTrack() {
    return this.stream?.getVideoTracks?.()?.[0] || null
  }

  getAudioTrack() {
    return this.stream?.getAudioTracks?.()?.[0] || null
  }

  hasLiveVideo() {
    const track = this.getVideoTrack()
    return Boolean(track && track.readyState === 'live' && track.enabled)
  }

  hasLiveAudio() {
    const track = this.getAudioTrack()
    return Boolean(track && track.readyState === 'live' && track.enabled)
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // ignore
        }
      })
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
      this.videoElement = null
    }
  }
}
