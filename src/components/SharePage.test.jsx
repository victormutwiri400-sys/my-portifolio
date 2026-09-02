import { render, screen, waitFor } from "@testing-library/react";
import SharePage from "./SharePage";
import { publicApi } from "../api";

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("./Profile", () => () => <div>Profile content</div>);
jest.mock("./CV", () => () => <div>CV content</div>);
jest.mock("./Certificates", () => () => <div>Certificates content</div>);
jest.mock("./Gallery", () => () => <div>Gallery content</div>);

afterEach(() => {
  jest.restoreAllMocks();
});

test("shows a checking state while the link is being validated", () => {
  jest.spyOn(publicApi, "get").mockImplementation(() => new Promise(() => {}));

  render(<SharePage token="abc123" />);

  expect(screen.getByText("Checking portfolio link...")).toBeInTheDocument();
});

test("validates a token and renders the public portfolio", async () => {
  jest.spyOn(publicApi, "get").mockResolvedValue({ data: { status: "success" } });

  render(<SharePage token="abc123" />);

  expect(await screen.findByText("Profile content")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /certificates/i })).toBeInTheDocument();
  // No admin controls on the shared page.
  expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
  // The shared page is private — no way back to the full portfolio.
  expect(screen.queryByText(/view full portfolio/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /portfolio/i })).not.toBeInTheDocument();
  expect(publicApi.get).toHaveBeenCalledWith("/share-links/abc123");
});

test("shows a 404 message for an unknown token with no way back home", async () => {
  jest
    .spyOn(publicApi, "get")
    .mockRejectedValue({ response: { status: 404 } });

  render(<SharePage token="missing" />);

  expect(await screen.findByText("Portfolio Link Not Found")).toBeInTheDocument();
  expect(screen.getByText("This portfolio sharing link does not exist.")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /go to portfolio/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /portfolio/i })).not.toBeInTheDocument();
});

test("shows an expired message for a 410 response", async () => {
  jest
    .spyOn(publicApi, "get")
    .mockRejectedValue({ response: { status: 410 } });

  render(<SharePage token="old" />);

  expect(await screen.findByText("Portfolio Link Expired")).toBeInTheDocument();
  expect(screen.getByText("This portfolio sharing link has expired.")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /go to portfolio/i })).not.toBeInTheDocument();
});

test("shows a disabled message for a 403 response", async () => {
  jest
    .spyOn(publicApi, "get")
    .mockRejectedValue({ response: { status: 403 } });

  render(<SharePage token="revoked" />);

  expect(await screen.findByText("Portfolio Link Disabled")).toBeInTheDocument();
  expect(
    screen.getByText("This portfolio sharing link is no longer available.")
  ).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /go to portfolio/i })).not.toBeInTheDocument();
});

test("handles network errors gracefully", async () => {
  jest.spyOn(publicApi, "get").mockRejectedValue({});

  render(<SharePage token="abc" />);

  expect(await screen.findByText("Unable to Check This Link")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
});