from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "branding" / "growgratitude-sunflower.png"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
SAGE = (235, 241, 229, 255)


def trimmed_source() -> Image.Image:
    image = Image.open(SOURCE).convert("RGBA")
    alpha_box = image.getchannel("A").getbbox()
    if not alpha_box:
        raise ValueError("Branding source has no visible pixels.")
    return image.crop(alpha_box)


def fit_center(source: Image.Image, canvas_size: int, subject_size: int) -> Image.Image:
    source = source.copy()
    source.thumbnail((subject_size, subject_size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    position = ((canvas_size - source.width) // 2, (canvas_size - source.height) // 2)
    canvas.alpha_composite(source, position)
    return canvas


def legacy_icon(source: Image.Image, size: int, round_icon: bool) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    if round_icon:
        draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    else:
        radius = max(4, round(size * 0.22))
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    background = Image.new("RGBA", (size, size), SAGE)
    canvas.alpha_composite(Image.composite(background, canvas, mask))

    flower = source.copy()
    subject_size = round(size * 0.7)
    flower.thumbnail((subject_size, subject_size), Image.Resampling.LANCZOS)
    position = ((size - flower.width) // 2, (size - flower.height) // 2)
    canvas.alpha_composite(flower, position)
    return canvas


def main() -> None:
    source = trimmed_source()
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, size in densities.items():
        target = RES / folder
        target.mkdir(parents=True, exist_ok=True)
        legacy_icon(source, size, False).save(target / "ic_launcher.png")
        legacy_icon(source, size, True).save(target / "ic_launcher_round.png")

    drawable = RES / "drawable-nodpi"
    drawable.mkdir(parents=True, exist_ok=True)
    fit_center(source, 432, 280).save(drawable / "ic_launcher_foreground.png")
    fit_center(source, 360, 260).save(drawable / "growgratitude_splash_logo.png")


if __name__ == "__main__":
    main()
