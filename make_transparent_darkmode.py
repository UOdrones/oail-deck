from PIL import Image

def remove_bg():
    img = Image.open('/Users/agentjohnson/.gemini/antigravity/brain/43336648-7df1-418e-a6d6-300e1b4aeef2/media__1775155871618.jpg').convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        # Remove white background
        if r > 230 and g > 230 and b > 230:
            alpha = 255 - int(((r + g + b) - 690) * 8)
            if alpha < 0: alpha = 0
            new_data.append((r, g, b, alpha))
        # Turn black text to bright grey/white so it's readable on dark mode
        # The circuit inside the drop also has black. It will become white/silverish.
        elif r < 60 and g < 60 and b < 60:
            # We invert the darkness to lightness, but keep it monochrome
            val = 255 - r
            new_data.append((val, val, val, 255))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save('public/images/oail-logo-darkmode.png', "PNG")

remove_bg()
