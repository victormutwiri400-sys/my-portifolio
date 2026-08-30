import './App.css';
import Profile from './components/Profile';
import CV from './components/CV';
import Certificates from './components/Certificates';
import Gallery from './components/Gallery';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('profile');

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
          <ul className="nav-links">
            {navigation.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="content">
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'cv' && <CV />}
        {activeTab === 'certificates' && <Certificates />}
        {activeTab === 'gallery' && <Gallery />}
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Victor Mureti. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
