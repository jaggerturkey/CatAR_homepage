// 認證相關 API 端點
interface Env {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  SESSION_KV: KVNamespace
}

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  id_token: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

// CORS headers
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  })
}

// OPTIONS 處理
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

// GET /api/auth?action=login - 獲取 Google OAuth URL
// GET /api/auth?action=callback&code=xxx - OAuth callback
// GET /api/auth?action=verify - 驗證當前 session
// POST /api/auth (action=logout) - 登出
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  try {
    if (action === 'login') {
      // 生成 Google OAuth URL
      const redirectUri = `${url.origin}/api/auth?action=callback`
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
      googleAuthUrl.searchParams.set('response_type', 'code')
      googleAuthUrl.searchParams.set('scope', 'openid email profile')
      googleAuthUrl.searchParams.set('access_type', 'online')

      return json({ url: googleAuthUrl.toString() })
    }

    if (action === 'callback') {
      // 處理 Google OAuth callback
      const code = url.searchParams.get('code')
      if (!code) {
        return json({ error: 'Missing authorization code' }, 400)
      }

      const redirectUri = `${url.origin}/api/auth?action=callback`

      // 交換 code 換取 token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        console.error('Token exchange failed:', error)
        return json({ error: 'Failed to exchange code for token' }, 400)
      }

      const tokenData: GoogleTokenResponse = await tokenResponse.json()

      // 獲取用戶資訊
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })

      if (!userInfoResponse.ok) {
        return json({ error: 'Failed to fetch user info' }, 400)
      }

      const userInfo: GoogleUserInfo = await userInfoResponse.json()

      // 創建 session
      const sessionId = crypto.randomUUID()
      const sessionData = {
        userId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        createdAt: Date.now(),
      }

      // 儲存到 KV (24 小時過期)
      await env.SESSION_KV.put(sessionId, JSON.stringify(sessionData), {
        expirationTtl: 86400,
      })

      // 重定向回前端，並帶上 session token
      const frontendUrl = new URL(url.origin)
      frontendUrl.searchParams.set('session', sessionId)
      frontendUrl.searchParams.set('login', 'success')

      return Response.redirect(frontendUrl.toString(), 302)
    }

    if (action === 'verify') {
      // 驗證 session
      const authHeader = request.headers.get('Authorization')
      const sessionId = authHeader?.replace('Bearer ', '')

      if (!sessionId) {
        return json({ authenticated: false }, 401)
      }

      const sessionData = await env.SESSION_KV.get(sessionId)
      if (!sessionData) {
        return json({ authenticated: false }, 401)
      }

      const session = JSON.parse(sessionData)
      return json({
        authenticated: true,
        user: {
          id: session.userId,
          email: session.email,
          name: session.name,
          picture: session.picture,
        },
      })
    }

    return json({ error: 'Invalid action' }, 400)
  } catch (err) {
    console.error('Auth error:', err)
    return json({ error: (err as Error).message }, 500)
  }
}

// POST /api/auth - 登出
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as { action?: string }

    if (body.action === 'logout') {
      const authHeader = request.headers.get('Authorization')
      const sessionId = authHeader?.replace('Bearer ', '')

      if (sessionId) {
        await env.SESSION_KV.delete(sessionId)
      }

      return json({ success: true })
    }

    return json({ error: 'Invalid action' }, 400)
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
}

