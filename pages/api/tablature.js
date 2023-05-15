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

  const chords = req.body.generatedChords || null
  if (chords === null) {
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
      messages: [{ role: 'user', content: generateGuitarTab(chords) }],
      temperature: 0.2,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
    })
    res.status(200).json({ result: completion.data.choices[0].message.content })
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

function generateGuitarTab(chordProgression) {
  return `Using the following string array that represents a chord progression, represent it in text-based guitar tablature.

Chord Progression: ${chordProgression.toString()}.

Return as a JSON object with the following properties:

result: an array of objects that represent each chord. 

Each object within the array should have the properties:

chord: the name of the chord.
tab: the tablature representation of the chord as a single string in the following format: 'X-X-X-X-X-X', with X representing the string number.`
}

