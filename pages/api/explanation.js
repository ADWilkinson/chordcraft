import OpenAI from 'openai'
import { kv } from '@vercel/kv'

// Check API key at start of the application
if (!process.env.OPENAI_API_KEY) {
  console.error(
    'OpenAI API key not configured, please follow instructions in README.md'
  )
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handleRequest(req, res) {
  const { id, progression: chords, style, key, history } = req.body || {}

  if (!id || !chords || !style || !key || !history) {
    res
      .status(400)
      .json({ error: { message: 'Please enter a valid userInput' } })
    return
  }

  try {
    const completion = await openai.chat.completions.create(
      generatePrompt(chords, style, key, history)
    )

    if (!completion.choices?.[0]?.message.content) {
      throw new Error('Unexpected response format from OpenAI API')
    }

    const parsed = parseAPIResponse(completion.choices[0].message.content)
    const dbEntity = { id, ...parsed }

    await kv.lpush('theory-' + chords.toString(), JSON.stringify(dbEntity))

    res
      .status(200)
      .json({
        ...dbEntity,
        input: generatePrompt(chords, style, key, history).messages,
      })
  } catch (error) {
    handleError(error, res)
  }
}

const generatePrompt = (chordProgression, style, key, history) => {
  return {
    model: 'gpt-4',
    messages: [
      ...history,
      {
        role: 'user',
        content: `Provide 3-5 detailed education points, with a focus on music theory around the suggested chord progression.

Context:
Chord Progression: ${chordProgression.toString()}
Style: ${style}
Key: ${key}

Respond only with a valid JSON object with the following data structure:
"""
{ 
  result: [
    { 
      "topic": string, 
      "explanation": string 
    },
    { 
      "topic": string, 
      "explanation": string 
    },
    { 
      "topic": string, 
      "explanation": string 
    },
  ] 
}
"""

Property definitions:
topic: property should be a single string representing the topic of the explanation. Do not exceed 50 characters.
explanation: property should be a well formatted single string representing the content of the topic. Do not exceed 100 words. 

Rules:
property names must be lowercase.
property names must be enclosed in double quotes.
property values must be enclosed in double quotes.
Trim any whitespace from the beginning and end of the string.
Make sure there is always an explanation for each topic. Both properties must be present.
Do not nest any other undefined objects within the JSON object.
Be Concise with your explanations and send no other text apart from the JSON object.


      Context:
      Chord Progression: ${chordProgression.toString()}
      Style: ${style}
      Key: ${key}
    `,
      },
    ],
    temperature: 0.8,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 2,
    presence_penalty: 2,
    stream: false,
  }
}

const parseAPIResponse = (content) => {
  let start = content.indexOf('{')
  let end = content.lastIndexOf('}') + 1
  console.log(content.substring(start, end))
  return JSON.parse(content.substring(start, end))
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
