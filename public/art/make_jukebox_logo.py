from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

FONT_DIR = os.path.expanduser(
    "~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/"
    "59158542-b344-41f9-b22d-a5b543b1dbe8/b02f16db-e0f3-4383-9a0d-5d5eb52ba76b/"
    "skills/canvas-design/canvas-fonts"
)

# ── Palette ──────────────────────────────────────────────────────────────────
COLORS = [
    "#FF4EAB",  # pink
    "#FF8C2A",  # orange
    "#FFD700",  # gold/yellow
    "#4FCB53",  # green
    "#3B9EFF",  # blue
    "#A855F7",  # purple
    "#FF4EAB",
    "#FF8C2A",
    "#FFD700",
    "#4FCB53",
    "#3B9EFF",
    "#A855F7",
]
STROKE = "#1a1a1a"
BG_DARK = (18, 10, 40)       # deep indigo-black
BG_MID  = (35, 18, 70)       # slightly lighter center

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def glow_layer(char, font, fill_color, size_hint, glow_radius=18):
    """Render a single letter with a neon glow halo."""
    pad = 40
    tmp = Image.new("RGBA", (1, 1))
    td = ImageDraw.Draw(tmp)
    bb = td.textbbox((0, 0), char, font=font)
    w = bb[2] - bb[0] + pad * 2
    h = bb[3] - bb[1] + pad * 2

    # Glow layer
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    x = pad - bb[0]
    y = pad - bb[1]
    rgb = hex2rgb(fill_color)
    # Draw fat glow text
    stroke_w = max(10, size_hint // 8)
    for dx in range(-stroke_w, stroke_w + 1):
        for dy in range(-stroke_w, stroke_w + 1):
            if dx*dx + dy*dy <= stroke_w*stroke_w:
                gd.text((x + dx, y + dy), char, font=font, fill=rgb + (120,))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_radius))

    # Letter tile (on top of glow)
    tile = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    stroke_w2 = max(7, size_hint // 14)
    for dx in range(-stroke_w2, stroke_w2 + 1):
        for dy in range(-stroke_w2, stroke_w2 + 1):
            if dx*dx + dy*dy <= stroke_w2*stroke_w2:
                d.text((x + dx, y + dy), char, font=font, fill=hex2rgb(STROKE) + (255,))
    d.text((x, y), char, font=font, fill=rgb + (255,))

    # Composite glow + letter
    combined = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    combined.alpha_composite(glow)
    combined.alpha_composite(tile)
    return combined

def place_word(canvas, word, font, colors, offset_color, cx, cy, size, tilts, bounces):
    pad = 40
    tmp = Image.new("RGBA", (1, 1))
    td = ImageDraw.Draw(tmp)
    widths = []
    for ch in word:
        bb = td.textbbox((0, 0), ch, font=font)
        widths.append(bb[2] - bb[0] + pad * 2)
    total_w = sum(widths) - pad * len(word)
    x = cx - total_w // 2

    for i, ch in enumerate(word):
        color = colors[(i + offset_color) % len(colors)]
        tile = glow_layer(ch, font, color, size)
        angle = tilts[i % len(tilts)]
        bounce = bounces[i % len(bounces)]
        rotated = tile.rotate(angle, expand=True, resample=Image.BICUBIC)
        rx, ry = rotated.size
        paste_x = x - (rx - tile.size[0]) // 2
        paste_y = cy - ry // 2 + bounce
        canvas.alpha_composite(rotated, (int(paste_x), int(paste_y)))
        x += widths[i] - pad + 4

# ── Canvas ───────────────────────────────────────────────────────────────────
W, H = 1200, 460
canvas = Image.new("RGBA", (W, H), BG_DARK + (255,))

# Radial gradient background — lighter in center
bg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for y in range(H):
    for x in range(W):
        dist = math.sqrt(((x - W//2) / (W//2))**2 + ((y - H//2) / (H//2))**2)
        t = min(1.0, dist)
        r = int(BG_MID[0] * (1-t) + BG_DARK[0] * t)
        g = int(BG_MID[1] * (1-t) + BG_DARK[1] * t)
        b = int(BG_MID[2] * (1-t) + BG_DARK[2] * t)
        bg.putpixel((x, y), (r, g, b, 255))
canvas = bg.copy()

# ── Retro marquee border ──────────────────────────────────────────────────────
draw = ImageDraw.Draw(canvas)

# Outer border
BORDER_COLOR = (255, 215, 0)  # gold
draw.rounded_rectangle([14, 14, W-14, H-14], radius=36, outline=BORDER_COLOR, width=5)
# Inner border
draw.rounded_rectangle([28, 28, W-28, H-28], radius=26, outline=BORDER_COLOR, width=2)

# Corner stars / diamond accents
star_positions = [(60, 60), (W-60, 60), (60, H-60), (W-60, H-60)]
for sx, sy in star_positions:
    for r, alpha in [(14, 180), (9, 255)]:
        star = Image.new("RGBA", (r*2+2, r*2+2), (0,0,0,0))
        sd = ImageDraw.Draw(star)
        pts = []
        for k in range(8):
            rad = r if k % 2 == 0 else r // 2
            angle = math.pi * k / 4 - math.pi / 8
            pts.append((r+1 + rad * math.cos(angle), r+1 + rad * math.sin(angle)))
        sd.polygon(pts, fill=(255, 215, 0, alpha))
        canvas.alpha_composite(star, (sx - r - 1, sy - r - 1))

# ── Horizontal decorative lines flanking text ─────────────────────────────────
LINE_Y_TOP = 165
LINE_Y_BOT = 315
for ly in [LINE_Y_TOP, LINE_Y_BOT]:
    for lx_start, lx_end in [(50, 170), (W-170, W-50)]:
        draw.line([(lx_start, ly), (lx_end, ly)], fill=(255, 215, 0, 160), width=2)

# ── Musical note accents ──────────────────────────────────────────────────────
try:
    note_font = ImageFont.truetype(os.path.join(FONT_DIR, "Baloo2-Bold.ttf"), 36)
except Exception:
    note_font = ImageFont.load_default()

note_positions = [(52, 200), (W-90, 200), (52, 280), (W-90, 280)]
for nx, ny in note_positions:
    draw.text((nx, ny), "♪", font=note_font, fill=(255, 215, 0, 180))

# ── Text ──────────────────────────────────────────────────────────────────────
font_path_bold = os.path.join(FONT_DIR, "Boldonse-Regular.ttf")
font_big  = ImageFont.truetype(font_path_bold, 152)
font_med  = ImageFont.truetype(font_path_bold, 92)

# "JANGLES" — top row
tilts_top    = [3, -4, 2, -3, 4, -2, 3]
bounces_top  = [-6, 8, -4, 10, -8, 5, -3]
place_word(canvas, "JANGLES", font_big, COLORS, 0,
           cx=W//2, cy=162, size=152, tilts=tilts_top, bounces=bounces_top)

# "JUKE BOX" — bottom row
tilts_bot   = [-3, 4, -2, 3, -4, 2, -3, 3]
bounces_bot = [7, -6, 8, -4, 6, -7, 5, -5]
place_word(canvas, "JUKE BOX", font_med, COLORS, 2,
           cx=W//2, cy=335, size=92, tilts=tilts_bot, bounces=bounces_bot)

out = os.path.join(os.path.dirname(__file__), "jangles-jukebox-logo.png")
canvas.save(out)
print(f"Saved → {out}")
