import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';
import CV from './CV';
import Certificates from './Certificates';
import Gallery from './Gallery';
import api from '../api';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  assetUrl: jest.fn((path) => path),
  getRequestError: jest.fn(() => 'Request failed'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { status: 'success', data: [] } });
});

test('profile edit button opens and cancel button closes the profile form', async () => {
  render(<Profile isAdmin />);
  const editButton = await screen.findByRole('button', { name: /edit profile/i });

  fireEvent.click(editButton);
  expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
  expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
});

test('CV filters and add/cancel buttons change the interface', async () => {
  render(<CV isAdmin />);
  await waitFor(() => expect(api.get).toHaveBeenCalledWith('/cv-entries'));

  fireEvent.click(screen.getByRole('button', { name: /experience/i }));
  expect(screen.getByRole('button', { name: /experience/i })).toHaveClass('active');

  fireEvent.click(screen.getByRole('button', { name: /add entry/i }));
  expect(screen.getByRole('button', { name: /^add entry$/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
  expect(screen.queryByText(/organization\/institution/i)).not.toBeInTheDocument();
});

test.each([
  ['certificate upload', Certificates, 'Upload Certificate'],
  ['gallery upload', Gallery, 'Upload Photo'],
])('%s button opens a form and its cancel button closes it', async (_name, Component, submitLabel) => {
  render(<Component isAdmin />);
  const uploadButton = await screen.findByRole('button', { name: /^\+ upload/i });

  fireEvent.click(uploadButton);
  expect(screen.getByRole('button', { name: new RegExp(`^${submitLabel}$`, 'i') })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
  expect(screen.queryByRole('button', { name: new RegExp(`^${submitLabel}$`, 'i') })).not.toBeInTheDocument();
});
