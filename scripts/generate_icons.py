#!/usr/bin/env python3
"""Generate Crystal Flow premium app icons as valid PNGs (no external deps)."""
import struct, zlib, os, math

def chunk(typ, data):
    c = typ + data
    return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

def write_png(path, width, height, pixels):
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixels[y * width + x])
    idat = zlib.compress(raw, 9)
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b""))

def lerp(a, b, t):
    return a + (b - a) * t

def lerp_color(c1, c2, t):
    return (int(lerp(c1[0], c2[0], t)), int(lerp(c1[1], c2[1], t)), int(lerp(c1[2], c2[2], t)))

def blend(bg, fg, alpha):
    return (int(lerp(bg[0], fg[0], alpha)),
            int(lerp(bg[1], fg[1], alpha)),
            int(lerp(bg[2], fg[2], alpha)))

# Crystal Flow palette
BG = (0xF2, 0xF6, 0xFF)        # background
BG2 = (0xEA, 0xF1, 0xFF)       # background alt
CYAN = (0x34, 0xE0, 0xF0)      # crystal cyan
BLUE = (0x3D, 0x72, 0xF5)      # crystal blue
PURPLE = (0x9C, 0x72, 0xF0)    # crystal purple
GLOW = (0xA8, 0xE8, 0xFF)      # energy glow
WHITE = (0xFF, 0xFF, 0xFF)

def make_icon(size, transparent_bg=False, padding=0.15):
    """Main launcher icon: three crystals on gradient background."""
    pixels = []
    cx, cy = size / 2, size / 2
    # Crystal centers (three crystals in a triangular flow arrangement)
    crystals = [
        (cx - size * 0.18, cy - size * 0.05, CYAN, size * 0.13),   # left, cyan, source
        (cx, cy + size * 0.12, BLUE, size * 0.11),                 # bottom center, blue
        (cx + size * 0.18, cy - size * 0.05, PURPLE, size * 0.10),  # right, purple
    ]
    # Flow path glow radius
    flow_radius = size * 0.04

    for y in range(size):
        for x in range(size):
            px, py = x + 0.5, y + 0.5
            if transparent_bg:
                base = (0, 0, 0, 0)
            else:
                # diagonal gradient background
                t = (x + y) / (2 * size)
                bg = lerp_color(BG, BG2, t)
                base = (bg[0], bg[1], bg[2], 255)

            # Flow path: a curved line connecting the three crystals
            # Approximate with a quadratic bezier from crystal 0 to 1 to 2
            # Sample distance to bezier curve
            on_path = False
            for s in [i / 40.0 for i in range(41)]:
                # bezier: P0 -> P1 -> P2
                p0x, p0y = crystals[0][0], crystals[0][1]
                p1x, p1y = crystals[1][0], crystals[1][1]
                p2x, p2y = crystals[2][0], crystals[2][1]
                # quadratic
                bx = (1-s)*(1-s)*p0x + 2*(1-s)*s*p1x + s*s*p2x
                by = (1-s)*(1-s)*p0y + 2*(1-s)*s*p1y + s*s*p2y
                d = math.sqrt((px - bx)**2 + (py - by)**2)
                if d < flow_radius:
                    on_path = True
                    break

            if on_path and not transparent_bg:
                glow_t = 0.7
                base_rgb = blend(base[:3], GLOW, glow_t)
                base = (base_rgb[0], base_rgb[1], base_rgb[2], 255)

            # Draw crystals (diamond shape with radial gradient)
            for (ccx, ccy, color, radius) in crystals:
                dx = px - ccx
                dy = py - ccy
                dist = math.sqrt(dx*dx + dy*dy)
                if dist < radius:
                    # Diamond shape: |dx|/rx + |dy|/ry < 1
                    rx, ry = radius, radius * 1.15
                    diamond = abs(dx)/rx + abs(dy)/ry
                    if diamond < 1.0:
                        t = dist / radius
                        # Radial gradient: white core -> color -> darker edge
                        if t < 0.3:
                            ct = t / 0.3
                            col = lerp_color(WHITE, color, ct)
                        elif t < 0.8:
                            ct = (t - 0.3) / 0.5
                            col = lerp_color(color, (color[0]//2, color[1]//2, color[2]//2), ct)
                        else:
                            ct = (t - 0.8) / 0.2
                            col = lerp_color((color[0]//2, color[1]//2, color[2]//2), (color[0]//3, color[1]//3, color[2]//3), ct)
                        if transparent_bg:
                            base = (col[0], col[1], col[2], 255)
                        else:
                            base_rgb = blend(base[:3], col, 0.92)
                            base = (base_rgb[0], base_rgb[1], base_rgb[2], 255)
                elif dist < radius * 1.4:
                    # Glow around crystal
                    glow_t = max(0, 1 - (dist - radius) / (radius * 0.4))
                    glow_t *= 0.35
                    if transparent_bg:
                        if base[3] == 0:
                            base = blend((0,0,0), color, glow_t) + (int(255 * glow_t),)
                    else:
                        base_rgb = blend(base[:3], color, glow_t)
                        base = (base_rgb[0], base_rgb[1], base_rgb[2], 255)

            pixels.append(base[:4])
    return pixels

def make_foreground(size):
    """Adaptive icon foreground: crystals on transparent background."""
    return make_icon(size, transparent_bg=True)

def make_splash_icon(size):
    """Splash screen icon: larger crystals centered on transparent."""
    pixels = []
    cx, cy = size / 2, size / 2
    crystals = [
        (cx - size * 0.20, cy, CYAN, size * 0.14),
        (cx, cy + size * 0.14, BLUE, size * 0.12),
        (cx + size * 0.20, cy, PURPLE, size * 0.11),
    ]
    flow_radius = size * 0.035

    for y in range(size):
        for x in range(size):
            px, py = x + 0.5, y + 0.5
            base = (0, 0, 0, 0)

            # Flow path
            for s in [i / 40.0 for i in range(41)]:
                p0x, p0y = crystals[0][0], crystals[0][1]
                p1x, p1y = crystals[1][0], crystals[1][1]
                p2x, p2y = crystals[2][0], crystals[2][1]
                bx = (1-s)*(1-s)*p0x + 2*(1-s)*s*p1x + s*s*p2x
                by = (1-s)*(1-s)*p0y + 2*(1-s)*s*p1y + s*s*p2y
                d = math.sqrt((px - bx)**2 + (py - by)**2)
                if d < flow_radius:
                    base = blend((0,0,0), GLOW, 0.8) + (200,)
                    break

            for (ccx, ccy, color, radius) in crystals:
                dx = px - ccx
                dy = py - ccy
                dist = math.sqrt(dx*dx + dy*dy)
                if dist < radius:
                    rx, ry = radius, radius * 1.15
                    diamond = abs(dx)/rx + abs(dy)/ry
                    if diamond < 1.0:
                        t = dist / radius
                        if t < 0.3:
                            col = lerp_color(WHITE, color, t / 0.3)
                        elif t < 0.8:
                            col = lerp_color(color, (color[0]//2, color[1]//2, color[2]//2), (t-0.3)/0.5)
                        else:
                            col = lerp_color((color[0]//2, color[1]//2, color[2]//2), (color[0]//3, color[1]//3, color[2]//3), (t-0.8)/0.2)
                        base = (col[0], col[1], col[2], 255)
                elif dist < radius * 1.4:
                    glow_t = max(0, 1 - (dist - radius) / (radius * 0.4)) * 0.3
                    if base[3] == 0:
                        base = blend((0,0,0), color, glow_t) + (int(255 * glow_t),)

            pixels.append(base[:4])
    return pixels

os.makedirs("assets", exist_ok=True)

print("Generating icon.png (1024x1024)...")
write_png("assets/icon.png", 1024, 1024, make_icon(1024))

print("Generating adaptive-icon.png (1024x1024)...")
write_png("assets/adaptive-icon.png", 1024, 1024, make_icon(1024))

print("Generating favicon.png (128x128)...")
write_png("assets/favicon.png", 128, 128, make_icon(128))

print("Generating splash-icon.png (512x512)...")
write_png("assets/splash-icon.png", 512, 512, make_splash_icon(512))

print("All icons generated.")
