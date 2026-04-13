import './App.css'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Admin Platform</h1>
        <p>Multi-tenant content management system</p>
      </header>

      <main>
        <section>
          <h2>Getting Started</h2>
          <p>Dashboard UI coming soon...</p>
          <div className="status">
            <p>✓ Backend: <code>http://localhost:3000</code></p>
            <p>✓ Dashboard: <code>http://localhost:5173</code></p>
            <p>Next: Implement authentication</p>
          </div>
        </section>
      </main>
    </div>
  )
}