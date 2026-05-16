/**
 * Tests for Appointments component
 * Issue #20: Broken navigation paths must route to the real patient dashboard routes.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, Routes, Route } from 'react-router-dom';
import Appointments from '../components/Appointments';

// Mock the api module factory — avoids loading axios (ESM)
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Import AFTER the mock so we get the mocked version
import api from '../services/api';

// Helper: captures the current router location
const LocationDisplay = () => {
  const loc = useLocation();
  return <div data-testid="current-path">{loc.pathname}</div>;
};

// Helper: renders Appointments wrapped in a MemoryRouter + location display
const renderAppointments = (apiData = []) => {
  api.get.mockResolvedValue({ data: apiData });

  return render(
    <MemoryRouter initialEntries={['/appointments']}>
      <Routes>
        <Route path="*" element={<Appointments />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );
};

beforeEach(() => {
  // Mock localStorage
  const store = { user: JSON.stringify({ id: 1, role: 'PATIENT' }) };
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key) => store[key] ?? null
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ── Issue #20: Pay Now must navigate to /patient/dashboard/pay/:id ──

test('Pay Now button navigates to /patient/dashboard/pay/:id', async () => {
  const { findByText, getByTestId } = renderAppointments([
    {
      id: 55,
      doctorId: 2,
      appointmentDate: '2026-06-01',
      appointmentTime: '10:00',
      status: 'ACCEPTED',
    },
  ]);

  const payBtn = await findByText(/Pay Now/i);
  fireEvent.click(payBtn);

  await waitFor(() => {
    expect(getByTestId('current-path').textContent).toBe(
      '/patient/dashboard/pay/55'
    );
  });
});

// ── Issue #20: Join Video must navigate to /patient/dashboard/consult/:id ──

test('Join Video button navigates to /patient/dashboard/consult/:id', async () => {
  const { findByText, getByTestId } = renderAppointments([
    {
      id: 55,
      doctorId: 2,
      appointmentDate: '2026-06-01',
      appointmentTime: '10:00',
      status: 'ACCEPTED',
    },
  ]);

  const videoBtn = await findByText(/Join Video/i);
  fireEvent.click(videoBtn);

  await waitFor(() => {
    expect(getByTestId('current-path').textContent).toBe(
      '/patient/dashboard/consult/55'
    );
  });
});

// ── Issue #20: Empty-state "Book" button must NOT navigate to broken /dashboard/book-appointment ──

test('empty-state Book button navigates to /patient/dashboard/doctors', async () => {
  const { findByText, getByTestId } = renderAppointments([]);

  const bookBtn = await findByText(/Book your first appointment/i);
  fireEvent.click(bookBtn);

  await waitFor(() => {
    const path = getByTestId('current-path').textContent;
    expect(path).toBe('/patient/dashboard/doctors');
    expect(path).not.toBe('/dashboard/book-appointment');
  });
});

// ── Basic render: shows appointment count subtitle ──

test('renders appointment count correctly', async () => {
  const { findByText } = renderAppointments([
    { id: 1, doctorId: 2, appointmentDate: '2026-06-01', appointmentTime: '10:00', status: 'PENDING' },
    { id: 2, doctorId: 3, appointmentDate: '2026-06-02', appointmentTime: '11:00', status: 'CONFIRMED' },
  ]);

  await findByText(/2 appointments found/i);
});
