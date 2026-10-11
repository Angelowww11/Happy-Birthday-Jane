"""Convert the selected Drive originals to web-ready images and tiny blur previews."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SELECTED = {
    'her': [
        'IMG_20260301_134837_648.jpg',
        'Messenger_creation_11BC5DFA-6345-4FC6-B47E-A164381C64EC.jpeg',
        'IMG_20261012_015605_729.jpg',
        'IMG_20251201_030058_576.jpg',
        'IMG_20251201_030101_272.jpg',
        'IMG_20260824_130650_071.jpg',
        'IMG_20260824_130654_344.jpg',
        'IMG_20261012_015602_298.jpg',
    ],
    'us': [
        'IMG_20251018_144959_785.jpg',
        'IMG_20251018_161137_437.jpg',
        'IMG_20260301_134650_570.jpg',
        'IMG_20260301_134701_455.jpg',
        'IMG_20261012_015500_186.jpg',
        'IMG_20261012_015524_247.jpg',
    ],
}
for group, names in SELECTED.items():
    source = ROOT / 'drive-photos' / ('Jane' if group == 'her' else 'Together')
    output = ROOT / 'public' / 'photos' / group
    output.mkdir(parents=True, exist_ok=True)
    for i, name in enumerate(names, 1):
        with Image.open(source / name) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            image.save(output / f'{group}-{i}.webp', 'WEBP', quality=82, method=6)
            thumb = image.copy()
            thumb.thumbnail((64, 64), Image.Resampling.LANCZOS)
            thumb.save(output / f'{group}-{i}-tiny.webp', 'WEBP', quality=55)
        print(f'{group}-{i}: {name}')
