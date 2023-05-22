import { kv } from '@vercel/kv'

export default async function handleRequest(req, res) {
  const { generationKey: key } = req.query || {}

  if (!key) {
    res
      .status(400)
      .json({ error: { message: 'Please provide a valid generationKey' } })
    return
  }

  try {
    const normalizedKey = key.replace('-sharp-', '#')
    const progression = await kv.lrange('progression-' + normalizedKey, 0, -1)
    const explanation = await kv.lrange('theory-' + normalizedKey, 0, -1)

    const result = { progression, explanation }
    console.log({ result })

    res.status(200).json({ result })
  } catch (error) {
    handleError(error, res)
  }
}

const handleError = (error, res) => {
  if (error.response) {
    console.error(error.response.status, error.response.data)
    res.status(error.response.status).json(error.response.data)
  } else {
    console.error(`Error with request: ${error.message}`)
    res
      .status(500)
      .json({ error: { message: 'An error occurred during your request.' } })
  }
}
