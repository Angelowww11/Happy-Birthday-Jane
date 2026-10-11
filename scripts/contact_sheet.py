from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import sys

folder = Path(sys.argv[1])
files = sorted(p for p in folder.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'})
width, height, label = 170, 205, 38
cols = 6
sheet = Image.new('RGB', (cols * width, ((len(files) + cols - 1) // cols) * (height + label)), '#fff9f0')
draw = ImageDraw.Draw(sheet)
for i, file in enumerate(files):
    try:
        with Image.open(file) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            thumb = ImageOps.contain(image, (width - 8, height - 8))
            x, y = (i % cols) * width, (i // cols) * (height + label)
            sheet.paste(thumb, (x + (width - thumb.width) // 2, y + (height - thumb.height) // 2))
            draw.text((x + 5, y + height + 3), f'{i:02d} {file.stem[:20]}', fill='#49343d')
    except Exception:
        continue
output = Path(sys.argv[2])
sheet.save(output, quality=85)
print(f'{len(files)} images: {output}')
