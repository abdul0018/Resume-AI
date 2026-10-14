# Asset prompts (the user generates the scenes)

Use these when the user wants to make the visuals themselves with an image or video model. Fit the subject to their script. Write prompts in English, since models follow English best. For each **video** scene, give the user two prompts: a **start-frame image** prompt, then a **motion** prompt for image-to-video. Generating every video from a start frame keeps the same main character across shots.

## Rules that apply to every prompt
- Vertical 9:16, photorealistic, with no text, captions, logos or watermarks. Burned-in text breaks the overlays.
- **Keep the top third calm** (wall, window, sky or plain background). The kinetic text goes there.
- Lock the main character with one fixed description, and paste it into every prompt. After the first scene, also attach that image as the character reference.
- Videos: generate 5 s clips. The reel uses only 1.3–2.5 s of each, so the motion must read in the **first 2 seconds**. Use a static or slowly pushing camera with no cuts. The template adds its own slow zoom.

## Scene list → file names (put them in `public/`)

| Beat | Kind | File |
|---|---|---|
| hero | photo | `hero.png` (full frame, so set `fit: "cover"`) or a transparent cut-out (default fit) |
| caption | video | `paper.mp4` |
| punch | video | `laptop-wide.mp4` |
| b-roll 1 | video | `laptop.mp4` |
| b-roll 2 | video | `closeup.mp4` |
| b-roll 3 | video | `teacher.mp4` |
| board | screenshot | `site.png`: the site's home page, about 1600×1000, without browser chrome |
| demo | real recording | `demo.mp4`: phone footage of a laptop using the site. Write its prompt from the user's own reference |

## Template prompts (exam / school example)

Character lock: *16-year-old Central Asian (Uzbek) boy, short dark hair, clean-shaven, slim, white button-up school shirt.*

**hero (photo)**: Full-body studio photo of three Central Asian (Uzbek) high-school students standing side by side, facing the camera, confident and friendly. Centre: the tallest boy, 17, dark navy sweater vest over a white shirt, navy tie, dark trousers, navy crossbody bag. Left: a slightly shorter boy, 16, same uniform, backpack straps on his shoulders. Right: a girl, 15, navy vest, white shirt, pleated navy skirt, white socks, black shoes, backpack. Seamless orange studio background, gradient from deep red-orange (#D9400B) at the top to bright orange (#FF8A00) at the bottom, soft floor shadow. The students fill the lower 65% of the frame, with their heads between 25% and 35% from the top. Empty orange space above them. Commercial photography, sharp, vertical 9:16, no text.

**caption (video)**
- Start frame: Bright modern classroom during a national exam. Rows of Central Asian (Uzbek) teenage students in white shirts at light-wood desks with grey metal legs, writing on paper answer sheets with pens. Foreground, centre-left: [character lock], focused, writing, with a plastic water bottle on his desk. A large window with white roller blinds on the right and a plain white wall upper-left fill the top third. Camera at seated eye level, just behind the first desk. Soft daylight, vertical 9:16, photorealistic, no text.
- Motion: Static tripod shot with a very slow push-in. The students write quietly with small natural movements, and the boy keeps writing. No camera shake, no cuts.

**punch (video)**
- Start frame: the same classroom, composition and boy as the caption shot, but every desk now has a black laptop instead of paper. Students type and look at their screens. Same window and wall in the top third. (Best made by editing the caption start frame: "replace the paper sheets with black laptops".)
- Motion: Static shot with a slow push-in. The students type and read their screens. The boy types and frowns slightly.

**b-roll 1 (video)**
- Start frame: Medium shot of [character lock] at his desk typing on a black laptop, water bottle beside it, classmates with laptops softly blurred behind. Wall and window in the top third.
- Motion: He types fast, stops, stares at the screen and rubs his forehead. Static camera.

**b-roll 2 (video)**
- Start frame: Close-up of [character lock]'s face, worried, biting his lower lip, lit by the laptop screen. The laptop edge is visible at the bottom, with a blurred classroom behind.
- Motion: His eyes dart across the screen, he frowns and exhales nervously. Very slow push-in.

**b-roll 3 (video)**
- Start frame: Wide shot of the laptop exam room. [character lock] types in the middle row. A female teacher in her 40s (white blouse, black skirt, hair tied back) stands a few rows behind him. Windows in the top third.
- Motion: The teacher walks slowly up behind the boy and looks over his shoulder at his screen while he keeps typing nervously. Static camera.
