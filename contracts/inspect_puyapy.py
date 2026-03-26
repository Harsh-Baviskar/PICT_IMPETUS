import pathlib
p = pathlib.Path(r'C:\Users\ASUS\AppData\Local\Programs\Python\Python312\Lib\site-packages\puyapy')
out=[]
for f in p.rglob('*.py'):
    text = f.read_text(errors='ignore')
    if 'subprocess' in text:
        for i,line in enumerate(text.splitlines(),1):
            if 'subprocess' in line:
                out.append(f'{f}:{i}: {line.strip()}')
                if len(out) >= 100:
                    break
    if len(out) >= 100:
        break
pathlib.Path('puyapy_subprocess_results.txt').write_text('\n'.join(out), encoding='utf-8')
print('wrote', len(out))