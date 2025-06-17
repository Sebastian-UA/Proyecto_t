import cv2
import numpy as np
import mediapipe as mp
import uuid
import os

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

OUTPUT_DIR = "videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==========================
# CONFIGURACIÓN
# ==========================
BASE_FINGER = mp_hands.HandLandmark.RING_FINGER_TIP
TIP_FINGER = mp_hands.HandLandmark.INDEX_FINGER_TIP
NEUTRAL_X_THRESHOLD = 10  # Margen de neutralidad en píxeles

# ==========================
# CÁLCULO DE ÁNGULO
# ==========================
def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)

# ==========================
# PUNTO VIRTUAL FIJO VERTICAL
# ==========================
def punto_virtual_fijo_arriba(landmarks, width, height, desplazamiento_px=40):
    base = landmarks[BASE_FINGER]
    base_xy = np.array([base.x * width, base.y * height])
    punto_virtual = base_xy + np.array([0, -desplazamiento_px])  # hacia arriba
    return tuple(punto_virtual.astype(int))

# ==========================
# FUNCIÓN PRINCIPAL
# ==========================
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

    hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)

        if results.multi_hand_landmarks and results.multi_handedness:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                label = handedness.classification[0].label
                label = "Right" if label == "Left" else "Left" if label == "Right" else label

                if (lado.lower() == "izquierda" and label != "Left") or (lado.lower() == "derecha" and label != "Right"):
                    continue

                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                landmarks = hand_landmarks.landmark
                height, width, _ = frame.shape

                punto_base = (int(landmarks[BASE_FINGER].x * width),
                              int(landmarks[BASE_FINGER].y * height))
                punto_punta = (int(landmarks[TIP_FINGER].x * width),
                               int(landmarks[TIP_FINGER].y * height))
                punto_virtual = punto_virtual_fijo_arriba(landmarks, width, height)

                cv2.circle(frame, punto_base, 8, (255, 0, 0), -1)    # Azul - base
                cv2.circle(frame, punto_punta, 8, (0, 255, 0), -1)   # Verde - punta
                cv2.circle(frame, punto_virtual, 8, (0, 0, 255), -1) # Rojo - punto virtual

                angle = calculate_angle(punto_virtual, punto_base, punto_punta)
                cv2.putText(frame, f'Ángulo: {int(angle)}', (punto_base[0], punto_base[1] - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

                # ==========================
                # CLASIFICACIÓN POR POSICIÓN EN EJE X
                # ==========================
                indice_x = landmarks[TIP_FINGER].x * width
                base_x = landmarks[BASE_FINGER].x * width
                dif_x = indice_x - base_x

                if abs(dif_x) < NEUTRAL_X_THRESHOLD:
                    estado = "Neutral"
                    color = (255, 255, 0)
                else:
                    if lado.lower() == "derecha":
                        if dif_x > 0:
                            estado = "Pronacion"
                            color = (0, 255, 0)
                            pronation_angles.append(angle)
                        else:
                            estado = "Supinacion"
                            color = (0, 0, 255)
                            supination_angles.append(angle)
                    else:  # izquierda
                        if dif_x < 0:
                            estado = "Pronacion"
                            color = (0, 255, 0)
                            pronation_angles.append(angle)
                        else:
                            estado = "Supinacion"
                            color = (0, 0, 255)
                            supination_angles.append(angle)

                cv2.putText(frame, estado, (punto_base[0], punto_base[1] + 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)

        out.write(frame)

    cap.release()
    out.release()
    hands.close()

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
