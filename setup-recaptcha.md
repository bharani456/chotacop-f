# reCAPTCHA Setup for Production

## Step 1: Get Production reCAPTCHA Key

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" or use existing site
3. Add your domain: `chotacop.in`
4. Select reCAPTCHA v2 ("I'm not a robot" Checkbox)
5. Copy the **Site Key** (starts with `6L`)

## Step 2: Update the Code

Replace `6LfYourProductionKeyHere` in `src/pages/questions.jsx` with your actual production key:

```javascript
const PRODUCTION_SITE_KEY = "6LfYourActualProductionKeyHere";
```

## Step 3: Alternative - Use Environment Variable

If you prefer to use environment variables:

1. Create `.env` file in project root:
   ```
   VITE_RECAPTCHA_SITE_KEY=6LfYourActualProductionKeyHere
   ```

2. Rebuild and deploy:
   ```bash
   npm run build
   ```

## Step 4: Test

1. Deploy to https://chotacop.in
2. Open browser console to see debug info
3. Test the reCAPTCHA functionality

## Debug Information

The console will show:
- Current hostname
- Environment variable values
- Final site key being used
- Whether it's detecting localhost correctly
