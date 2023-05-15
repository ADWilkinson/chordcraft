import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const userInput = req.body.userInput || null;
  if (userInput === null) {
    res.status(400).json({
      error: {
        message: "Please enter a valid userInput",
      },
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: generatePrompt(userInput) }],
    });
    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt({ mood, style, instrument }) {
  return `Create me a ${mood} chord progression playable on ${instrument} in the style of ${style}.

Respond only with a JSON object with the following properties:

result: an array of strings representing the chords within the progression.
context: a description of the chord progression provided.
key: what key the chord progression is in.
scale: what scale the chord progression is in.
tempo: what tempo the chord progression should be played.
style: what style of the chord progression is.

Add any other meaningful properties that might also be relevant to the JSON object.`;
}
