'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMovimientoById } from '@/app/services/movimiento.api'; // Asegúrate de importar correctamente tu función

export default function CameraRecorder() {
  const { movimientoId } = useParams() // Obtener el ID del movimiento de la URL
  const [movimiento, setMovimiento] = useState<string>('') // Estado para almacenar el nombre del movimiento
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null)

  useEffect(() => {
    if (movimientoId) {
      // Llamar a la API para obtener el movimiento por ID
      getMovimientoById(Number(movimientoId))
        .then((data) => {
          setMovimiento(data.nombre); // Asumiendo que `data.nombre` es el nombre del movimiento
        })
        .catch((error) => {
          console.error('Error al obtener el movimiento:', error);
        });
    }
  }, [movimientoId]);

  // Activar cámara
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

  // Grabar video durante 10 segundos
  const handleStartRecording = () => {
    if (!stream) return

    const chunks: BlobPart[] = []
    const mediaRecorder = new MediaRecorder(stream)

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
      formData.append('nombre_movimiento', movimiento)

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

    // Detener grabación automáticamente después de 10 segundos
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
      // Limpiar recursos al desmontar
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

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleStartCamera}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Activar Cámara
        </button>

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
