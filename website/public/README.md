# SkunkSquad NFT Website Images

This directory contains all the visual assets for the SkunkSquad NFT website.

## Current Assets

### Icons & Favicons
- `favicon.svg` - Scalable SVG favicon with SkunkSquad branding
- `favicon.ico` - Traditional ICO favicon (placeholder)
- `apple-touch-icon.png` - iOS home screen icon (180x180)

### Social Media Cards
- `og-image.html` - Open Graph image template (1200x630)
- `twitter-card.html` - Twitter Card image template (1200x600)

### App Integration
- `manifest.json` - PWA manifest file
- `sw.js` - Service Worker for offline functionality

### SEO & Robots
- `robots.txt` - Search engine crawling instructions
- `sitemap.xml` - Site structure for search engines

## Generating Images from HTML Templates

The social media card templates are HTML files that can be converted to images using tools like:

1. **Puppeteer** (Node.js)
```javascript
const puppeteer = require('puppeteer');

async function generateImage() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/og-image.html');
    await page.setViewport({ width: 1200, height: 630 });
    await page.screenshot({ path: 'og-image.png' });
    await browser.close();
}
```

2. **Playwright** (Multi-browser)
```javascript
const { chromium } = require('playwright');

async function generateImages() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Generate OG image
    await page.goto('file://' + __dirname + '/og-image.html');
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.screenshot({ path: 'og-image.png' });
    
    // Generate Twitter card
    await page.goto('file://' + __dirname + '/twitter-card.html');
    await page.setViewportSize({ width: 1200, height: 600 });
    await page.screenshot({ path: 'twitter-card.png' });
    
    await browser.close();
}
```

3. **Online Tools**
- [HTML/CSS to Image API](https://htmlcsstoimage.com/)
- [Bannerbear](https://www.bannerbear.com/)
- [Placid](https://placid.app/)

## Image Requirements

### Open Graph (Facebook, LinkedIn)
- **Dimensions**: 1200x630px
- **Format**: PNG or JPG
- **Max file size**: 8MB
- **Aspect ratio**: 1.91:1

### Twitter Cards
- **Dimensions**: 1200x600px  
- **Format**: PNG, JPG, or GIF
- **Max file size**: 5MB
- **Aspect ratio**: 2:1

### App Icons
- **iOS**: 180x180px (apple-touch-icon.png)
- **Android**: 192x192px, 512x512px
- **Windows**: 144x144px
- **PWA**: Various sizes in manifest.json

## Brand Colors

```css
:root {
    --primary: #6366f1;     /* Indigo */
    --secondary: #ec4899;   /* Pink */
    --accent: #f59e0b;      /* Amber */
    --dark: #000000;        /* Black */
    --gray: #111827;        /* Dark Gray */
}
```

## Fonts Used
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (Google Fonts)

## Best Practices

1. **Optimize for Performance**
   - Use WebP format when possible
   - Implement responsive images
   - Add proper alt text

2. **Social Media**
   - Test cards with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
   - Validate with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

3. **Accessibility**
   - Provide alt text for all images
   - Ensure sufficient color contrast
   - Support high contrast modes

4. **SEO**
   - Use descriptive filenames
   - Include images in sitemap
   - Optimize file sizes

## Future Assets Needed

- [ ] Collection preview images
- [ ] Team member photos
- [ ] Roadmap graphics
- [ ] Feature illustrations
- [ ] Mobile app screenshots
- [ ] Video thumbnails
- [ ] Newsletter headers
- [ ] Blog post images

## File Structure

```
public/
├── favicon.ico           # Main favicon
├── favicon.svg           # SVG favicon
├── apple-touch-icon.png  # iOS icon
├── manifest.json         # PWA manifest
├── og-image.html         # OG template
├── twitter-card.html     # Twitter template
├── robots.txt           # SEO robots
├── sitemap.xml          # SEO sitemap
└── sw.js               # Service worker
```