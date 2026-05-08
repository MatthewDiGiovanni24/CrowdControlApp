import numpy as np
from PIL import Image
from ultralytics import YOLO

MODEL_PATH = "yolov8m.pt"
PERSON_CLASS_ID = 0
CONF_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45
MIN_NORMALIZED_AREA = 0.0005

model = YOLO(MODEL_PATH)
# model = YOLO("yolov8l.pt")
# model = YOLO("yolov8x.pt")


def count_people(image: Image.Image) -> int:
    frame = np.array(image.convert("RGB"))
    height, width = frame.shape[:2]
    image_area = float(width * height)

    results = model(
        frame,
        conf=CONF_THRESHOLD,
        iou=IOU_THRESHOLD,
        verbose=False,
        # save=True,
        # classes=[0],
    )

    count = 0

    for result in results:
        for box in result.boxes:
            cls = int(box.cls[0].item())
            conf = float(box.conf[0].item())

            if cls != PERSON_CLASS_ID:
                continue

            if conf < CONF_THRESHOLD:
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()
            box_width = max(0.0, x2 - x1)
            box_height = max(0.0, y2 - y1)
            box_area = box_width * box_height

            normalized_area = box_area / image_area if image_area > 0 else 0.0

            if normalized_area >= MIN_NORMALIZED_AREA:
                count += 1

    return count


# img = Image.open("Backend/Testimages/class.jpg")
# people_count = count_people(img)
