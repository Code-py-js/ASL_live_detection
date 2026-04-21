"""
MediaPipe Keypoint Extraction Script

This script demonstrates extracting hand and pose keypoints from a video or image using MediaPipe.
It processes frames and outputs normalized keypoint coordinates for ASL gesture recognition.

Usage:
    python extract_keypoints.py --input path/to/video.mp4 --output keypoints.json

Requirements:
    - mediapipe
    - opencv-python
    - numpy
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import argparse
import sys

# Initialize MediaPipe Hands and Pose
mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5)

def extract_keypoints(frame):
    """
    Extract keypoints from a single frame.
    Returns normalized hand and pose landmarks.
    """
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process hands
    hand_results = hands.process(rgb_frame)
    hand_landmarks = []
    if hand_results.multi_hand_landmarks:
        for hand_landmark in hand_results.multi_hand_landmarks:
            landmarks = []
            for lm in hand_landmark.landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
            hand_landmarks.append(landmarks)

    # Process pose
    pose_results = pose.process(rgb_frame)
    pose_landmarks = []
    if pose_results.pose_landmarks:
        for lm in pose_results.pose_landmarks.landmark:
            pose_landmarks.extend([lm.x, lm.y, lm.z])

    return {
        'hands': hand_landmarks,
        'pose': pose_landmarks
    }

def process_video(video_path, output_path):
    """
    Process video and extract keypoints for each frame.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Cannot open video {video_path}")
        return

    keypoints_data = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        keypoints = extract_keypoints(frame)
        keypoints_data.append({
            'frame': frame_count,
            'keypoints': keypoints
        })

        frame_count += 1
        if frame_count % 100 == 0:
            print(f"Processed {frame_count} frames")

    cap.release()

    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(keypoints_data, f, indent=2)

    print(f"Keypoints saved to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract keypoints using MediaPipe')
    parser.add_argument('--input', required=True, help='Path to input video')
    parser.add_argument('--output', default='keypoints.json', help='Output JSON file')
    args = parser.parse_args()

    try:
        process_video(args.input, args.output)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
