import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/ai-chat/{restaurantId}
 * Server-side SSE proxy for the LangGraph AI chat endpoint.
 * Keeps the backend URL hidden from the browser.
 */
export async function POST(request: NextRequest, { params }: { params: { restaurantId: string } }) {
  const body = await request.text();

  let backendRes: Response;
  try {
    backendRes = await fetch(
      `${BACKEND_URL}/api/v1/ai/chat/${encodeURIComponent(params.restaurantId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      },
    );
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }

  if (!backendRes.ok) {
    const errText = await backendRes.text();
    return new NextResponse(errText, { status: backendRes.status });
  }

  // Pipe the SSE stream through to the client
  return new NextResponse(backendRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
