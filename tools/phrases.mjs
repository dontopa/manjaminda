// Prints every phrase the app speaks as JSON [[lang, text], ...]. Content data is read from index.html.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const data = html.split('/* ---------- content ---------- */')[1].split('/* ---------- games ---------- */')[0];
const ctx = {};
vm.runInNewContext(data.replace(/^const /gm, 'var '), ctx);
const { COLORS, ANIMALS, FRUITS, SHAPES, NUMS, PRAISE, LVN } = ctx;
const P = [];
const add = (ms, en) => { if (ms) P.push(['ms', ms]); if (en) P.push(['en', en]); };
// Fixed UI lines — keep in sync with say(...) calls in index.html (missing ones fall back to browser TTS).
[['Hai! Jom main dan belajar!', "Hi! Let's play and learn!"], ['Cuba lagi!', 'Try again!'], ['Hebat! Kamu berjaya!', 'Hooray! You did it!'],
 ['Cari gambar yang sama!', 'Find the matching pairs!'], ['Pecahkan belon!', 'Pop the balloons!'], ['Jom kira! Ada berapa?', "Let's count! How many?"],
 ['Mana yang besar?', 'Which one is big?'], ['Mana yang kecil?', 'Which one is small?'], ['Besar!', 'Big!'], ['Kecil!', 'Small!'],
 ['Mana lebih banyak?', 'Which has more?'], ['Mana lebih sedikit?', 'Which has fewer?'], ['Lebih banyak!', 'More!'], ['Lebih sedikit!', 'Fewer!'],
 ['Warna', 'Colours'], ['Haiwan', 'Animals'], ['Buah', 'Fruits'], ['Bentuk', 'Shapes'], ['Kira', 'Count'], ['Huruf', 'Letters'],
 ['Besar Kecil', 'Big & Small'], ['Padan Kad', 'Memory'], ['Pop Belon', 'Pop Balloons'], ...PRAISE, ...NUMS].forEach(p => add(...p));
COLORS.forEach(c => { add(c.ms, c.en); add(`Tekan warna ${c.ms}`, `Tap the colour ${c.en}`); });
ANIMALS.forEach(a => { add(a.ms, a.en); add(`Mana ${a.ms}?`, `Where is the ${a.en}?`); add(`${a.ms}! ${a.s}`, `${a.en}! ${a.s}`); });
FRUITS.forEach(f => { add(f.ms, f.en); add(`Mana ${f.ms}?`, `Where is the ${f.en}?`); });
SHAPES.forEach(s => { add(s.ms, s.en); add(`Mana bentuk ${s.ms}?`, `Where is the ${s.en}?`); });
[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].forEach(l => { add(l, l); add(`Tekan huruf ${l}`, `Tap the letter ${l}`); });
const seen = new Set();
console.log(JSON.stringify(P.filter(([l, t]) => !seen.has(l + t) && seen.add(l + t))));
