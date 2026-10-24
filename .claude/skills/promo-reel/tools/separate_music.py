import sys, torch, numpy as np, wave
from demucs.pretrained import get_model
from demucs.apply import apply_model
w = wave.open(sys.argv[1]); sr = w.getframerate(); n = w.getnframes()
x = np.frombuffer(w.readframes(n), np.int16).reshape(-1, 2).T.astype(np.float32) / 32768
m = get_model('htdemucs'); m.eval()
wav = torch.tensor(x)[None]
ref = wav.mean(1, keepdim=True); mean, std = ref.mean(), ref.std()
out = apply_model(m, (wav - mean) / std, shifts=1, split=True, overlap=0.25)[0] * std + mean
srcs = dict(zip(m.sources, out))
music = (srcs['drums'] + srcs['bass'] + srcs['other']).numpy().T
for name, sig in [('music', music), ('vocals', srcs['vocals'].numpy().T)]:
    o = wave.open(sys.argv[2] + f'_{name}.wav', 'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr)
    o.writeframes((np.clip(sig, -1, 1) * 32767).astype(np.int16).tobytes())
print('sources', m.sources)
