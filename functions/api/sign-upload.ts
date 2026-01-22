// 簽名上傳 API - 需要認證
interface Env {
  R2_BUCKET: R2Bucket
  SESSION_KV: KVNamespace
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // 驗證用戶是否已登入
    const session = await verifySession(request, env)
    if (!session) {
      return json({ error: 'Unauthorized - Please login first' }, 401)
    }

    const body = await request.json() as {
      filename: string
      contentType: string
      size: number
    }

    if (!body.filename) {
      return json({ error: 'Missing filename' }, 400)
    }

    // 生成唯一的 key
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const safeFilename = body.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `uploads/${session.userId}/${timestamp}-${safeFilename}`

    // 生成預簽名 URL (有效期 1 小時)
    const uploadUrl = await env.R2_BUCKET.createMultipartUpload(key, {
      httpMetadata: {
        contentType: body.contentType || 'application/octet-stream',
      },
    })

    // 由於 R2 Multipart Upload 比較複雜，這裡我們改用簡單的方式
    // 直接返回一個簽名 URL 供前端使用
    
    // 實際上 R2 不直接支持預簽名 URL，所以我們返回端點讓前端上傳
    const url = new URL(request.url)
    const uploadEndpoint = `${url.origin}/api/upload-file?key=${encodeURIComponent(key)}`

    return json({
      uploadUrl: uploadEndpoint,
      key,
      contentType: body.contentType,
    })
  } catch (err) {
    console.error('Sign upload error:', err)
    return json({ error: (err as Error).message }, 500)
  }
}

