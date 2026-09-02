import './App.css';
import Profile from './components/Profile';
import CV from './components/CV';
import Certificates from './components/Certificates';
import Gallery from './components/Gallery';
import { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import SharePage from './components/SharePage';
import ShareLinks from './components/ShareLinks';
import api, { assetUrl } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(sessionStorage.getItem('portfolio_admin_token')));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAdmin) return undefined;
    api.get('/profile')
      .then((res) => {
        if (res.data.status === 'success' && res.data.data) setProfile(res.data.data);
      })
      .catch(() => {});
    return undefined;
  }, [isAdmin]);

  const initials = (profile?.name?.trim() || 'Victor Mureti')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

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

  const pathname = window.location.pathname;
  const shareMatch = pathname.match(/^\/share\/([^/]+)/);
  if (shareMatch) return <SharePage token={decodeURIComponent(shareMatch[1])} />;
  if (pathname === '/admin') return <AdminLogin onLogin={login} />;

  // The main portfolio is private: it must not render until the session has
  // been authenticated with the admin token. This is a hard render guard —
  // the portfolio below is never mounted for unauthenticated visitors.
  if (!isAdmin) {
    return (
      <AdminLogin
        onLogin={login}
        eyebrow="Private portfolio"
        title="Access required"
        description="Enter your private access token to view this portfolio."
        labelText="Access token"
        buttonLabel="Unlock portfolio"
      />
    );
  }

  const navigation = [
    { id: 'profile', label: 'Profile' },
    { id: 'cv', label: 'CV & Experience' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'gallery', label: 'Gallery' },
    ...(isAdmin ? [{ id: 'share', label: 'Share Portfolio' }] : [])
  ];

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo-wrap">
            <div className="nav-avatar">
              {profile?.profile_image ? (
                <img src={assetUrl(profile.profile_image)} alt={profile.name || 'Profile'} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <h1 className="logo">Victor Mureti</h1>
          </div>
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
        {activeTab === 'share' && <ShareLinks />}
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
