export const onRequestGet: PagesFunction<{ R2_BUCKET: R2Bucket }> = async ({ env, request }) => {
  try {
    const url = new URL(request.url)
    const prefix = url.searchParams.get('prefix') || 'uploads/'
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


