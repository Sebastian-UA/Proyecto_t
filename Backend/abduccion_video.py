import cv2
import numpy as np
import mediapipe as mp
import uuid
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

OUTPUT_DIR = "videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    rad = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(rad * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle


def abduccion_video(path: str, lado: str):
    cap = cv2.VideoCapture(path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    size = (int(cap.get(3)), int(cap.get(4)))
    output_filename = f"{OUTPUT_DIR}/{uuid.uuid4()}_output.mp4"
    out = cv2.VideoWriter(output_filename, fourcc, fps, size)

    max_angle = 0
    min_angle = 180

    # Posición fija para mostrar texto en esquina superior izquierda
    text_pos = (20, 50)
    color_derecha = (0, 255, 0)
    color_izquierda = (255, 0, 0)

    with mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            texto_angulo = None
            color_texto = (255, 255, 255)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                height, width, _ = frame.shape

                if lado == "derecha":
                    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                           landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    color_texto = color_derecha
                    label = 'Angulo Derecha'

                elif lado == "izquierda":
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                           landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    color_texto = color_izquierda
                    label = 'Angulo Isquierda'

                else:
                    cap.release()
                    out.release()
                    raise ValueError("Lado inválido. Debe ser 'derecha' o 'izquierda'.")

                # Crear punto virtual debajo del hombro
                offset_virtual = 0.1  # Ajustable: cuanto más abajo, mayor valor (en proporción a la altura)
                punto_virtual = [shoulder[0], shoulder[1] + offset_virtual]

                # Calcular el ángulo con el punto virtual
                angle = calculate_angle(punto_virtual, shoulder, elbow)

                max_angle = max(max_angle, angle)
                min_angle = min(min_angle, angle)

                texto_angulo = f'{label}: {int(angle)}'

                # Dibujar manualmente solo los puntos de interés
            # Dibujar solo puntos de interés (incluyendo el punto virtual en vez de la cadera real)
            puntos_interes = [shoulder, elbow, punto_virtual]
            for punto in puntos_interes:
                x = int(punto[0] * width)
                y = int(punto[1] * height)
                cv2.circle(frame, (x, y), 8, color_texto, -1)

            # Dibujar líneas entre los puntos
            cv2.line(frame,
                    (int(punto_virtual[0] * width), int(punto_virtual[1] * height)),
                    (int(shoulder[0] * width), int(shoulder[1] * height)),
                    color_texto, 2)

            cv2.line(frame,
                    (int(shoulder[0] * width), int(shoulder[1] * height)),
                    (int(elbow[0] * width), int(elbow[1] * height)),
                    color_texto, 2)



            # Mostrar el texto en la esquina superior izquierda si se detectó el ángulo
            if texto_angulo:
                cv2.putText(frame, texto_angulo, text_pos,
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color_texto, 2)

            out.write(frame)

    cap.release()
    out.release()

    print(f" Video procesado guardado en: {output_filename}")
    print(f" Ángulo {lado} - Máximo: {max_angle:.2f}, Mínimo: {min_angle:.2f}")

    return {
        "message": "Video procesado y guardado correctamente.",
        "output": output_filename,
        "lado": lado,
        "max_angle": max_angle,
        "min_angle": min_angle
    }
