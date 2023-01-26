# Flags

- [Welcoming gift](#welcoming-gift)
- [Truth seeker](#truth-seeker)
- [Gamer](#gamer)
- [L337 gamer](#1337-gamer)
- [Shinobi](#shinobi)
- [Star warrior](#star-warrior)
- [All about the fashion](#all-about-the-fashion)
- [Deep pocket](#deep-pocket)
- [Easter egg](#easter-egg)
- [Solve script](#solve-script)

# Welcoming gift

- Hint: `It's free`

We start at the title screen at https://halloween.itemize.no/, here we get some input instructions for the game. The first flag is given for free at the "Flags"-page. The flags showing `???` indicates that it is yet to be unlocked and would therefore be updated automatically if the criteria is met, the flags with the text `?`, on the other hand, indicates that it is to be found through other means.

![Flag page](./flag-1.png)

### Flag

`Itemize{sp00ky_hall0w33n}`

# Truth seeker

- Hint: `Seek the source`

At the "Flags"-page we can see that hints are also given for all the flags. For this flag, we are told to seek the source, meaning the source code of the game. As this is a web-game, using devtools we can quickly see that the source code is available for us, and luckily it is not obfuscated in any way either. Navigating through the javascript files one by one, we find the flag at `player.js`

![Source code for player.js](./flag-2.png)

### Flag

`Itemize{y0u_f0und_th3_truth}`

# Gamer

- Hint: `Clear 6 stages`

![Game stages](./flag-3-1.png)

Trying to navigate around the game shows that this is actually a [sokoban](https://en.wikipedia.org/wiki/Sokoban) clone. For this and the next flag, we have 3 intended solutions:

### 1. Manual

The first few levels should be easily solveable with little moves, and as the flag title says. One could just simply solve the first 6 stages by just playing the game normally. This does mean lots of manual work though, and a more effective approach could be done!

![First stage](./flag-3-2.png)

### 2. Walkthrough

From solving the second flag `truth seeker`, we know that the source code is available. A good start to any ctf or web challenges when the source code is given is to therefore read the source code and understand it's functionalities. Looking at the `constant.js` file we find some constants which includes the variable `MAP` with a comment indicating that a level from [Microban](http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban_files/Microban.txt) is being used. We can see that almost all the stages of the game is essentially taken from that exact game.

![First stage and source](./flag-3-3.png)

Knowing this, one can search for a game walkthrough/solution on the internet, and then manually follow the moves. An example of a video: https://www.youtube.com/watch?v=6LtYGUZYWI4

However, as this is a hacking/ctf challenge. Getting the flag through automatic means and hacking is more fun!

### 3. HTTP requests

![Network stage clear submission](./flag-3-4.png)

After manually solving a stage or by reading the source code, we can see that a POST request is being sent to the endpoint `/api/levels/[id]` with the payload `{"moves": moves}`, being the moves it took to solve a level/stage.

> Note:
>
> Looking at HTTP requests usually gives us a lot of information on the web application. We can for example see that the server is written in `javascript` and `Express` through the `x-powered-by` response header for instance, as well as the different exposed endpoints existing such as `/api/` in our case.

Knowing that there is no validation or signature other than the total amount of moves it took to solve a stage, one can figure that solving the stage is easily manipulated by just simply sending a HTTP request with any chosen move amount.

```bash
$ curl 'https://halloween.itemize.no/api/levels/1' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}

...

$ curl 'https://halloween.itemize.no/api/levels/6' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}
```

Changing the id from `1` to `2`, `3`, and so on, respectively until we reach 6 stages solved, gives us the flag.

### Flag

`Itemize{that_was_3asy}`

# L337 gamer

- Hint: `Clear 12 stages`

Similarly, we can solve all the stages by sending HTTP requests on all the different level id's up to `12`.

```bash
$ curl -X POST 'https://halloween.itemize.no/api/levels/7' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}

...

$ curl -X POST 'https://halloween.itemize.no/api/levels/12' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}
```

> Note:
>
> All stages up until stage `11` were actually solveable if played normally, stage `12` were not so, however, as the player had no method of going to the right side of the map to move the boulder.
>
> ![Unsolveable stage](./flag-4-1.png)
>
> From the given source, we can see that the `game`-variable were set globally, one could therefore access the game object through the devtools console and from there change any fields as much as wanted. The stage could therefore be solved by simply changing the user position with code, essentially teleporting the player. Alternatively, one could also access the boulders and therefore move them to the slots.
>
> ![Unsolveable stage](./flag-4-2.png)

### Flag

`Itemize{l337_gam3r}`

# Shinobi

- Hint: `Clear the hidden stage`

The hidden stage pointed to the WIP stage of `13`, were made such that one could not solve it manually by playing normally, since it is disabled by default. Similarly to the flag above, it can be solved by sending a POST request to `/api/levels/13`.

![All clear](./flag-5.png)

```bash
$ curl -X POST 'https://halloween.itemize.no/api/levels/13' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}
```

> Note:
>
> For those interested, one can retrieve the level by sending a GET request to the endpoint `/api/levels/[id]`.
>
> ```bash
> $ curl -X GET -s 'https://halloween.itemize.no/api/levels/13' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' | jq
> {
>   "level": [
>     "",
>     "    ######               ####",
>     "#####*#  #################  ##",
>     "#   ###                      #",
>     "#        ########  ####  ##  #",
>     "### ####     #  ####  ####  ##",
>     "#*# # .# # # #     #     #   #",
>     "#*# #  #     # ##  # ##  ##  #",
>     "###    ### ###  # ##  # ##  ##",
>     " #   # #*#      #     # #    #",
>     " #   # ###  #####  #### #    #",
>     " #####   #####  ####### ######",
>     " #   # # #**#               #",
>     "## # #   #**#  #######  ##  #",
>     "#    #########  #    ##### ###",
>     "# #             # $        #*#",
>     "#   #########  ### @#####  #*#",
>     "#####       #### ####   ######"
>   ]
> }
> ```

### Flag

`Itemize{hack_n0_jutsu}`

# Star warrior

- Hint: `Collect all stars`

Stars are given by solving the stages, depending on the moves done you'll get stars ranging from 1-3. By utilizing the ability to specifically choose any amount of moves through HTTP requests, we could send in the lowest move amount such as `1` for example on the different stages.

```bash
$ curl -X POST 'https://halloween.itemize.no/api/levels/1' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}

...

$ curl -X POST 'https://halloween.itemize.no/api/levels/12' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}
```

### Flag

`Itemize{d3f3nd3rs_0f_th3_galaxy}`

# All about the fashion

- Hint: `Collect all skins`

A "Shop"-page is also available for us indicating that player character skins could be bought by using the pumpkin currency given to us after clearing any stage. From this, one could guess that playing the stages repetively should give us enough currencies to buy all the skins.

![Shop](./flag-7.png)

The solution can be as easy as spamming some requests for clearing the levels till we get enough pumpkins, or write a quick script looping the requests.

```python
import os

for i in range(100):
	os.system("""curl -X POST 'https://halloween.itemize.no/api/levels/1' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'""")
```

### Flag

`Itemize{pr0ud_sk1n_c0ll3ct0r}`

# Deep pocket

- Hint: `Richer than admin`

A "Leaderboard"-page displaying the scores of each player is also available. Similarly to the solution to the flag above, we can send more requests till we have more pumpkins than the Admin user with 666 pumpkins.

![Shop](./flag-8.png)

### Flag

`Itemize{m0th3rl0d3}`

# Easter egg

- Hint: `LvL. 1337`

The last flag comes with the hint indicating that a level id of `1337` might exist. Similarly to the other challenges, we can try to see if we are able to clear the level. Sending a POST requests with the id of `14` and `1337` does indeed confirm that it exist. However, clearing the level wasn't enough to give us the flag, as it is marked with a `?` in the "Flags"-page, meaning that we have to get some other way.

```bash
$ curl -X POST 'https://halloween.itemize.no/api/levels/14' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"error":"Value of level not found"}

$ curl -X POST 'https://halloween.itemize.no/api/levels/1337' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' -H 'content-type: application/json' --data-raw '{"moves":1}'
{"success":"Level clear submitted"}
```

Instead of clearing the level, sending a GET request will give us the map of the stage, which looks very much like a QR-code:

```bash
$ curl -s 'https://halloween.itemize.no/api/levels/1337' -H 'cookie: auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliNjMzN2QwLWEzMmQtNGJmNy05Yzk1LWNlY2E5NmNkMTc5NCIsImlhdCI6MTY3NDY4MzEwMX0.ci0hmR_XioO46zBMxtIefGBSaqZLN0o1qhq5y0OSlbA' | jq
{
  "level": [
    "",
    "##############        ####  ##        ####  ##############",
    "##          ##          ##      ##      ##  ##          ##",
    "##  ######  ##    ######    ####  ##  ####  ##  ######  ##",
    "##  ######  ##        ######    ##  ##  ##  ##  ######  ##",
    "##  ######  ##    ##                ####    ##  ######  ##",
    "##          ##  ##########    ####    ####  ##          ##",
    "##############  ##  ##  ##  ##  ##  ##  ##  ##############",
    "                  ##      ##  ##########",
    "##    ##  ####  ##########  ##  ##      ####  ##",
    "  ########    ##          ##  ########  ##  ####    ######",
    "      ##    ######    ##########  ########    ##    ####",
    "########  ##  ##  ##########    ##  ######  ######  ##",
    "####    ########      ####  ####  ##      ########    ####",
    "    ####  ##  ####    ##  ##############  ##        ####",
    "  ##        ####        ######    ##        ########  ####",
    "  ######      ##      ##      ##  ##    ##    ##      ##",
    "  ####      ##  ######  ####      ##########  ##      ##",
    "  ########    ####################  ##      ##    ##    ##",
    "##  ##  ##  ##  ####  ##    ##########      ##  ##    ####",
    "    ######    ##  ##        ##    ##########  ##  ##    ##",
    "##          ##  ####          ##      ############  ##",
    "                ##    ####  ####  ####  ##      ##    ##",
    "##############      ##          ##########  ##  ##  ####",
    "##          ##  ##  ####    ####        ##      ##  ##",
    "##  ######  ##    ####          ####    ############  ##",
    "##  ######  ##  ####  ##      ##    ####    ##  ##  ##  ##",
    "##  ######  ##    ####  ############    ##    ########  ##",
    "##          ##    ########  ##  ######  ##  ####      ##",
    "##############  ##  ####  ##  ##    ##  ##    ####    ##",
    ""
  ]
}
```

Scanning it, however, proved to not be that easy as some parsing and string manipulation work had to be done to effectively make the QR-code more clear and easier to be scanned. In my case, using HTML and CSS were the most intuitive for me to draw the QR code ([qr.html](qr.html)):

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Document</title>
		<style>
			#display {
				display: flex;
				flex-direction: column;
			}
			div {
				height: 16px;
				display: flex;
			}
			span {
				display: inline-block;
				width: 8px;
				height: 16px;
				color: transparent;
				background-color: white;
			}
			span.black {
				background-color: black;
			}
		</style>
	</head>
	<body>
		<div id="display"></div>
		<script>
			const qr = [
				"",
				"##############        ####  ##        ####  ##############",
				"##          ##          ##      ##      ##  ##          ##",
				"##  ######  ##    ######    ####  ##  ####  ##  ######  ##",
				"##  ######  ##        ######    ##  ##  ##  ##  ######  ##",
				"##  ######  ##    ##                ####    ##  ######  ##",
				"##          ##  ##########    ####    ####  ##          ##",
				"##############  ##  ##  ##  ##  ##  ##  ##  ##############",
				"                  ##      ##  ##########",
				"##    ##  ####  ##########  ##  ##      ####  ##",
				"  ########    ##          ##  ########  ##  ####    ######",
				"      ##    ######    ##########  ########    ##    ####",
				"########  ##  ##  ##########    ##  ######  ######  ##",
				"####    ########      ####  ####  ##      ########    ####",
				"    ####  ##  ####    ##  ##############  ##        ####",
				"  ##        ####        ######    ##        ########  ####",
				"  ######      ##      ##      ##  ##    ##    ##      ##",
				"  ####      ##  ######  ####      ##########  ##      ##",
				"  ########    ####################  ##      ##    ##    ##",
				"##  ##  ##  ##  ####  ##    ##########      ##  ##    ####",
				"    ######    ##  ##        ##    ##########  ##  ##    ##",
				"##          ##  ####          ##      ############  ##",
				"                ##    ####  ####  ####  ##      ##    ##",
				"##############      ##          ##########  ##  ##  ####",
				"##          ##  ##  ####    ####        ##      ##  ##",
				"##  ######  ##    ####          ####    ############  ##",
				"##  ######  ##  ####  ##      ##    ####    ##  ##  ##  ##",
				"##  ######  ##    ####  ############    ##    ########  ##",
				"##          ##    ########  ##  ######  ##  ####      ##",
				"##############  ##  ####  ##  ##    ##  ##    ####    ##",
				"",
			];
			const display = document.querySelector("#display");
			for (const line of qr) {
				let arr = line.split("");
				arr = arr.map((a) =>
					a == " " ? `<span>${a}</span>` : `<span class="black">${a}</span>`
				);
				display.innerHTML += `<div>${arr.join("")}</div>`;
			}
		</script>
	</body>
</html>
```

Scanning the QR-code gives us the flag.

![QR](./qr.png)

### Flag

`Itemize{t00_3arly_f0r_3ast3r}`

# Solve script

An amazing solve script written by Jo#5283 that solves all of the above challenges automatically can be seen here ([solve.py](solve.py)):

```py
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
```
