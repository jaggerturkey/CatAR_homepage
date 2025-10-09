export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export const onRequestPost: PagesFunction<{ R2_BUCKET: R2Bucket }> = async ({ request, env }) => {
  try {
    const url = new URL(request.url)
    const explicitKey = url.searchParams.get('key') || undefined
    const contentType = request.headers.get('content-type') || ''

    // multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file') as File | null
      if (!file) {
        return json({ error: 'Missing file field' }, 400)
      }
      const key = explicitKey || generateKey(file.name)
      await env.R2_BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' },
      })
      return json({ key }, 200)
    }

    // raw binary/stream body
    const key = explicitKey || generateKey('upload.bin')
    const body = await request.arrayBuffer()
    const type = request.headers.get('content-type') || 'application/octet-stream'
    await env.R2_BUCKET.put(key, body, { httpMetadata: { contentType: type } })
    return json({ key }, 200)
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
}

function generateKey(filename: string): string {
  const ts = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `uploads/${ts}-${safe}`
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

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }
}


