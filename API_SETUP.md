# API Setup Guide

## Overview
This app uses OpenAI's Whisper API for audio transcription and optionally uses Google's Gemini API for AI image analysis.

## Required: OpenAI API Setup (for Audio Transcription)

1. **Get your OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (you won't be able to see it again!)

2. **Create a .env file**
   - In the project root directory, create a file named `.env`
   - Add the following line:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-...your_actual_key_here...
   ```

3. **Restart the development server**
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npx expo start
   ```

## Optional: Google Gemini API Setup (for AI Image Analysis)

1. **Get your Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to .env file**
   - Add this line to your `.env` file:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=AI...your_actual_key_here...
   ```

3. **Restart the development server**

## Example .env file

```env
# OpenAI API Configuration (Required for audio transcription)
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-abc123...

# Gemini API Configuration (Optional for AI features)
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

## Troubleshooting

### Audio transcription not working
- Ensure your OpenAI API key is correctly set in the .env file
- Check that the key starts with `sk-`
- Verify you have credits/billing set up in your OpenAI account
- Make sure you restarted the Expo server after adding the key

### API key not being recognized
- The .env file must be in the project root (same level as package.json)
- Environment variable names must start with `EXPO_PUBLIC_` for Expo to recognize them
- Always restart the Expo development server after changing .env

### Security Note
- Never commit your .env file to version control
- The .env file is already in .gitignore
- Keep your API keys secret and rotate them regularly
