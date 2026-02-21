import { Outlet, Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary italic">AETHERIUM</Link>
          <div className="space-x-4">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/explore" className="hover:text-primary transition-colors">Explore</Link>
            <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
          </div>
        </div>
      </nav>
      
      <main className="grow container mx-auto">
        <Outlet />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 p-8">
        <div className="container mx-auto text-center text-slate-500 text-sm">
          &copy; 2026 Aethereum - Gamified AI Learning.
        </div>
      </footer>
    </div>
  );
}

export default App;
