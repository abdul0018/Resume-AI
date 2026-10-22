"""Original royalty-free music bed, synthesized (no samples, no downloads).
usage: python3 -I music.py <out.wav> <seconds> [bpm=120] [style=house|cinematic]

house: warm deep-house groove (kick, clap, offbeat hats, sub bass, filtered chord stabs,
pad) with a filter-sweep intro, a short riser + drop at bar 2 and a gentle outro.
Bars land on a fixed grid (4 beats), so cuts at multiples of 60/bpm hit the beat.
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
out, dur = sys.argv[1], float(sys.argv[2])
bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 120.0
style = sys.argv[4] if len(sys.argv) > 4 else 'house'
beat = 60.0 / bpm
N = int(dur * SR)
t = np.arange(N) / SR
mix = np.zeros((N, 2))
rng = np.random.default_rng(7)


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    mix[i:i + len(sig), 0] += sig * gain * l
    mix[i:i + len(sig), 1] += sig * gain * r


def env(n, a=0.002, d=0.2):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR / 2 - 100) / (SR / 2), 'low', output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), 'high', output='sos'), x)


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(f, n, detune=(0, 7, -7)):
    x = np.arange(n) / SR
    s = sum(2 * ((x * f * 2 ** (c / 1200)) % 1) - 1 for c in detune)
    return s / len(detune)


kick_n = int(0.45 * SR)
kx = np.arange(kick_n) / SR
kick = np.sin(2 * np.pi * (45 * kx + 110 / 28 * (1 - np.exp(-28 * kx)))) * np.exp(-kx / 0.16)
kick += 0.3 * rng.standard_normal(kick_n) * np.exp(-kx / 0.004)
clap = hp(rng.standard_normal(int(0.25 * SR)), 900) * env(int(0.25 * SR), 0.001, 0.07)
hat = hp(rng.standard_normal(int(0.08 * SR)), 7000) * env(int(0.08 * SR), 0.0005, 0.02)
openhat = hp(rng.standard_normal(int(0.3 * SR)), 6000) * env(int(0.3 * SR), 0.001, 0.12)

# Am9 – Fmaj9 – Cmaj9 – G6 (warm, premium).
prog = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 55, 59, 62, 64], [55, 59, 62, 64, 67]]
roots = [45, 41, 48, 43]
bar = 4 * beat
nbars = int(np.ceil(dur / bar))
DROP = 1  # groove (kick) enters at bar index 1

for b in range(nbars):
    t0 = b * bar
    ch = prog[b % 4]
    # pad: whole bar, slow attack, low-passed detuned saws
    n = int(bar * SR)
    pad = sum(saw(note(m), n) for m in ch) / len(ch)
    x = np.arange(n) / SR
    pad = lp(pad, 900 if style == 'house' else 1400) * np.minimum(1, x / 0.35) * np.minimum(1, (bar - x) / 0.25)
    place(pad, t0, 0.20, 0.0)
    if style != 'house':
        continue
    # filtered chord stabs on the "and" of beats 2 and 4
    for k in (1.5, 3.5):
        sn = int(0.28 * SR)
        st = sum(saw(note(m + 12), sn, (0, 9)) for m in ch[1:4]) / 3
        place(lp(st, 2200) * env(sn, 0.003, 0.09), t0 + k * beat, 0.16, 0.25 if k == 1.5 else -0.25)
    # sub bass: root on beats with an octave push
    for k, o in ((0, 0), (1.75, 12), (2.5, 0), (3.5, 0)):
        bn = int(0.4 * SR)
        bx = np.arange(bn) / SR
        f = note(roots[b % 4] - 12 + o)
        place(np.sin(2 * np.pi * f * bx) * env(bn, 0.004, 0.22), t0 + k * beat, 0.42)
    if b >= DROP and t0 < dur - bar * 0.6:
        for k in range(4):
            place(kick, t0 + k * beat, 0.9)
            place(hat, t0 + (k + 0.5) * beat, 0.22, 0.3)
            if k % 2 == 1:
                place(clap, t0 + k * beat, 0.38)
        place(openhat, t0 + 3.5 * beat, 0.12, -0.3)
    else:
        # intro / outro: just a soft kick on 1 to set the pulse
        place(kick, t0, 0.5)

# riser into the drop (noise sweep + rising tone), and a sub "boom" on the drop
rn = int(bar * SR)
rx = np.arange(rn) / SR
riser = hp(rng.standard_normal(rn), 1200) * (rx / (bar)) ** 2.5 * 0.5
riser += 0.15 * np.sin(2 * np.pi * (300 * rx + 600 * rx ** 2 / bar)) * (rx / bar) ** 2
place(riser, max(0, DROP * bar - bar), 0.35)

# sidechain pump from the kick grid + gentle master glue
pump = np.ones(N)
for b in range(DROP, nbars):
    for k in range(4):
        i = int((b * bar + k * beat) * SR)
        m = min(N - i, int(beat * SR))
        if m > 0:
            pump[i:i + m] = np.minimum(pump[i:i + m], 0.55 + 0.45 * (np.arange(m) / (beat * SR)) ** 0.6)
mix[:, 0] *= pump
mix[:, 1] *= pump
fade = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 1.2)
mix *= fade[:, None]
mix = np.tanh(mix * 1.6) / 1.6
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89

import wave
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f'{out}: {dur:.1f}s @ {bpm:.0f} bpm, bar={bar:.2f}s, drop at {DROP * bar:.2f}s')
