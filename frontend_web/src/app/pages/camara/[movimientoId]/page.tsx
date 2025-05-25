'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMovimientoById } from '@/app/services/movimiento.api'

export default function CameraRecorder() {
  const { movimientoId } = useParams()
  const [movimiento, setMovimiento] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null)
  const [lado, setLado] = useState<string>('derecha')

  useEffect(() => {
    if (movimientoId) {
      getMovimientoById(Number(movimientoId))
        .then((data) => {
          setMovimiento(data.nombre)
        })
        .catch((error) => {
          console.error('Error al obtener el movimiento:', error)
        })
    }
  }, [movimientoId])

  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
    }
  }

  const handleStartRecording = () => {
    if (!stream) return

    const chunks: BlobPart[] = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp8'
    })

    mediaRecorderRef.current = mediaRecorder
    setRecording(true)
    setCountdown(10)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const videoURL = URL.createObjectURL(blob)
      setRecordedVideoURL(videoURL)

      const formData = new FormData()
      formData.append('file', blob, 'grabacion.webm')
      formData.append('movimiento', movimiento)
      formData.append('lado', lado)

      formData.forEach((value, key) => {
        console.log(`${key}:`, value)
      })

      try {
        const response = await fetch('http://localhost:8000/analizar_video', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          console.log('Video enviado y procesado correctamente.')
        } else {
          console.error('Error al procesar el video.')
        }
      } catch (error) {
        console.error('Error al enviar el video:', error)
      }

      setRecording(false)
    }

    mediaRecorder.start()

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) return prev - 1
        clearInterval(interval)
        mediaRecorder.stop()
        return null
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="flex flex-col items-center p-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full max-w-md rounded shadow mb-4"
      />

      <div className="mb-4">
        <p className="text-xl font-semibold">
          Movimiento: {movimiento || 'Cargando...'}
        </p>
      </div>

      <div className="flex gap-4 mb-4 items-end">
        <button
          onClick={handleStartCamera}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Activar Cámara
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona el lado a analizar:
          </label>
          <select
            value={lado}
            onChange={(e) => setLado(e.target.value)}
            className="block w-38 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="derecha">Derecha</option>
            <option value="izquierda">Izquierda</option>
          </select>
        </div>

        <button
          onClick={handleStartRecording}
          disabled={!stream || recording}
          className={`${
            recording ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold py-2 px-4 rounded`}
        >
          Grabar 10s
        </button>
      </div>

      {countdown !== null && (
        <p className="text-xl font-semibold text-red-600">
          Grabando... {countdown}s restantes
        </p>
      )}

      {recordedVideoURL && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Video grabado:</p>
          <video
            src={recordedVideoURL}
            controls
            className="w-full max-w-md rounded shadow"
          />
        </div>
      )}
    </div>
  )
}
