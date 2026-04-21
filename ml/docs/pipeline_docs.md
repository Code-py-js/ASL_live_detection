# ML Pipeline Documentation

## Data Formats

### Keypoints JSON
Extracted from MediaPipe, stored as JSON array of frames:

```json
[
  {
    "frame": 0,
    "keypoints": {
      "hands": [[x1, y1, z1, x2, y2, z2, ...]],  // 21 landmarks * 3 coords
      "pose": [x1, y1, z1, x2, y2, z2, ...]     // 33 landmarks * 3 coords
    }
  }
]
```

- Coordinates are normalized (0-1) relative to image dimensions.
- Hands: Up to 2 hands, each with 21 landmarks.
- Pose: Full body pose with 33 landmarks.

### Predictions JSON
Output from TFLite inference:

```json
[
  {
    "frame": 0,
    "prediction": "A",
    "confidence": 0.95
  }
]
```

- Prediction: ASL letter (A-Z).
- Confidence: Model confidence score (0-1).

## Limitations

- Requires video input for keypoint extraction.
- Assumes single-hand gestures for simplicity.
- TFLite model not included (placeholder).
- No temporal sequence processing yet (sliding window).
- Inference is synchronous; not optimized for real-time.

## Expected Workflow

1. Capture video from mobile camera.
2. Extract keypoints using `extract_keypoints.py`.
3. Run inference using `tflite_inference.py`.
4. Display predictions in app.

## Dependencies

- mediapipe: For keypoint detection.
- tensorflow: For TFLite inference.
- opencv-python: For video processing.
- numpy: For array operations.
