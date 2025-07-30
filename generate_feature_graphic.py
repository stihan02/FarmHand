#!/usr/bin/env python3
"""
HerdWise Feature Graphic Generator
Generates a 1024x500 JPEG feature graphic for Google Play Console
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_feature_graphic():
    # Create a new image with the required dimensions
    width, height = 1024, 500
    image = Image.new('RGB', (width, height), color='#388e3c')
    draw = ImageDraw.Draw(image)
    
    # Create gradient background
    for y in range(height):
        # Create a simple gradient from top to bottom
        ratio = y / height
        r = int(56 + (46 - 56) * ratio)  # 56 to 46
        g = int(142 + (125 - 142) * ratio)  # 142 to 125
        b = int(60 + (50 - 60) * ratio)  # 60 to 50
        color = (r, g, b)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Try to load a font, fall back to default if not available
    try:
        # Try to use a system font
        title_font = ImageFont.truetype("arial.ttf", 48)
        subtitle_font = ImageFont.truetype("arial.ttf", 24)
        feature_font = ImageFont.truetype("arial.ttf", 18)
    except:
        # Fall back to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        feature_font = ImageFont.load_default()
    
    # Add text content
    # App title
    title = "HerdWise"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = 80
    title_y = 80
    draw.text((title_x, title_y), title, fill='white', font=title_font)
    
    # App tagline
    tagline = "Complete Farm Management Solution"
    tagline_bbox = draw.textbbox((0, 0), tagline, font=subtitle_font)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    tagline_x = 80
    tagline_y = title_y + 80
    draw.text((tagline_x, tagline_y), tagline, fill='white', font=subtitle_font)
    
    # Features list
    features = [
        "Animal Tracking & Health Records",
        "Financial Management",
        "Camp & Grazing Management", 
        "Inventory & Task Management"
    ]
    
    feature_y = tagline_y + 80
    for i, feature in enumerate(features):
        feature_text = f"✓ {feature}"
        feature_x = 80
        draw.text((feature_x, feature_y + i * 35), feature_text, fill='white', font=feature_font)
    
    # Add a simple phone mockup on the right side
    phone_x = width - 320
    phone_y = 50
    phone_width = 280
    phone_height = 400
    
    # Phone frame
    draw.rectangle([phone_x, phone_y, phone_x + phone_width, phone_y + phone_height], 
                   fill='#1a1a1a', outline='#333', width=2)
    
    # Phone screen
    screen_x = phone_x + 8
    screen_y = phone_y + 8
    screen_width = phone_width - 16
    screen_height = phone_height - 16
    
    # Try to load and resize a screenshot
    screenshot_path = "public/screenshots/dashboard.jpg"
    if os.path.exists(screenshot_path):
        try:
            screenshot = Image.open(screenshot_path)
            screenshot = screenshot.resize((screen_width, screen_height), Image.Resampling.LANCZOS)
            image.paste(screenshot, (screen_x, screen_y))
        except Exception as e:
            print(f"Could not load screenshot: {e}")
            # Fallback: draw a simple colored rectangle
            draw.rectangle([screen_x, screen_y, screen_x + screen_width, screen_y + screen_height], 
                          fill='#f8f9fa')
    else:
        # Fallback: draw a simple colored rectangle
        draw.rectangle([screen_x, screen_y, screen_x + screen_width, screen_y + screen_height], 
                      fill='#f8f9fa')
    
    # Add logo overlay
    logo_path = "public/screenshots/paw-logo-192.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path)
            logo = logo.resize((40, 40), Image.Resampling.LANCZOS)
            logo_x = screen_x + screen_width - 60
            logo_y = screen_y + 20
            # Create white background for logo
            draw.rectangle([logo_x - 10, logo_y - 10, logo_x + 50, logo_y + 50], fill='white')
            image.paste(logo, (logo_x, logo_y), logo if logo.mode == 'RGBA' else None)
        except Exception as e:
            print(f"Could not load logo: {e}")
    
    return image

def main():
    print("Generating HerdWise feature graphic...")
    
    # Create the feature graphic
    image = create_feature_graphic()
    
    # Save as JPEG
    output_filename = "herdwise-feature-graphic.jpg"
    image.save(output_filename, "JPEG", quality=95)
    
    print(f"Feature graphic saved as: {output_filename}")
    print(f"Dimensions: {image.size[0]}x{image.size[1]} pixels")
    print("Ready to upload to Google Play Console!")
    
    # Also save as PNG for better quality if needed
    png_filename = "herdwise-feature-graphic.png"
    image.save(png_filename, "PNG")
    print(f"Also saved as: {png_filename}")

if __name__ == "__main__":
    main() 