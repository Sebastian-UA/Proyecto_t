'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMovimientoById } from '@/app/services/movimiento.api'
import { usePatient } from '@/app/context/paciente'
import { useProfessional } from '@/app/context/profesional'
import { createSesionWithMedicion } from '@/app/services/sesion.api'

// Tipos de resultado de análisis
type AnalisisSimple = {
  tipo: 'simple';
  lado: string;
  output: string;
  max_angle: number;
  min_angle: number;
};

type AnalisisPS = {
  tipo: 'ps';
  lado: string;
  output: string;
  pronacion: { max_angle: number; min_angle: number };
  supinacion: { max_angle: number; min_angle: number };
};

type ResultadoAnalisis = AnalisisSimple | AnalisisPS;

export default function CameraRecorder() {
  const { movimientoId } = useParams();
  const [movimiento, setMovimiento] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
  const [lado, setLado] = useState<string>('derecha');
  const [resultadoAnalisis, setResultadoAnalisis] = useState<ResultadoAnalisis | null>(null);

  const { patient } = usePatient();
  const { professional } = useProfessional();

  useEffect(() => {
    if (movimientoId) {
      getMovimientoById(Number(movimientoId))
        .then((data) => setMovimiento(data.nombre))
        .catch((error) => console.error('Error al obtener el movimiento:', error));
    }
  }, [movimientoId]);



  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  };

  const handleStartRecording = () => {
    if (!stream) return;

    const chunks: BlobPart[] = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp8'
    });

    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
    setCountdown(10);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideoURL(videoURL);

      const formData = new FormData();
      formData.append('file', blob, 'grabacion.webm');
      formData.append('movimiento', movimiento);
      formData.append('lado', lado);

      try {
        const response = await fetch('http://localhost:8000/analizar_video', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Resultado backend:", data);

          if ('pronacion' in data && 'supinacion' in data) {
            setResultadoAnalisis({
              tipo: 'ps',
              lado: data.lado,
              output: data.output,
              pronacion: data.pronacion,
              supinacion: data.supinacion,
            });
          } else {
            setResultadoAnalisis({
              tipo: 'simple',
              lado: data.lado,
              output: data.output,
              max_angle: data.max_angle,
              min_angle: data.min_angle,
            });
          }
        } else {
          console.error('Error al procesar el video.');
        }
      } catch (error) {
        console.error('Error al enviar el video:', error);
      }

      setRecording(false);
    };

    mediaRecorder.start();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) return prev - 1;
        clearInterval(interval);
        mediaRecorder.stop();
        return null;
      });
    }, 1000);
  };

  const handleGuardarAnalisis = async () => {
    if (!resultadoAnalisis || !movimientoId || !patient) {
      alert("Faltan datos para guardar el análisis");
      return;
    }

    const now = new Date();
    const fechaLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Datos comunes a cualquier medición
    const sesionData = {
      pacienteId: patient?.id,
      profesionalId: professional?.id ?? null,
      fecha: fechaLocal,
      //fecha: now.toISOString().slice(0, 10),
      hora: now.toLocaleTimeString('es-CL', { hour12: false }),
      notas: "",
    };

    try {
      if (resultadoAnalisis.tipo === 'simple') {
        const dataToSend = {
          ...sesionData,
          ejercicioId: null,
          movimientoId: Number(movimientoId),
          anguloMin: resultadoAnalisis.min_angle,
          anguloMax: resultadoAnalisis.max_angle,
          lado: resultadoAnalisis.lado, // "derecha" o "izquierda"
        };
        console.log("Datos a enviar:", dataToSend);
        await createSesionWithMedicion(dataToSend);

      } else if (resultadoAnalisis.tipo === 'ps') {
        // Guardar 2 mediciones: una para pronación y otra para supinación
        const mediciones = [
          {
            ...sesionData,
            ejercicioId: null,
            movimientoId: Number(movimientoId),
            anguloMin: resultadoAnalisis.pronacion.min_angle,
            anguloMax: resultadoAnalisis.pronacion.max_angle,
            lado: `${resultadoAnalisis.lado} - pronación`,
          },
          {
            ...sesionData,
            ejercicioId: null,
            movimientoId: Number(movimientoId),
            anguloMin: resultadoAnalisis.supinacion.min_angle,
            anguloMax: resultadoAnalisis.supinacion.max_angle,
            lado: `${resultadoAnalisis.lado} - supinación`,
          },
        ];

        // Guardar ambas mediciones
        for (const dataToSend of mediciones) {
          console.log("Datos a enviar:", dataToSend);
          await createSesionWithMedicion(dataToSend);
        }
      }

      alert("Sesión con medición guardada correctamente");

    } catch (error) {
      alert("Error al guardar sesión con medición");
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center p-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full max-w-md rounded shadow mb-4"
      />

      <p className="text-xl font-semibold mb-4">
        Movimiento: {movimiento || 'Cargando...'}
      </p>

      <div className="flex gap-4 mb-4 items-end">
        <button
          onClick={handleStartCamera}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Activar Cámara
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona el lado:
          </label>
          <select
            value={lado}
            onChange={(e) => setLado(e.target.value)}
            className="block w-38 px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="derecha">Derecha</option>
            <option value="izquierda">Izquierda</option>
          </select>
        </div>

        <button
          onClick={handleStartRecording}
          disabled={!stream || recording}
          className={`${recording ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
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

      {resultadoAnalisis && (
        <div className="mt-6 p-4 bg-gray-100 rounded shadow w-full max-w-md">
          <h3 className="text-lg font-bold mb-2">Resultados del análisis:</h3>
          <p><strong>Lado:</strong> {resultadoAnalisis.lado}</p>

          {resultadoAnalisis.tipo === 'simple' ? (
            <>
              <p><strong>Ángulo máximo:</strong> {resultadoAnalisis.max_angle.toFixed(2)}°</p>
              <p><strong>Ángulo mínimo:</strong> {resultadoAnalisis.min_angle.toFixed(2)}°</p>
            </>
          ) : (
            <>
              <p className="font-semibold mt-2">Pronación</p>
              <p>Máx: {resultadoAnalisis.pronacion.max_angle.toFixed(2)}°</p>
              <p>Mín: {resultadoAnalisis.pronacion.min_angle.toFixed(2)}°</p>

              <p className="font-semibold mt-2">Supinación</p>
              <p>Máx: {resultadoAnalisis.supinacion.max_angle.toFixed(2)}°</p>
              <p>Mín: {resultadoAnalisis.supinacion.min_angle.toFixed(2)}°</p>
            </>
          )}

          <video
            src={`http://localhost:8000/${resultadoAnalisis.output}`}
            controls
            className="mt-4 w-full rounded"
          />
        </div>
      )}

      <button
        onClick={handleGuardarAnalisis}
        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
      >
        Guardar análisis
      </button>
    </div>
  );
}
