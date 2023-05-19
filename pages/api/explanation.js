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
    console.log(json)
    let parsed = JSON.parse(json)

    try {
      await kv.lpush('theory-' + chords.toString(), json)
    } catch (error) {
      console.error(error)
    }

    res.status(200).json({
      result: parsed.result,
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
  return `
Provide detailed education, with a focus on music theory around the suggested chord progression.

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
    }
  ] 
}
"""

Property definitions:
"topic": property should be a single string representing the topic of the explanation. Do not exceed 50 characters.
"explanation": property should be a well formatted single string representing the content of the topic. Do not exceed 100 words. 

Do not nest any other objects within the JSON object.
Do not use double quotes within the string values of the JSON object, only use single quotes.
Be Concise with your explanations and send no other text apart from the JSON object.
`
}
