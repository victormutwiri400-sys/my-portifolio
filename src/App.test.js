import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import api from './api';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  assetUrl: jest.fn((path) => path),
}));
jest.mock('./components/Profile', () => () => <div>Profile content</div>);
jest.mock('./components/CV', () => () => <div>CV content</div>);
jest.mock('./components/Certificates', () => () => <div>Certificates content</div>);
jest.mock('./components/Gallery', () => () => <div>Gallery content</div>);
jest.mock('./components/SharePage', () => () => <div>Share page content</div>);
jest.mock('./components/ShareLinks', () => () => <div>Share links content</div>);

beforeEach(() => {
  api.get.mockResolvedValue({ data: { status: 'success', data: null } });
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  window.sessionStorage.removeItem('portfolio_admin_token');
});

const authenticate = () => window.sessionStorage.setItem('portfolio_admin_token', 'secret-token');

test('shows the private access gate at / when there is no session auth', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /access required/i })).toBeInTheDocument();
  expect(screen.getByText(/enter your private access token/i)).toBeInTheDocument();
  // The private portfolio must not render behind the gate.
  expect(screen.queryByText(/profile content/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /victor mureti/i })).not.toBeInTheDocument();
});

test('renders the portfolio navigation for an authenticated session', () => {
  authenticate();
  render(<App />);

  expect(screen.getByRole('heading', { name: /victor mureti/i })).toBeInTheDocument();
  expect(screen.getByText(/profile content/i)).toBeInTheDocument();
});

test.each([
  ['CV & Experience', /cv content/i],
  ['Certificates', /certificates content/i],
  ['Gallery', /gallery content/i],
  ['Profile', /profile content/i],
])('shows the correct section when %s is selected', (buttonName, sectionText) => {
  authenticate();
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: buttonName }));

  expect(screen.getByText(sectionText)).toBeInTheDocument();
});

test('renders the public share page at /share/:token without admin auth', () => {
  window.history.pushState({}, '', '/share/abc123');
  render(<App />);

  expect(screen.getByText(/share page content/i)).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /access required/i })).not.toBeInTheDocument();
});

test('navigating from a share page to / asks for access instead of leaking the portfolio', () => {
  window.history.pushState({}, '', '/share/abc123');
  const { unmount } = render(<App />);
  expect(screen.getByText(/share page content/i)).toBeInTheDocument();

  // A share visit never stores an admin token, so landing on / afterwards
  // must return to the access gate, not the private portfolio.
  unmount();
  window.history.pushState({}, '', '/');
  render(<App />);

  expect(screen.getByRole('heading', { name: /access required/i })).toBeInTheDocument();
  expect(screen.queryByText(/profile content/i)).not.toBeInTheDocument();
});

test('shows the Share Portfolio tab and section for admins', () => {
  authenticate();
  render(<App />);

  const shareTab = screen.getByRole('button', { name: /share portfolio/i });
  fireEvent.click(shareTab);

  expect(screen.getByText(/share links content/i)).toBeInTheDocument();
});
