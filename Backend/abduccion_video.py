# procesar_video.py
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
    ab = a - b
    cb = c - b
    cosine_angle = np.dot(ab, cb) / (np.linalg.norm(ab) * np.linalg.norm(cb))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)

def abduccion_video(path: str, lado: str):
    cap = cv2.VideoCapture(path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    size = (int(cap.get(3)), int(cap.get(4)))
    output_filename = f"{OUTPUT_DIR}/{uuid.uuid4()}_output.mp4"
    out = cv2.VideoWriter(output_filename, fourcc, fps, size)

    max_angle = 0
    min_angle = 180

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

                if lado == "derecha":
                    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                           landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    color = (0, 255, 0)
                    label = 'R'
                    cx, cy = int(shoulder[0] * width), int(shoulder[1] * height)

                elif lado == "izquierda":
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                           landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                             landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    color = (255, 0, 0)
                    label = 'L'
                    cx, cy = int(shoulder[0] * width), int(shoulder[1] * height)

                else:
                    cap.release()
                    out.release()
                    raise ValueError("Lado inválido. Debe ser 'derecha' o 'izquierda'.")

                angle = calculate_angle(hip, shoulder, elbow)
                max_angle = max(max_angle, angle)
                min_angle = min(min_angle, angle)

                cv2.putText(frame, f'{label}: {int(angle)}', (cx, cy - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

                mp_drawing.draw_landmarks(
                    frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

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
