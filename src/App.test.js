import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Profile', () => () => <div>Profile content</div>);
jest.mock('./components/CV', () => () => <div>CV content</div>);
jest.mock('./components/Certificates', () => () => <div>Certificates content</div>);
jest.mock('./components/Gallery', () => () => <div>Gallery content</div>);

test('renders the portfolio navigation', () => {
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
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: buttonName }));

  expect(screen.getByText(sectionText)).toBeInTheDocument();
});
