import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ShareLinks from "./ShareLinks";
import api from "../api";

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const activeLink = {
  id: 1,
  token: "tok-active",
  expires_at: "2099-01-01T00:00:00",
  created_at: "2026-01-01T00:00:00",
  is_active: true,
  status: "active",
  share_path: "/share/tok-active",
};

const expiredLink = {
  id: 2,
  token: "tok-expired",
  expires_at: "2020-01-01T00:00:00",
  created_at: "2020-01-01T00:00:00",
  is_active: true,
  status: "expired",
  share_path: "/share/tok-expired",
};

const disabledLink = {
  id: 3,
  token: "tok-disabled",
  expires_at: "2026-01-01T00:00:00",
  created_at: "2030-01-01T00:00:00",
  is_active: false,
  status: "disabled",
  share_path: "/share/tok-disabled",
};

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders share links with statuses and actions", async () => {
  jest
    .spyOn(api, "get")
    .mockResolvedValue({ data: { status: "success", data: [activeLink, expiredLink, disabledLink] } });

  render(<ShareLinks />);

  expect(await screen.findByText(/\/share\/tok-active/)).toBeInTheDocument();
  expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  expect(screen.getByText("EXPIRED")).toBeInTheDocument();
  expect(screen.getByText("DISABLED")).toBeInTheDocument();
  // Disable action appears only for active links.
  expect(screen.getAllByRole("button", { name: /^disable link$/i })).toHaveLength(1);
  // Delete (permanent) appears for every link.
  expect(screen.getAllByRole("button", { name: /^delete$/i })).toHaveLength(3);
  // Copy buttons appear for every link.
  expect(screen.getAllByRole("button", { name: /^copy$/i })).toHaveLength(3);
});

test("creates a share link with a future expiry and shows the generated URL", async () => {
  jest.spyOn(api, "get").mockResolvedValue({ data: { status: "success", data: [] } });
  jest.spyOn(api, "post").mockResolvedValue({
    data: {
      status: "success",
      data: {
        id: 4,
        token: "tok-new",
        expires_at: "2099-12-31T20:59:00Z",
        share_path: "/share/tok-new",
      },
    },
  });

  render(<ShareLinks />);

  fireEvent.click(await screen.findByRole("button", { name: /create share link/i }));
  fireEvent.change(screen.getByLabelText(/expiry date/i), { target: { value: "2099-12-31" } });
  fireEvent.change(screen.getByLabelText(/expiry time/i), { target: { value: "23:59" } });
  fireEvent.click(screen.getByRole("button", { name: /create link$/i }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/share-links", expect.any(Object)));
  const sent = api.post.mock.calls[0][1].expires_at;
  // Backend accepts plain YYYY-MM-DDTHH:MM:SS (UTC). No Z suffix is sent.
  expect(sent).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  expect(new Date(sent + "Z").getUTCFullYear()).toBe(2099);

  expect(await screen.findByText(/\/share\/tok-new/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /copy link$/i })).toBeInTheDocument();
});

test("rejects an expiry in the past without calling the API", async () => {
  jest.spyOn(api, "get").mockResolvedValue({ data: { status: "success", data: [] } });
  const postSpy = jest.spyOn(api, "post");

  render(<ShareLinks />);

  fireEvent.click(await screen.findByRole("button", { name: /create share link/i }));
  fireEvent.change(screen.getByLabelText(/expiry date/i), { target: { value: "2020-01-01" } });
  fireEvent.click(screen.getByRole("button", { name: /create link$/i }));

  await waitFor(() => expect(postSpy).not.toHaveBeenCalled());
});

test("disables a share link after confirmation", async () => {
  jest.spyOn(api, "get").mockResolvedValue({ data: { status: "success", data: [activeLink] } });
  jest.spyOn(api, "delete").mockResolvedValue({ data: { status: "success" } });

  render(<ShareLinks />);

  fireEvent.click(await screen.findByRole("button", { name: /^disable link$/i }));
  fireEvent.click(screen.getByRole("button", { name: /^disable$/i }));

  await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/share-links/1"));
});

test("permanently deletes a share link after confirmation", async () => {
  jest.spyOn(api, "get").mockResolvedValue({ data: { status: "success", data: [expiredLink] } });
  jest.spyOn(api, "delete").mockResolvedValue({ data: { status: "success" } });

  render(<ShareLinks />);

  fireEvent.click(await screen.findByRole("button", { name: /^delete$/i }));
  fireEvent.click(screen.getByRole("button", { name: /^delete share link$/i }));

  await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/share-links/2/delete"));
});