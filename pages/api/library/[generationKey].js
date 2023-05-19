import { kv } from '@vercel/kv'

export default async function (req, res) {
  const { generationKey } = req.query

  const key = generationKey

  try {
    const progression = await kv.hget(
      'p-' + key.replace('-sharp-', '#'),
      'generation'
    )
    const explanation = await kv.hget(
      'e-' + key.replace('-sharp-', '#'),
      'generation'
    )
    res.status(200).json({
      result: {
        progression: progression,
        explanation: explanation,
      },
    })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        },
      })
    }
  }
}
