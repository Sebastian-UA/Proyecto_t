import cv2
import numpy as np
import mediapipe as mp
import uuid
import os

mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

OUTPUT_DIR = "videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

# Umbral para clasificar pronación y supinación
NEUTRAL_ANGLE_THRESHOLD = 15

# Inicializar los módulos de MediaPipe
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Función principal
def pys_video(path: str, lado: str):
    if lado.lower() not in ["izquierda", "derecha"]:
        raise ValueError("El parámetro 'lado' debe ser 'izquierda' o 'derecha'")

    cap = cv2.VideoCapture(path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    size = (int(cap.get(3)), int(cap.get(4)))
    output_filename = f"{OUTPUT_DIR}/{uuid.uuid4()}_output.mp4"
    out = cv2.VideoWriter(output_filename, fourcc, fps, size)

    pronation_angles = []
    supination_angles = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pose_results = pose.process(image_rgb)
        hand_results = hands.process(image_rgb)

        if pose_results.pose_landmarks:
            mp_drawing.draw_landmarks(frame, pose_results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                landmarks = hand_landmarks.landmark

                if len(landmarks) > 4:
                    wrist = landmarks[mp_hands.HandLandmark.WRIST]
                    thumb = landmarks[mp_hands.HandLandmark.THUMB_CMC]
                    index = landmarks[mp_hands.HandLandmark.INDEX_FINGER_MCP]

                    height, width, _ = frame.shape
                    wrist_x, wrist_y = int(wrist.x * width), int(wrist.y * height)
                    thumb_x, thumb_y = int(thumb.x * width), int(thumb.y * height)
                    index_x, index_y = int(index.x * width), int(index.y * height)

                    if lado.lower() == "izquierda" and wrist_x < width / 2:
                        shoulder = pose_results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
                        angle = calculate_angle(
                            (shoulder.x * width, shoulder.y * height),
                            (thumb_x, thumb_y),
                            (index_x, index_y)
                        )
                        cv2.putText(frame, f'Left Angle: {int(angle)}', (20, 70),
                                    cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)

                        if angle < (90 - NEUTRAL_ANGLE_THRESHOLD):
                            pronation_angles.append(angle)
                            cv2.putText(frame, 'Pronacion Left', (20, 120),
                                        cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
                        elif angle > (90 + NEUTRAL_ANGLE_THRESHOLD):
                            supination_angles.append(angle)
                            cv2.putText(frame, 'Supinacion Left', (20, 120),
                                        cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
                        else:
                            cv2.putText(frame, 'Neutral Left', (20, 120),
                                        cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 0), 2)

                    elif lado.lower() == "derecha" and wrist_x >= width / 2:
                        shoulder = pose_results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
                        angle = calculate_angle(
                            (shoulder.x * width, shoulder.y * height),
                            (thumb_x, thumb_y),
                            (index_x, index_y)
                        )
                        cv2.putText(frame, f'Right Angle: {int(angle)}', (20, 170),
                                    cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)

                        if angle < (90 - NEUTRAL_ANGLE_THRESHOLD):
                            pronation_angles.append(angle)
                            cv2.putText(frame, 'Pronacion Right', (20, 180),
                                        cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
                        elif angle > (90 + NEUTRAL_ANGLE_THRESHOLD):
                            supination_angles.append(angle)
                            cv2.putText(frame, 'Supinacion Right', (20, 180),
                                        cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
                        else:
                            cv2.putText(frame, 'Neutral Right', (20, 180),
                                        cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 0), 2)

        out.write(frame)

    cap.release()
    out.release()

    resultado = {
        "message": "Video procesado y guardado correctamente.",
        "output": output_filename,
        "lado": lado.lower()
    }

    if pronation_angles:
        resultado["pronacion"] = {
            "min_angle": min(pronation_angles),
            "max_angle": max(pronation_angles)
        }

    if supination_angles:
        resultado["supinacion"] = {
            "min_angle": min(supination_angles),
            "max_angle": max(supination_angles)
        }

    return resultado
