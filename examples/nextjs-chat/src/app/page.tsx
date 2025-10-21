import Chat from '@/components/Chat'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}>
            Uni AI Chat
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
          }}>
            Secure. Portable. Open.
          </p>
        </header>

        <Chat />

        <footer style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#999',
        }}>
          <p>
            Built with{' '}
            <a
              href="https://github.com/uni-ai/sdk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              Uni AI SDK
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
