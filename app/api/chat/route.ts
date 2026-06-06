import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from '@/lib/prompt'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    let model
    if (process.env.GROQ_API_KEY) {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
      model = groq('llama-3.3-70b-versatile')
    } else if (process.env.OPENAI_API_KEY) {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
      model = openai('gpt-4o-mini')
    } else {
      return new Response(
        JSON.stringify({ error: 'No API key found. Add GROQ_API_KEY to .env.local and restart the server.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 1024,
      temperature: 0.75,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error('[chat route error]', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
