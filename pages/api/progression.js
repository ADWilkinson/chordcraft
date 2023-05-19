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
  if (!req.body || !req.body.userInput) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid userInput',
      },
    })
    return
  }

  const userInput = req.body.userInput
  const prompt = generatePrompt(userInput)

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
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
    console.log(json);
    let parsed = JSON.parse(json)

    try {
      const list = await kv.lrange('genKeys', 0, -1)
      if (list.includes(parsed.result.toString())) {
        console.log('Key exists in KV, skipping DB write')
      } else {
        await kv.lpush('genKeys', parsed.result.toString())
      }

      let dbEntity = {
        progression: parsed.result,
        context: parsed.context,
        key: parsed.key,
        scale: parsed.scale,
        tempo: parsed.tempo,
        style: parsed.style,
      }

      if (parsed.strumming_pattern) {
        dbEntity.strumming_pattern = parsed.strumming_pattern
      }

      if (parsed.fingering) {
        dbEntity.fingering = parsed.fingering
      }

      await kv.lpush('progression-' + parsed.result.toString(), json)
      
    } catch (error) {
      console.error(error)
    }

    res.status(200).json({
      result: parsed,
      input: prompt,
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

function generatePrompt({ mood, style }) {
  return `Create a ${mood} chord progression in the style of ${style}.
Respond only with a valid JSON object with the following data structure:

Data structure:  { "result": string[], "context": string, "key": string, "scale": string, "tempo": string, "style": string, "tempo": string, "fingering": string, "strumming_pattern": string }

Here is a description of each property within the JSON object:

"result": an array of strings representing the chords within the progression formatted in the style of "Am" for "A minor".
"context": an interesting description of the chord progression provided as a single string.
"key": what key the chord progression is in as a single string.
"scale": what scale the chord progression is in as a single string.
"tempo": what tempo the chord progression should be played in as a single string.
"style": what style of music the chord progression is as a single string.
"fingering": an array of objects representing chord tabs with a property called 'chord' for the chord name and a property called 'tab' for the chord tab in the following string format "X-X-X-X-X-X"
"strumming_pattern": an example strumming pattern that could be used for the chord progression as a single string.

Be Concise with your explanations without repeating yourself, also send no other text apart from the JSON object.`
}
