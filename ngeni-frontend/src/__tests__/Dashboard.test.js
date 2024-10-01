// src/__tests__/Dashboard.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import { removeToken, setToken } from "../utils/token";

describe("Dashboard", () => {
  beforeEach(() => {
    // Mock the token to simulate a logged-in user
    setToken("test-jwt-token");
  });

  afterEach(() => {
    removeToken(); // Clean up after each test
  });

  test("renders dashboard", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("handles logout", () => {
    const { getByRole } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(getByRole("button", { name: /logout/i }));

    // Check if user is redirected (you can verify by checking URL or some other method)
    expect(window.location.pathname).toBe("/");
  });
});
