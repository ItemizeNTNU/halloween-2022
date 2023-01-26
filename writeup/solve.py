import numpy as np
import requests
import json
import math
import cv2
import re

from pyzbar import pyzbar
from PIL import Image

session = requests.Session()

assert session.get("https://halloween.itemize.no/game").status_code == 200

for level in range(1, 14):
    assert session.post(f"https://halloween.itemize.no/api/levels/{level}", json={"moves": 0}).status_code == 200

needed_pumpkin_balance = 666 + 350
pumpkin_balance = session.get("https://halloween.itemize.no/api/skins").json()["pumpkin"]
for i in range(int(math.ceil((needed_pumpkin_balance - pumpkin_balance) / 3))):
    assert session.post("https://halloween.itemize.no/api/levels/13", json={"moves": 0}).status_code == 200

for skin_id in range(2, 5):
    assert session.post("https://halloween.itemize.no/api/skins", json={"skinId": skin_id}).status_code == 200

pumpkin_balance = session.get("https://halloween.itemize.no/api/skins").json()["pumpkin"]

extra_flags = {}

resp = session.get("https://halloween.itemize.no/api/levels/1337")
assert resp.status_code == 200
img = np.array([[int(c.isspace()) for c in r.ljust(58)] for r in resp.json()["level"] if r], dtype=np.uint8) * 255
flag = pyzbar.decode(Image.fromarray(cv2.resize(img, (512, 512), interpolation=cv2.INTER_NEAREST)))[0].data.decode()

extra_flags["Easter egg"] = flag

resp = session.get("https://halloween.itemize.no/js/player.js")
assert resp.status_code == 200
flag = re.search(r"Itemize{.*}", resp.text).group(0)

extra_flags["Truth seeker"] = flag

for flag_data in session.get("https://halloween.itemize.no/api/flags").json()["flags"]:
    flag = extra_flags[flag_data["flag"]] if flag_data["flag"] in extra_flags else flag_data["display"]
    print(f"{flag_data['flag'].ljust(24)}: {flag}")