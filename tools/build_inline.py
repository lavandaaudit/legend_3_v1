#!/usr/bin/env python3
"""Перезбірка одиночного index.html зі style.css + js/ (з кореня репозиторія):
Result works from any preview (single-file), file:// and GitHub Pages.
v1.5: читає dev-джерело index.dev.html (14 модулів, + sky.js v20), пишє index.html."""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.dev.html').read_text(encoding='utf-8')

# 1) inline style.css
css = (ROOT / 'style.css').read_text(encoding='utf-8')
assert '</style' not in css.lower()
html2 = re.sub(r'<link rel="stylesheet" href="style\.css[^"]*">',
               lambda m: '<style>\n' + css + '\n</style>', html, count=1)
assert html2 != html, 'style link not replaced'

# 2) inline scripts in original order
def repl(m):
    src = m.group(1).split('?')[0]
    code = (ROOT / src).read_text(encoding='utf-8')
    assert '</script' not in code.lower(), f'unsafe </script inside {src}'
    return '<script>\n' + code + '\n</script>'

html3 = re.sub(r'<script src="(js/[^"]+)"[^>]*></script>', repl, html2)
n_before = len(re.findall(r'<script src="js/', html2))
n_after = len(re.findall(r'<script src="js/', html3))
assert n_after == 0 and n_before == 14, f'expected 14 scripts, found {n_before}'

# 3) v2.4d: інлайн <img src="assets/*.jpg"> у base64 data URI —
#    гра лишається ОДНИМ файлом (нуль зовнішніх запитів, офлайн, file://).
#    PIL є → оптимізація (масштаб до 640px по ширині, progressive JPEG),
#    PIL немає → оригінальні байти. Відображаються у секції «ПРО ГРУ ТА АСЕТИ».
import base64
try:
    from PIL import Image
    import io
    def _jpg_bytes(p):
        im = Image.open(p).convert('RGB')
        w, h = im.size
        if w > 640:
            im = im.resize((640, round(h * 640 / w)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
        return buf.getvalue()
except Exception:
    def _jpg_bytes(p):
        return p.read_bytes()

def _img_repl(m):
    data = _jpg_bytes(ROOT / m.group(2))
    b64 = base64.b64encode(data).decode('ascii')
    return m.group(1) + 'src="data:image/jpeg;base64,' + b64 + '"'

n_jpg = len(re.findall(r'<img [^>]*?src="assets/[^"]+\.jpg"', html3))
assert n_jpg >= 1, 'no <img src="assets/*.jpg"> found in index.dev.html'
html3 = re.sub(r'(<img [^>]*?)src="(assets/[^"]+\.jpg)"', _img_repl, html3)
assert 'src="assets/' not in html3, 'external assets img left after inline'
print(f'OK: {n_jpg} jpeg(s) inlined as base64 data URI')

(ROOT / 'index.html').write_text(html3, encoding='utf-8')
print(f'OK: single-file index.html written ({len(html3)} bytes), {n_before} scripts + css inlined')
