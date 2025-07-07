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

    rad = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(rad * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle


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

        # Posiciones fijas para mostrar texto en esquina superior izquierda
        text_angle_pos = (20, 50)
        text_state_pos = (20, 90)

        # Variables para mostrar texto de la mano válida (del lado correcto)
        texto_angulo = None
        texto_estado = None
        color_estado = (255, 255, 255)  # default blanco

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

                # Clasificación por posición en eje X
                indice_x = landmarks[TIP_FINGER].x * width
                base_x = landmarks[BASE_FINGER].x * width
                dif_x = indice_x - base_x

                if abs(dif_x) < NEUTRAL_X_THRESHOLD:
                    estado = "Neutral"
                    color = (255, 255, 0)  # Amarillo
                else:
                    if lado.lower() == "derecha":
                        if dif_x > 0:
                            estado = "Pronacion"
                            color = (0, 255, 0)  # Verde
                            pronation_angles.append(angle)
                        else:
                            estado = "Supinacion"
                            color = (0, 0, 255)  # Rojo
                            supination_angles.append(angle)
                    else:  # izquierda
                        if dif_x < 0:
                            estado = "Pronacion"
                            color = (0, 255, 0)  # Verde
                            pronation_angles.append(angle)
                        else:
                            estado = "Supinacion"
                            color = (0, 0, 255)  # Rojo
                            supination_angles.append(angle)

                # Guardar texto para mostrar en la esquina
                texto_angulo = f'Ángulo: {int(angle)}'
                texto_estado = estado
                color_estado = color

                # Solo procesar la primera mano válida del lado correcto
                break

        # Mostrar texto fijo en la esquina (si se detectó alguna mano del lado correcto)
        if texto_angulo and texto_estado:
            cv2.putText(frame, texto_angulo, text_angle_pos,
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(frame, texto_estado, text_state_pos,
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color_estado, 3)

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
