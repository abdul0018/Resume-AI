"""Original UI sound effects for talking-head reels, synthesized (no samples, no music bleed).
usage: python3 -I ui_sfx.py <out_dir>
Writes:
  click.wav     two bright ticks 78 ms apart (score cards / labels popping)
  ding.wav      glassy notification bell: 2344 Hz + 12.9 kHz partials, ~8.2 kHz detuned cluster, 173 Hz tone (icons popping)
  ding_big.wav  hero version: adds a 1172 Hz octave below, longer tail and a soft sparkle (final reveal)
Modelled on the measured spectra of a viral reel's pop sounds, rebuilt from scratch.
"""
import sys, os, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(3)


def t_(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi):
    return sosfilt(butter(4, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)


def write(path, x, peak_db=-1.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    st = np.stack([x, x], 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def tick(dur=0.03, bright=1.0):
    t = t_(dur)
    n = bp(rng.standard_normal(len(t)), 700, 15000) * np.exp(-t / 0.0035)
    body = np.sin(2 * np.pi * 3900 * t) * np.exp(-t / 0.004) * 0.6 + np.sin(2 * np.pi * 4700 * t) * np.exp(-t / 0.003) * 0.4
    return (n * 0.8 + body * 0.5) * bright


def click():
    out = np.zeros(int(0.3 * SR))
    for at, g in ((0.0, 1.0), (0.078, 0.8)):
        k = tick(); i = int(at * SR); out[i:i + len(k)] += k * g
    return out


def bell(dur, f0=2344.0, tail=0.17, hold=0.12, big=False):
    t = t_(dur)
    env = np.where(t < hold, 1.0, np.exp(-(t - hold) / tail)) * np.minimum(1, t / 0.003)
    x = np.sin(2 * np.pi * f0 * t) * env
    x += 0.11 * np.sin(2 * np.pi * (f0 + 28) * t) * env  # 28 Hz beat = shimmer
    x += 0.88 * np.sin(2 * np.pi * 12920 * t + 1.0) * env  # bright top partial
    # detuned cluster around 8.2 kHz (beats = sparkle)
    for f, g in ((8178, 0.12), (8200, 0.30), (8228, 0.26), (8250, 0.14), (8279, 0.06)):
        x += g * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * env
    x += 0.08 * np.sin(2 * np.pi * 173 * t) * env  # steady low partial
    fth = 90 + 50 * np.exp(-t / 0.02)
    x += 0.12 * np.sin(2 * np.pi * np.cumsum(fth) / SR) * np.exp(-t / 0.06)  # short thump
    # onset transient
    x += 0.25 * bp(rng.standard_normal(len(t)), 3000, 12000) * np.exp(-t / 0.003)
    if big:
        x += 0.45 * np.sin(2 * np.pi * f0 / 2 * t) * np.where(t < hold, 1.0, np.exp(-(t - hold) / (tail * 1.8)))
        for k in range(6):  # soft sparkle tail
            at = 0.06 + k * 0.07; f = rng.uniform(5000, 9000); i = int(at * SR); tt = t_(0.12)
            s = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.03) * 0.12 * (1 - k / 7)
            x[i:i + len(s)] += s
    return x


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    write(os.path.join(out, 'click.wav'), click(), -1.0)
    write(os.path.join(out, 'ding.wav'), bell(0.8), -1.5)
    write(os.path.join(out, 'ding_big.wav'), bell(1.2, tail=0.3, hold=0.15, big=True), -1.0)
    print('wrote click.wav, ding.wav, ding_big.wav to', out)
