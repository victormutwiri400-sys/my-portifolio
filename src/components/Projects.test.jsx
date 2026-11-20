import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Projects from "./Projects";
import api, { publicApi } from "../api";

jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  publicApi: { get: jest.fn() },
  assetUrl: jest.fn((path) => path),
  getRequestError: jest.fn((_error, fallback) => fallback),
}));

const sampleProject = {
  id: 8,
  title: "Hotel Management System",
  description: "A featured hotel booking and operations project.",
  category: "Full-Stack Development",
  technologies: ["React", "Flask", "MySQL"],
  project_url: "https://example.com/hotel",
  github_url: "https://github.com/example/hotel",
  image_url: "https://images.example.com/hotel.jpg",
  is_featured: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: { status: "success", data: [sampleProject] } });
  publicApi.get.mockResolvedValue({ data: { status: "success", data: [sampleProject] } });
});

test("public visitors can see project links but no management controls", async () => {
  render(<Projects isAdmin={false} />);

  expect(await screen.findByRole("heading", { name: "Hotel Management System" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /view project/i })).toHaveAttribute("href", sampleProject.project_url);
  expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", sampleProject.github_url);
  expect(screen.queryByRole("button", { name: /add project|edit|delete/i })).not.toBeInTheDocument();
  expect(publicApi.get).toHaveBeenCalledWith("/projects");
  expect(api.get).not.toHaveBeenCalled();
});

test("administrators can add a project which appears after the API refresh", async () => {
  api.post.mockResolvedValue({ data: { status: "success" } });
  api.get.mockResolvedValueOnce({ data: { status: "success", data: [] } });
  api.get.mockResolvedValueOnce({ data: { status: "success", data: [sampleProject] } });
  render(<Projects isAdmin />);

  fireEvent.click(await screen.findByRole("button", { name: /add project/i }));
  fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: sampleProject.title } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: sampleProject.description } });
  fireEvent.change(screen.getByLabelText(/live project url/i), { target: { value: sampleProject.project_url } });
  fireEvent.change(screen.getByLabelText(/github repository url/i), { target: { value: sampleProject.github_url } });
  fireEvent.click(screen.getByRole("button", { name: "Add Project", exact: true }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/projects", expect.any(FormData), expect.objectContaining({
    headers: { "Content-Type": "multipart/form-data" },
  })));
  expect(await screen.findByRole("heading", { name: sampleProject.title })).toBeInTheDocument();
});

test("invalid project URL prevents submission", async () => {
  render(<Projects isAdmin />);
  fireEvent.click(await screen.findByRole("button", { name: /add project/i }));
  fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: "Example" } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Description" } });
  fireEvent.change(screen.getByLabelText(/live project url/i), { target: { value: "javascript:alert(1)" } });

  fireEvent.click(screen.getByRole("button", { name: "Add Project", exact: true }));

  expect(api.post).not.toHaveBeenCalled();
});

test("administrators can edit a project and delete it without reloading the page", async () => {
  api.put.mockResolvedValue({ data: { status: "success" } });
  api.delete.mockResolvedValue({ data: { status: "success" } });
  api.get.mockResolvedValueOnce({ data: { status: "success", data: [sampleProject] } });
  api.get.mockResolvedValueOnce({ data: { status: "success", data: [{ ...sampleProject, title: "Updated hotel system" }] } });
  render(<Projects isAdmin />);

  fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
  expect(screen.getByLabelText(/live project url/i)).toHaveValue(sampleProject.project_url);
  fireEvent.change(screen.getByLabelText(/project title/i), { target: { value: "Updated hotel system" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByRole("heading", { name: "Updated hotel system" })).toBeInTheDocument();
  expect(api.put).toHaveBeenCalledWith("/projects/8", expect.any(FormData), expect.any(Object));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(screen.getByRole("dialog", { name: "Delete project" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Delete project" }));

  await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/projects/8"));
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Updated hotel system" })).not.toBeInTheDocument());
});
