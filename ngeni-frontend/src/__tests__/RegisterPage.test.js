// src/__tests__/RegisterPage.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import RegisterPage from "../components/RegisterPage";
import { REGISTER_USER } from "../graphql/mutations";

const mocks = [
  {
    request: {
      query: REGISTER_USER,
      variables: { email: "test@example.com", password: "password123" },
    },
    result: {
      data: {
        register: "Registration successful, verify your email",
      },
    },
  },
];

describe("RegisterPage", () => {
  // Mock window.alert before each test
  beforeEach(() => {
    window.alert = jest.fn(); // Mock window.alert
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear any previous mocks
  });

  test("renders registration form", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("submits registration form", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    const successMessage = await screen.findByText(/registration successful/i);
    expect(successMessage).toBeInTheDocument();
  });
});
