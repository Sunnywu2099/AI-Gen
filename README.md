# AI Design Pool App

This is a Next.js application designed to be embedded into your e-commerce sites via iframe. It allows users to upload a backyard photo and generates a pool design using AI.

## Features

- **5 Languages:** Supports English (EU), German (DE), French (FR), Spanish (ES), and Italian (IT).
- **Drag & Drop Upload:** Easy interface for users.
- **Side-by-Side Comparison:** View original and generated images.
- **Downloadable Result:** Users can save the design.
- **Banana API Integration:** Ready for serverless GPU inference.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000/?lang=en` to test.

## Deployment to Vercel

1. Push this code to a GitHub repository.
2. Import the repository into Vercel.
3. Add the following Environment Variables in Vercel Project Settings:

   | Variable | Description |
   |---|---|
   | `BANANA_API_KEY` | Your Banana.dev API Key |
   | `BANANA_MODEL_KEY` | Your Model Key |
   | `MOCK_MODE` | Set to `false` to use real API. Default is `true` (mock). |

## Embedding (Iframe)

Use the `lang` parameter to control the language for each site:

**EU Site (English):**
```html
<iframe src="https://your-app.vercel.app/?lang=eu" width="100%" height="800px" style="border:none;"></iframe>
```

**DE Site (German):**
```html
<iframe src="https://your-app.vercel.app/?lang=de" width="100%" height="800px" style="border:none;"></iframe>
```

**FR Site (French):**
```html
<iframe src="https://your-app.vercel.app/?lang=fr" width="100%" height="800px" style="border:none;"></iframe>
```

**ES Site (Spanish):**
```html
<iframe src="https://your-app.vercel.app/?lang=es" width="100%" height="800px" style="border:none;"></iframe>
```

**IT Site (Italian):**
```html
<iframe src="https://your-app.vercel.app/?lang=it" width="100%" height="800px" style="border:none;"></iframe>
```
