"""Generate neural voice clips for every app phrase -> audio/*.mp3 + audio/index.json.
Usage: pip install edge-tts && python tools/gen_audio.py   (re-run after changing content; existing clips are kept)"""
import asyncio, json, subprocess, hashlib, pathlib, edge_tts
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio'
VOICE = {'ms': ('ms-MY-YasminNeural', '-5%', '+15Hz'), 'en': ('en-US-AnaNeural', '-5%', '+0Hz')}

def speakable(t, lang):
    # single letters: spell them so the voice says the letter name clearly
    return t + '.' if len(t) == 1 else t

async def one(sem, lang, text, index):
    name = f"{lang}-{hashlib.md5(text.encode()).hexdigest()[:10]}.mp3"
    index[f"{lang}|{text}"] = name
    if (OUT / name).exists() and (OUT / name).stat().st_size:
        return
    v, rate, pitch = VOICE[lang]
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(speakable(text, lang), v, rate=rate, pitch=pitch).save(str(OUT / name))
                return
            except Exception as e:
                print('retry', text, e); await asyncio.sleep(2)
        raise SystemExit(f'failed: {lang} {text}')

async def main():
    OUT.mkdir(exist_ok=True)
    phrases = json.loads(subprocess.check_output(['node', str(ROOT / 'tools' / 'phrases.mjs')], text=True, encoding='utf8'))
    index, sem = {}, asyncio.Semaphore(6)
    await asyncio.gather(*(one(sem, l, t, index) for l, t in phrases))
    (OUT / 'index.json').write_text(json.dumps(index, ensure_ascii=False, sort_keys=True), encoding='utf8')
    print(len(index), 'clips')

asyncio.run(main())
