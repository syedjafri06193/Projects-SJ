import cv2

class CameraModule:

    def initialize(self):

        self.camera = cv2.VideoCapture(0)

    def get_frame(self):

        ret, frame = self.camera.read()

        if not ret:
            return None

        return frame
