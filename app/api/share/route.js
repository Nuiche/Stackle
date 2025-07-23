import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function q(searchParams, key, fallback = '') {
  const v = searchParams.get(key)
  return v ? decodeURIComponent(v) : fallback
}

export function GET(req) {
  const { searchParams } = new URL(req.url)

  const name  = q(searchParams, 'name', 'Anon')
  const score = q(searchParams, 'score', '0')
  const mode  = q(searchParams, 'mode', 'endless')
  const date  = q(searchParams, 'date', '')

  const title = mode === 'daily' ? 'Daily Challenge' : 'Endless Mode'
  const bgTop = '#3BB2F6'
  const bgBot = '#10B981'
  const slate = '#334155'
  const soft  = '#F1F5F9'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(180deg, ${bgTop}, ${bgBot})`,
          padding: '60px',
          color: soft,
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ fontSize: 90, fontWeight: 700 }}>Lexit</div>
        <div style={{ marginTop: 12, fontSize: 36, opacity: 0.9 }}>
          {title}{date ? ` – ${date}` : ''}
        </div>

        <div
          style={{
            marginTop: 60,
            background: soft,
            color: slate,
            borderRadius: 24,
            padding: '40px 60px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 25px 40px rgba(0,0,0,.15)'
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>Score</div>
          <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 28, marginTop: 20 }}>by {name}</div>
        </div>

        <div style={{ marginTop: 'auto', fontSize: 28, opacity: 0.9 }}>
          Play at https://lexit.uno
        </div>
      </div>
    ),
    size
  )
}
