# Used https://www.youtube.com/watch?v=OCJSJ-anywc&t=309s as reference on how to approach developing this system.

import cv2
import dlib
import time
from scipy.spatial import distance
from playsound import playsound

count = 0

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1000)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1000)

hog_face_detector = dlib.get_frontal_face_detector()
dlib_facelandmark = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

cond = True

def calculate_EAR(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    ear_aspect_ratio = (A + B) / (2 * C)
    return ear_aspect_ratio

while cond:
    _, frame = cap.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = hog_face_detector(gray)
    for face in faces:
        face_landmarks = dlib_facelandmark(gray, face)
        leftEye = []
        rightEye = []

        for n in range(36, 42):
            x = face_landmarks.part(n).x
            y = face_landmarks.part(n).y
            leftEye.append((x, y))


        for n in range(42, 48):
            x = face_landmarks.part(n).x
            y = face_landmarks.part(n).y
            rightEye.append((x, y))


        left_ear = calculate_EAR(leftEye)
        right_ear = calculate_EAR(rightEye)
        EAR = (left_ear + right_ear) / 2
        EAR = round(EAR, 2)
        cv2.putText(frame, f'Drowsiness count: {count}', (350, 50), cv2.FONT_HERSHEY_PLAIN, 3, (0, 0, 0), 4)

        if EAR < .20:
            count += 1
            cv2.putText(frame, "DROWSY", (20, 200), cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 0, 255), 4)

        if count >= 100:
            cv2.putText(frame, "TAKE A BREAK!", (300, 700), cv2.FONT_HERSHEY_SIMPLEX, 3, (0,0,255), 5)


            cap.release()
            cv2.destroyAllWindows()
            cond = False

        cv2.imshow("Drowsiness Detector", frame)

        key = cv2.waitKey(1)

        if key == 27:
            cap.release()
            cv2.destroyAllWindows()


playsound('alarm.mp3')


