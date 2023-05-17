import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          'OpenAI API key not configured, please follow instructions in README.md',
      },
    })
    return
  }

  const chords = req.body.progression || null
  const style = req.body.style || null
  const key = req.body.key || null
  const history = req.body.history || null
  if ((chords === null || style === null || key === null, history === null)) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid userInput',
      },
    })
    return
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...history,
        { role: 'user', content: generateExplanation(chords, style, key) },
      ],
      temperature: 0.8,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 2,
      presence_penalty: 2,
      stream: false,
    })

    const content = completion.data.choices[0].message.content
    let start = content.indexOf('{')
    let end = content.lastIndexOf('}') + 1
    let json = content.substring(start, end)

    res.status(200).json({
      result: json,
      input: generateExplanation(chords, style, key),
    })
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
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
  
Chord Progression: ${chordProgression}.

What information would be helpful to know about it?

Respond only with a JSON object with the following structure.

result: an array of objects with two string properties, "topic" and "explanation".

Your response message must be valid JSON with no other text above or below.`
}
