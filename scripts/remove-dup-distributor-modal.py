from pathlib import Path
path = Path(r'd:\Vikas_aasha_web_clone_new\Vastwebmulti\Areas\ADMIN\Views\Home\DistibutorList.cshtml')
text = path.read_text(encoding='utf-8')
start = text.find('<!-- For Right Modal -->')
end = text.find('<div class="modal fund-tr-history', start)
if start == -1 or end == -1:
    raise SystemExit(f'markers not found start={start} end={end}')
text = text[:start] + text[end:]
path.write_text(text, encoding='utf-8')
print('Removed duplicate defaultModal222 block')
