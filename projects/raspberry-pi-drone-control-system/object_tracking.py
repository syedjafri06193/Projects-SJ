import cv2
import numpy as np
import config

class ObjectTracker:

    def detect_object(self, frame):

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        mask = cv2.inRange(
            hsv,
            config.TRACK_COLOR_LOWER,
            config.TRACK_COLOR_UPPER
        )

        contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        if len(contours) == 0:
            return None

        c = max(contours, key=cv2.contourArea)

        x, y, w, h = cv2.boundingRect(c)

        return (x + w//2, y + h//2)
