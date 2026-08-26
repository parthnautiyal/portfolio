export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin, hookUrl } = req.body || {};
  const ADMIN_PIN = process.env.ADMIN_PIN || '1721';
  const VERCEL_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL || hookUrl;

  if (!pin || pin !== ADMIN_PIN) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication failed. Invalid admin PIN.' 
    });
  }

  if (!VERCEL_HOOK) {
    return res.status(400).json({
      success: false,
      error: 'No VERCEL_DEPLOY_HOOK_URL configured in Vercel environment variables or request body.'
    });
  }

  try {
    const deployRes = await fetch(VERCEL_HOOK, { method: 'POST' });
    if (deployRes.ok || deployRes.status === 201) {
      return res.status(200).json({
        success: true,
        status: deployRes.status,
        message: 'Vercel rebuild triggered successfully! Parth_Nautiyal_Resume.tex will be parsed and deployed live in ~60s.'
      });
    } else {
      const text = await deployRes.text().catch(() => '');
      return res.status(deployRes.status).json({
        success: false,
        error: `Vercel Deploy Hook returned HTTP ${deployRes.status}: ${text || deployRes.statusText}`
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Failed to invoke deploy hook: ${err.message}`
    });
  }
}
