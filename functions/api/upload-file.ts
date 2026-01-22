// 實際上傳檔案 API - 需要認證
interface Env {
  R2_BUCKET: R2Bucket
  SESSION_KV: KVNamespace
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
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

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

// 驗證 session
async function verifySession(request: Request, env: Env): Promise<any | null> {
  const authHeader = request.headers.get('Authorization')
  const sessionId = authHeader?.replace('Bearer ', '')

  if (!sessionId) return null

  const sessionData = await env.SESSION_KV.get(sessionId)
  if (!sessionData) return null

  return JSON.parse(sessionData)
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // 驗證用戶是否已登入
    const session = await verifySession(request, env)
    if (!session) {
      return json({ error: 'Unauthorized - Please login first' }, 401)
    }

    const url = new URL(request.url)
    const key = url.searchParams.get('key')

    if (!key) {
      return json({ error: 'Missing key parameter' }, 400)
    }

    // 確保 key 屬於該用戶
    if (!key.startsWith(`uploads/${session.userId}/`)) {
      return json({ error: 'Invalid key for this user' }, 403)
    }

    const contentType = request.headers.get('Content-Type') || 'application/octet-stream'
    const body = await request.arrayBuffer()

    // 上傳到 R2
    await env.R2_BUCKET.put(key, body, {
      httpMetadata: { contentType },
    })

    return json({ success: true, key })
  } catch (err) {
    console.error('Upload error:', err)
    return json({ error: (err as Error).message }, 500)
  }
}

