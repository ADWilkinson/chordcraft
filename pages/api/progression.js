import OpenAI from 'openai'
import { kv } from '@vercel/kv'
import { v4 as uuidv4 } from 'uuid'

// Check API key at start of the application
if (!process.env.OPENAI_API_KEY) {
  console.error(
    'OpenAI API key not configured, please follow instructions in README.md'
  )
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handleRequest(req, res) {
  const userInput = req.body?.userInput

  if (!userInput) {
    res
      .status(400)
      .json({ error: { message: 'Please enter a valid userInput' } })
    return
  }

  try {
    const completion = await openai.chat.completions.create(
      generatePrompt(userInput)
    )

    if (!completion.choices?.[0]?.message.content) {
      throw new Error('Unexpected response format from OpenAI API')
    }

    const parsed = parseAPIResponse(completion.choices[0].message.content)
    const list = await kv.lrange('genKeys', 0, -1)

    if (!list.includes(parsed.result.toString())) {
      await kv.lpush('genKeys', parsed.result.toString())
    }

    const dbEntity = await prepareDbEntity(parsed)
    await kv.lpush(
      'progression-' + parsed.result.toString(),
      JSON.stringify(dbEntity)
    )

    res
      .status(200)
      .json({ result: dbEntity, input: generatePrompt(userInput).messages })
  } catch (error) {
    handleError(error, res)
  }
}

const generatePrompt = ({ mood, style }) => {
  return {
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `Create a ${mood} chord progression in the style of ${style}.

Respond only with a valid JSON object with the following data structure:
"""
{ 
  "result": string[],
  "context": string,
  "key": string, 
  "scale": string, 
  "tempo": string, 
  "style": string, 
  "tempo": string, 
  "fingering": string, 
  "strumming_pattern": string 
}
"""

Property definitions:
result: an array of strings representing the chords within the progression formatted in the style of "Am" for "A minor".
context: an interesting description of the chord progression provided as a single string.
key: what key the chord progression is in as a single string.
scale: what scale the chord progression is in as a single string.
tempo: what tempo the chord progression should be played in as a single string.
style: what style of music the chord progression is as a single string.
fingering: an array of objects representing chord tabs with a property called 'chord' for the chord name and a property called 'tab' for the chord tab in the following string format "X-X-X-X-X-X".
strumming_pattern: an example strumming pattern that could be used for the chord progression as a single string.

Rules:
property names must be lowercase.
property names must be enclosed in double quotes.
property values must be enclosed in double quotes.
Do not nest any other undefined objects within the JSON object.
Be Concise with your explanations without repeating yourself, also send no other text apart from the JSON object.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
  }
}

const parseAPIResponse = (content) => {
  let start = content.indexOf('{')
  let end = content.lastIndexOf('}') + 1
  return JSON.parse(content.substring(start, end))
}

const prepareDbEntity = async (parsed) => {
  let dbEntity = {
    id: uuidv4(),
    progression: parsed.result,
    context: parsed.context,
    key: parsed.key,
    scale: parsed.scale,
    tempo: parsed.tempo,
    style: parsed.style,
    strumming_pattern: parsed.strumming_pattern || null,
    fingering: parsed.fingering || null,
  }

  console.log(JSON.stringify(dbEntity))
  return dbEntity
}

const handleError = (error, res) => {
  if (error instanceof OpenAI.APIError) {
    console.error(error.status) // e.g. 401
    console.error(error.message) // e.g. The authentication token you passed was invalid...
    console.error(error.code) // e.g. 'invalid_api_key'
    console.error(error.type) // e.g. 'invalid_request_error'
    res.status(error.status).json(error.message)
  } else {
    console.error(`Error with OpenAI API request: ${error.message}`)
    res
      .status(500)
      .json({ error: { message: 'An error occurred during your request.' } })
  }
}
