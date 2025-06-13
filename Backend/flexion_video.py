# procesar_video.py (adaptado)
import cv2
import numpy as np
import mediapipe as mp
import uuid
import os
import sqlite3
import datetime

# Inicializar MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Carpeta de salida para los videos procesados
OUTPUT_DIR = "videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

ARM_CONNECTIONS = [
    (mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_ELBOW),
    (mp_pose.PoseLandmark.LEFT_ELBOW, mp_pose.PoseLandmark.LEFT_WRIST),
    (mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_ELBOW),
    (mp_pose.PoseLandmark.RIGHT_ELBOW, mp_pose.PoseLandmark.RIGHT_WRIST)
]

# Función para calcular el ángulo entre tres puntos
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    rad = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(rad * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle


# Función principal para procesar el video
def flexion_video(path: str, lado: str):
    cap = cv2.VideoCapture(path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    size = (int(cap.get(3)), int(cap.get(4)))
    output_filename = f"{OUTPUT_DIR}/{uuid.uuid4()}_output.mp4"
    out = cv2.VideoWriter(output_filename, fourcc, fps, size)

    max_angle = 0
    min_angle = 180

    conn = sqlite3.connect('datos.db')
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS angle_detections
                 (fuente TEXT, fecha TEXT, lado TEXT, angle_min REAL, angle_max REAL, delta_angle REAL)''')

    with mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                height, width, _ = frame.shape

                if lado.lower() == "derecha":
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                             landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                    text_pos = (20, 120)
                    color = (0, 255, 0)
                    cx, cy = int(elbow[0] * width), int(elbow[1] * height)

                else:
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                             landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    text_pos = (20, 70)
                    color = (255, 0, 0)
                    cx, cy = int(elbow[0] * width), int(elbow[1] * height)

                angle = calculate_angle(shoulder, elbow, wrist)
                max_angle = max(max_angle, angle)
                min_angle = min(min_angle, angle)

                # Mostrar ángulo
                cv2.putText(frame, f'Angulo {lado.capitalize()}: {int(angle)}', text_pos, cv2.FONT_HERSHEY_PLAIN, 2, color, 2)

                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    ARM_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2)
                )


            out.write(frame)

    delta_angle = round(max_angle - min_angle, 2)
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    #c.execute("INSERT INTO angle_detections VALUES (?, ?, ?, ?, ?, ?)",
     #         ("video_name", now, lado, min_angle, max_angle, delta_angle))
    #conn.commit()

    cap.release()
    out.release()
    conn.close()

    print(f"Video procesado guardado en: {output_filename}")
    print(f"Ángulo {lado} - Máximo: {max_angle:.2f}, Mínimo: {min_angle:.2f}")

    return {
        "message": f"Video procesado correctamente para el brazo {lado}.",
        "output": output_filename,
        "lado": lado,
        "max_angle": max_angle,
        "min_angle": min_angle,
    }