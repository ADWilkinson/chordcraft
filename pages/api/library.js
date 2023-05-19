import { kv } from '@vercel/kv'

export default async function (req, res) {
  try {
    const list = await kv.lrange('generationKeys', 0, -1)

    res.status(200).json({
      result: list,
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
