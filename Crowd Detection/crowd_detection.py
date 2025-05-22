import cv2
import numpy as np
import csv
from collections import deque

net = cv2.dnn.readNet("yolov4.weights", "yolov4.cfg")
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

threshold = 50 
min_frames_to_persist = 10 
output_video = 'Task3_Pranathi_Guggilla.avi'
csv_file = 'crowd_detection_log.csv'
cap = cv2.VideoCapture('dataset_video.mp4')
fourcc = cv2.VideoWriter_fourcc(*'MJPG')
out = cv2.VideoWriter(output_video, fourcc, 20.0, (640, 480))

csv_headers = ['Frame', 'Number of People in Crowd']
with open(csv_file, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(csv_headers)

def calculate_distance(person1, person2):
    return np.sqrt((person1[0] - person2[0]) ** 2 + (person1[1] - person2[1]) ** 2)

def group_people(detections):
    groups = []
    for person in detections:
        grouped = False
        for group in groups:
            if calculate_distance(person, group[0]) < threshold:
                group.append(person)
                grouped = True
                break
        if not grouped:
            groups.append([person])
    return groups

def track_persistent_groups(groups, tracked_groups, frame_number):
    new_tracked_groups = []
    for group in groups:
        matched = False
        for tracked_group in tracked_groups:
            if calculate_distance(group[0], tracked_group[0][0]) < threshold:
                tracked_group[1].append(frame_number)  
                matched = True
                break
        if not matched:
            new_tracked_groups.append([group, deque([frame_number], maxlen=min_frames_to_persist)])
    return tracked_groups + new_tracked_groups

tracked_groups = []  
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)
    outputs = net.forward(output_layers)
    detections = []
    height, width, channels = frame.shape
    for output in outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5 and class_id == 0: 
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                detections.append((center_x, center_y))

    groups = group_people(detections)
    tracked_groups = track_persistent_groups(groups, tracked_groups, cap.get(cv2.CAP_PROP_POS_FRAMES))

    for tracked_group in tracked_groups:
        if len(tracked_group[1]) >= min_frames_to_persist:  
            num_people_in_crowd = len(tracked_group[0])
            frame_number = tracked_group[1][-1] 
            with open(csv_file, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([int(frame_number), num_people_in_crowd])

    for group in groups:
        for person in group:
            cv2.circle(frame, person, 5, (0, 255, 0), -1)
    num_people = sum(len(group) for group in groups)
    cv2.putText(frame, f'People Detected: {num_people}', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    out.write(frame)
    cv2.imshow("Frame", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
out.release()
cv2.destroyAllWindows()

print("Processing complete! Video and CSV are saved.")
