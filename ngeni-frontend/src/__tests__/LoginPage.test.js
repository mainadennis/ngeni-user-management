// src/__tests__/LoginPage.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import LoginPage from "../components/LoginPage";
import { LOGIN_USER } from "../graphql/mutations";

const mocks = [
  {
    request: {
      query: LOGIN_USER,
      variables: { email: "test@example.com", password: "password123" },
    },
    result: {
      data: {
        login: {
          token: "test-jwt-token",
        },
      },
    },
  },
];

describe("LoginPage", () => {
  // Mock window.alert before each test
  beforeEach(() => {
    window.alert = jest.fn(); // Mock window.alert
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear any previous mocks
  });

  test("renders login form", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("submits login form", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for the success message to appear
    const successMessage = await screen.findByText(/login successful/i, {
      exact: false,
    });
    expect(successMessage).toBeInTheDocument();
  });
});
