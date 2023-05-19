import { Configuration, OpenAIApi } from 'openai'
import { kv } from '@vercel/kv'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

if (!configuration.apiKey) {
  console.error(
    'OpenAI API key not configured, please follow instructions in README.md'
  )
  process.exit(1)
}

const openai = new OpenAIApi(configuration)

export default async function (req, res) {
  if (!req.body) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid request body',
      },
    })
    return
  }

  const chords = req.body.progression || null
  const style = req.body.style || null
  const key = req.body.key || null
  const history = req.body.history || null
  if (!chords || !style || !key || !history) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid userInput',
      },
    })
    return
  }

  const explanation = generateExplanation(chords, style, key)

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [...history, { role: 'user', content: explanation }],
      temperature: 0.8,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 2,
      presence_penalty: 2,
      stream: false,
    })

    if (
      !completion.data ||
      !completion.data.choices[0] ||
      !completion.data.choices[0].message.content
    ) {
      throw new Error('Unexpected response format from OpenAI API')
    }

    const content = completion.data.choices[0].message.content
    let start = content.indexOf('{')
    let end = content.lastIndexOf('}') + 1
    let json = content.substring(start, end)
    let parsed = JSON.parse(json)

    try {
      await kv.lpush('theory-' + chords.toString(), json)
    } catch (error) {
      console.error(error)
    }

    res.status(200).json({
      result: parsed,
      input: explanation,
    })

  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        },
      })
    }
  }
}

function generateExplanation(chordProgression, style, key) {
  return `Given we have the following ${style} chord progression in the key of ${key}.
  
Chord Progression:
${chordProgression.toString()}.

What information would be helpful to know about it?

Respond only with a JSON object with the following structure:

result: an array of objects with each having two properties of the type string, the properties are called "topic" and "explanation" and the content should be detailed information, with a focus the music theory.

Data structure: [{ "topic": string, "explanation": string }]

Your response message must be valid JSON with no other text above or below. Be Concise with your explanations and without repeating yourself.`
}
