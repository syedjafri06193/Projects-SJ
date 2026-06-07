from drone.motor_controller import MotorController
from drone.imu_handler import IMUHandler
from drone.camera_module import CameraModule

class FlightController:

    def __init__(self):
        self.motors = MotorController()
        self.imu = IMUHandler()
        self.camera = CameraModule()

    def initialize(self):
        self.motors.initialize()
        self.imu.initialize()
        self.camera.initialize()

    def stabilize(self, imu_data):

        pitch, roll, yaw = imu_data

        correction = 0.1

        self.motors.adjust_speed(
            pitch * correction,
            roll * correction
        )

    def follow_target(self, target):

        x, y = target

        if x < 300:
            self.motors.turn_left()

        elif x > 340:
            self.motors.turn_right()

        if y < 220:
            self.motors.move_forward()

        elif y > 260:
            self.motors.move_backward()
