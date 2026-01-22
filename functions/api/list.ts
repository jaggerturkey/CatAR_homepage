interface Env {
  R2_BUCKET: R2Bucket
  SESSION_KV: KVNamespace
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

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    // 驗證用戶是否已登入
    const session = await verifySession(request, env)
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Please login first' }), {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    const url = new URL(request.url)
    // 只列出該用戶的檔案
    const prefix = `uploads/${session.userId}/`
    const limit = Number(url.searchParams.get('limit') || 100)

    const listed = await env.R2_BUCKET.list({ prefix, limit })
    const items = listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      httpEtag: obj.httpEtag,
    }))
    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}


