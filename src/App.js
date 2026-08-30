import './App.css';
import Profile from './components/Profile';
import CV from './components/CV';
import Certificates from './components/Certificates';
import Gallery from './components/Gallery';
import { useState } from 'react';
import AdminLogin from './components/AdminLogin';

function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(sessionStorage.getItem('portfolio_admin_token')));

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const login = (token) => {
    sessionStorage.setItem('portfolio_admin_token', token);
    setIsAdmin(true);
    window.history.replaceState({}, '', '/');
  };

  const logout = () => {
    sessionStorage.removeItem('portfolio_admin_token');
    setIsAdmin(false);
  };

  if (window.location.pathname === '/admin') return <AdminLogin onLogin={login} />;

  const navigation = [
    { id: 'profile', label: 'Profile' },
    { id: 'cv', label: 'CV & Experience' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'gallery', label: 'Gallery' }
  ];

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">Victor Mureti</h1>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navigation.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => selectTab(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            {isAdmin && <li><button className="nav-btn" onClick={logout}>Sign out</button></li>}
          </ul>
        </div>
      </nav>

      <main className="content">
        {activeTab === 'profile' && <Profile isAdmin={isAdmin} />}
        {activeTab === 'cv' && <CV isAdmin={isAdmin} />}
        {activeTab === 'certificates' && <Certificates isAdmin={isAdmin} />}
        {activeTab === 'gallery' && <Gallery isAdmin={isAdmin} />}
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} Victor Mureti. All rights reserved.
          {!isAdmin && <a className="admin-link" href="/admin">Admin</a>}
        </p>
      </footer>
    </div>
  );
}

export default App;
