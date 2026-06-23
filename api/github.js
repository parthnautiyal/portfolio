export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { username = 'parthnautiyal' } = req.query

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'portfolio-app',
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=50`,
      { headers }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'GitHub API error' })
    }

    // Cache for 5 minutes at CDN level
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch GitHub repos' })
  }
}
