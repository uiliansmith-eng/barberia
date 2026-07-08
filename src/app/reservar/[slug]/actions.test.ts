import { afterEach, describe, expect, it, vi } from "vitest";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

const { checkoutSessionsCreateMock } = vi.hoisted(() => ({
  checkoutSessionsCreateMock: vi.fn(),
}));
vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(() => ({
    checkout: { sessions: { create: checkoutSessionsCreateMock } },
  })),
}));

const { sendReminderEmailMock } = vi.hoisted(() => ({
  sendReminderEmailMock: vi.fn(async () => ({ status: "simulated" as const })),
}));
vi.mock("@/lib/reminders/email", () => ({
  sendReminderEmail: sendReminderEmailMock,
}));

type QueryResult = { data: unknown; error: unknown };

function makeAdminMock(config: {
  tenant?: QueryResult;
  owner?: QueryResult;
  userById?: QueryResult;
  appointmentsUpdate?: QueryResult;
}) {
  const updateCalls: { table: string; payload: unknown }[] = [];

  function makeBuilder(table: string) {
    const builder: {
      select: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      limit: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      single: ReturnType<typeof vi.fn>;
      maybeSingle: ReturnType<typeof vi.fn>;
      then: (onFulfilled: (value: QueryResult) => unknown) => unknown;
    } = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      update: vi.fn((payload: unknown) => {
        updateCalls.push({ table, payload });
        return builder;
      }),
      single: vi.fn(() =>
        Promise.resolve(
          table === "tenants"
            ? (config.tenant ?? { data: null, error: null })
            : { data: null, error: null }
        )
      ),
      maybeSingle: vi.fn(() =>
        Promise.resolve(
          table === "profiles"
            ? (config.owner ?? { data: null, error: null })
            : { data: null, error: null }
        )
      ),
      then: (onFulfilled) =>
        onFulfilled(
          table === "appointments"
            ? (config.appointmentsUpdate ?? { data: null, error: null })
            : { data: null, error: null }
        ),
    };
    return builder;
  }

  return {
    from: vi.fn((table: string) => makeBuilder(table)),
    auth: {
      admin: {
        getUserById: vi.fn(() =>
          Promise.resolve(
            config.userById ?? { data: { user: null }, error: null }
          )
        ),
      },
    },
    updateCalls,
  };
}

const { createAdminClientMock, adminMockState } = vi.hoisted(() => ({
  createAdminClientMock: vi.fn(),
  adminMockState: { current: null as ReturnType<typeof makeAdminMock> | null },
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

function setAdminMock(admin: ReturnType<typeof makeAdminMock>) {
  adminMockState.current = admin;
  createAdminClientMock.mockReturnValue(admin);
}

const { createPublicBooking } = await import("./actions");

const BASE_INPUT = {
  tenantId: "tenant-1",
  tenantSlug: "mi-barberia",
  barberId: "barber-1",
  serviceId: "service-1",
  date: "2026-07-20",
  time: "10:00",
  customerName: "Carlos Medina",
  customerPhone: "+34600000000",
  customerEmail: "carlos@example.com",
  notes: "",
};

const BOOKING_RESULT = {
  appointment_id: "appt-1",
  starts_at: "2026-07-20T10:00:00.000Z",
  ends_at: "2026-07-20T10:30:00.000Z",
  service_name: "Corte clásico",
  price: 18,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("createPublicBooking", () => {
  it("returns an error and never touches Stripe when the slot can't be booked", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "Ese horario ya no está disponible" } });
    setAdminMock(makeAdminMock({}));

    const result = await createPublicBooking(BASE_INPUT);

    expect(result).toEqual({ error: "Ese horario ya no está disponible" });
    expect(checkoutSessionsCreateMock).not.toHaveBeenCalled();
    expect(sendReminderEmailMock).not.toHaveBeenCalled();
  });

  it("creates the booking without a checkout session when the barbershop doesn't require online payment", async () => {
    rpcMock.mockResolvedValue({ data: BOOKING_RESULT, error: null });
    setAdminMock(
      makeAdminMock({
        tenant: {
          data: {
            stripe_account_id: null,
            stripe_charges_enabled: false,
            require_online_payment: false,
          },
          error: null,
        },
      })
    );

    const result = await createPublicBooking(BASE_INPUT);

    expect(result).toEqual({ data: BOOKING_RESULT, checkoutUrl: undefined });
    expect(checkoutSessionsCreateMock).not.toHaveBeenCalled();
  });

  it("doesn't create a checkout session if online payment is required but Stripe isn't connected yet", async () => {
    rpcMock.mockResolvedValue({ data: BOOKING_RESULT, error: null });
    setAdminMock(
      makeAdminMock({
        tenant: {
          data: {
            stripe_account_id: null,
            stripe_charges_enabled: false,
            require_online_payment: true,
          },
          error: null,
        },
      })
    );

    const result = await createPublicBooking(BASE_INPUT);

    expect(result).toEqual({ data: BOOKING_RESULT, checkoutUrl: undefined });
    expect(checkoutSessionsCreateMock).not.toHaveBeenCalled();
  });

  it("charges the customer through the barbershop's connected Stripe account when online payment is required", async () => {
    rpcMock.mockResolvedValue({ data: BOOKING_RESULT, error: null });
    const admin = makeAdminMock({
      tenant: {
        data: {
          stripe_account_id: "acct_connected_123",
          stripe_charges_enabled: true,
          require_online_payment: true,
        },
        error: null,
      },
      appointmentsUpdate: { data: null, error: null },
    });
    setAdminMock(admin);
    checkoutSessionsCreateMock.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });

    const result = await createPublicBooking(BASE_INPUT);

    expect(checkoutSessionsCreateMock).toHaveBeenCalledTimes(1);
    const call = checkoutSessionsCreateMock.mock.calls[0][0];

    // The connected barbershop's account receives the transfer — BarberOS
    // never becomes the merchant of record for the customer's payment.
    expect(call.payment_intent_data.transfer_data.destination).toBe(
      "acct_connected_123"
    );
    // Amount must be in cents and match the service price exactly.
    expect(call.line_items[0].price_data.unit_amount).toBe(1800);
    expect(call.line_items[0].price_data.currency).toBe("eur");
    expect(call.metadata.appointment_id).toBe("appt-1");

    expect(admin.updateCalls).toEqual([
      {
        table: "appointments",
        payload: {
          payment_status: "unpaid",
          stripe_checkout_session_id: "cs_test_123",
        },
      },
    ]);

    expect(result).toEqual({
      data: BOOKING_RESULT,
      checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_123",
    });
  });

  it("still returns the booking if creating the Stripe checkout session fails", async () => {
    rpcMock.mockResolvedValue({ data: BOOKING_RESULT, error: null });
    setAdminMock(
      makeAdminMock({
        tenant: {
          data: {
            stripe_account_id: "acct_connected_123",
            stripe_charges_enabled: true,
            require_online_payment: true,
          },
          error: null,
        },
      })
    );
    checkoutSessionsCreateMock.mockRejectedValue(new Error("Stripe is down"));

    const result = await createPublicBooking(BASE_INPUT);

    expect(result).toEqual({ data: BOOKING_RESULT, checkoutUrl: undefined });
  });
});
