import sys, json, wave
import numpy as np
from faster_whisper import WhisperModel
model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "small", device="cpu", compute_type="int8")
w = wave.open(sys.argv[1]); audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
segs, info = model.transcribe(audio, language="uz", word_timestamps=True, vad_filter=False, beam_size=5)
out = []
for s in segs:
    out.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}", flush=True)
json.dump(out, open(sys.argv[1] + ".json", "w"), ensure_ascii=False, indent=1)
