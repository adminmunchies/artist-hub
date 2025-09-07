// app/api/checkout/route.ts
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan") ?? "unknown";
    return new Response(
      JSON.stringify({
        ok: true,
        message: "Checkout stub — integrate Stripe later.",
        plan,
      }),
      { headers: { "content-type": "application/json" } }
    );
  }
  