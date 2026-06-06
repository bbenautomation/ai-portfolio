# John Benedict Biagtas — AI Portfolio

An interactive AI-powered portfolio. Visitors chat with an AI avatar that knows everything about John's background, skills, and experience.

## Stack

- **Next.js 15** (App Router, edge runtime)
- **Vercel AI SDK** — streaming chat
- **Groq** (Llama 3.1 70B) or **OpenAI** (GPT-4o-mini)
- **Motion** (Framer Motion) — avatar + UI animations
- **Tailwind v4** — styling
- **react-markdown** — formatted AI replies

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env.local

# 3. Add your API key to .env.local
# Option A (recommended — fast + free tier):
GROQ_API_KEY=gsk_xxxxxxxxxxxxxx

# Option B:
OPENAI_API_KEY=sk-xxxxxxxxxxxxxx

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

When prompted, add `GROQ_API_KEY` or `OPENAI_API_KEY` as environment variables in the Vercel dashboard under **Settings > Environment Variables**.

## Deploy to Render

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
4. Add your env var under **Environment**

## Customization

| What | Where |
|------|-------|
| System prompt / resume content | `lib/prompt.ts` |
| Suggestion chips | `app/page.tsx` — `CHIPS` array |
| Avatar appearance | `components/Avatar.tsx` |
| Mouse rainbow effect | `components/MouseEffect.tsx` |
| Color tokens | `app/globals.css` — CSS variables |
| AI model | `app/api/chat/route.ts` |

## Swap the avatar image

Replace the SVG face in `components/Avatar.tsx` with an `<img>` tag pointing to your photo:

```tsx
<img
  src="/avatar.png"
  alt="John Benedict"
  style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
/>
```

Drop your image in the `public/` folder and update the `src`.
