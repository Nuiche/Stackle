/* app/api/share/route.tsx */
import { ImageResponse } from 'next/og'

export const runtime = 'edge' // required for ImageResponse

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = (searchParams.get('name') || 'Anon').slice(0, 18)
  const score = Number(searchParams.get('score') || 0)
  const mode  = (searchParams.get('mode') || 'endless').toUpperCase()
  const seed  = searchParams.get('seed') || ''   // optional
  const date  = searchParams.get('date') || ''   // optional daily key

  // Load a font once (Google-hosted Inter)
  const fontData = await fetch(
    'https://fonts.gstatic.com/s/inter/v12/UcCO3Fwr0bhZ5t_E2XkVOZ0.woff'
  ).then(r => r.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0f172a', // dark slate
          color: '#fff',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, marginBottom: 20 }}>LEXIT</div>
        <div style={{ fontSize: 48, marginBottom: 40 }}>
          {mode === 'DAILY' ? 'Daily Challenge' : 'Endless Mode'}
        </div>

        {seed && (
          <div
            style={{
              background: '#334155',
              padding: '16px 40px',
              borderRadius: 18,
              fontSize: 42,
              marginBottom: 30,
            }}
          >
            {seed}
          </div>
        )}

        <div style={{ fontSize: 56, marginBottom: 10 }}>
          {name}: {score}
        </div>

        {date && (
          <div style={{ fontSize: 28, opacity: 0.6 }}>({date})</div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 28,
            opacity: 0.45,
          }}
        >
          lexit.uno
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'no-store',
      },
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
