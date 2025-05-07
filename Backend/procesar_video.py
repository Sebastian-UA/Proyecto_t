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

def procesar_video(path: str):
    cap = cv2.VideoCapture(path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    size = (int(cap.get(3)), int(cap.get(4)))
    output_filename = f"{OUTPUT_DIR}/{uuid.uuid4()}_output.mp4"
    out = cv2.VideoWriter(output_filename, fourcc, fps, size)

    max_angle_right = 0
    min_angle_right = 180
    max_angle_left = 0
    min_angle_left = 180

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

                # ========== Brazo derecho ==========
                right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                                  landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                right_elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                angle_right = calculate_angle(right_shoulder, right_elbow, right_wrist)
                max_angle_right = max(max_angle_right, angle_right)
                min_angle_right = min(min_angle_right, angle_right)

                # Mostrar ángulo en el frame
                cx_r, cy_r = int(right_elbow[0] * width), int(right_elbow[1] * height)
                cv2.putText(frame, f'R: {int(angle_right)}', (cx_r, cy_r),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                # ========== Brazo izquierdo ==========
                left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                 landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                angle_left = calculate_angle(left_shoulder, left_elbow, left_wrist)
                max_angle_left = max(max_angle_left, angle_left)
                min_angle_left = min(min_angle_left, angle_left)

                # Mostrar ángulo en el frame
                cx_l, cy_l = int(left_elbow[0] * width), int(left_elbow[1] * height)
                cv2.putText(frame, f'L: {int(angle_left)}', (cx_l, cy_l),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

                # Dibuja pose completa
                mp_drawing.draw_landmarks(
                    frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            out.write(frame)

    cap.release()
    out.release()

    # Imprimir resultados
    print(f" Video procesado guardado en: {output_filename}")
    print(f" Ángulo derecho - Máximo: {max_angle_right:.2f}, Mínimo: {min_angle_right:.2f}")
    print(f" Ángulo izquierdo - Máximo: {max_angle_left:.2f}, Mínimo: {min_angle_left:.2f}")

    return {
        "message": "Video procesado y guardado correctamente.",
        "output": output_filename,
        "max_angle_right": max_angle_right,
        "min_angle_right": min_angle_right,
        "max_angle_left": max_angle_left,
        "min_angle_left": min_angle_left
    }
