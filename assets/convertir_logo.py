from PIL import Image
import numpy as np, io, os

def convertir_logo(entrada, salida, ancho=480):
    img = Image.open(entrada).convert('RGBA')
    ratio = ancho / img.width
    alto = int(img.height * ratio)
    img = img.resize((ancho, alto), Image.LANCZOS)

    arr = np.array(img, dtype=np.float32)
    lum = 0.299*arr[:,:,0] + 0.587*arr[:,:,1] + 0.114*arr[:,:,2]

    alpha = np.where(lum < 210, 1.0,
            np.where(lum > 240, 0.0,
                1.0 - (lum - 210) / 30.0))

    arr[:,:,3] = (alpha * 255).clip(0, 255)
    result = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    result.save(salida, 'PNG', optimize=True)
    print(f'Logo guardado en {salida} ({os.path.getsize(salida)//1024}KB)')

if __name__ == '__main__':
    convertir_logo('logo.jpg', 'logo.png')
