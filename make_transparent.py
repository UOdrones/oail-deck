from PIL import Image

def remove_bg():
    img = Image.open('/Users/agentjohnson/.gemini/antigravity/brain/43336648-7df1-418e-a6d6-300e1b4aeef2/media__1775155871618.jpg').convert("RGBA")
    data = img.getdata()
    new_data = []
    
    # Try to clean out white background while preserving the silver drop which is mostly grey
    for item in data:
        r, g, b, a = item
        # If it's very bright and lacks color saturation (i.e. white or very light gray background)
        if r > 240 and g > 240 and b > 240:
            # We want to feather it slightly based on how white it is
            alpha = 255 - int(((r + g + b) - 720) * 5)
            if alpha < 0: alpha = 0
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save('public/images/oail-logo.png', "PNG")

remove_bg()
