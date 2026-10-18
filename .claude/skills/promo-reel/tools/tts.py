"""Uzbek (or any) TTS via Microsoft Edge voices, with per-word timings.
usage: python3 -I tts.py <voice> <text-file> <out.mp3> [rate e.g. +5%]
Writes <out.mp3> and <out.mp3>.words.json ([{w, s, e}] in seconds)."""
import asyncio, json, ssl, sys, os
import edge_tts, edge_tts.communicate as comm

# Trust the sandbox egress proxy's CA (verification stays on).
ca = os.environ.get('SSL_CERT_FILE', '/root/.ccr/ca-bundle.crt')
if os.path.exists(ca):
    comm._SSL_CTX = ssl.create_default_context(cafile=ca)

async def main(voice, text, out, rate):
    c = edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary')
    words = []
    with open(out, 'wb') as f:
        async for chunk in c.stream():
            if chunk['type'] == 'audio':
                f.write(chunk['data'])
            elif chunk['type'] == 'WordBoundary':
                s = chunk['offset'] / 1e7
                words.append({'w': chunk['text'], 's': round(s, 3), 'e': round(s + chunk['duration'] / 1e7, 3)})
    json.dump(words, open(out + '.words.json', 'w'), ensure_ascii=False, indent=1)
    print(f'{len(words)} words, last ends {words[-1]["e"] if words else 0:.2f}s')

asyncio.run(main(sys.argv[1], open(sys.argv[2], encoding='utf-8').read().strip(), sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else '+0%'))
