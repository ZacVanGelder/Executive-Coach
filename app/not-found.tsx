export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>Page not found</p>
      <a href="/" style={{ color: '#6366f1', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
        ← Back to your schedule
      </a>
    </div>
  )
}
