import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

// Main FastAPI backend
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
// AI Microservices
const POTENCIALIZADOR_URL = process.env.POTENCIALIZADOR_API_URL || 'http://127.0.0.1:8001';
const ROBO_URL = process.env.ROBO_API_URL || 'http://127.0.0.1:8002';
const CARTAODIGITAL_URL = process.env.CARTAODIGITAL_API_URL || 'http://127.0.0.1:8003';

async function proxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Initialize empty NextResponse just for getIronSession compatibility
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  const pathSegments = params.path;
  const pathParams = pathSegments.join('/');

  // --- Smart Routing for AI Microservices ---
  // Frontend calls: /api/proxy/services/potencializador/analyze
  // params.path = ["services", "potencializador", "analyze"]
  let targetUrl: URL;

  if (pathSegments[0] === 'services' && pathSegments[1] === 'potencializador') {
    // Strip "services/" → forward to potencializador microservice (port 8001)
    // e.g. ["services", "potencializador", "analyze"] → "/potencializador/analyze"
    const microPath = pathSegments.slice(1).join('/');
    targetUrl = new URL(`/${microPath}`, POTENCIALIZADOR_URL);
  } else if (pathSegments[0] === 'services' && pathSegments[1] === 'robo') {
    // Strip "services/" → forward to robo_ia microservice (port 8002)
    const microPath = pathSegments.slice(1).join('/');
    targetUrl = new URL(`/${microPath}`, ROBO_URL);
  } else if (pathSegments[0] === 'services' && pathSegments[1] === 'cardapiodigital') {
    // Strip "services/" → forward to cardapiodigital microservice (port 8003)
    const microPath = pathSegments.slice(1).join('/');
    targetUrl = new URL(`/${microPath}`, CARTAODIGITAL_URL);
  } else {
    // Default: forward to main FastAPI backend (port 8000)
    targetUrl = new URL(`/api/v1/${pathParams}`, BACKEND_URL);
  }

  // Forward search params
  targetUrl.search = request.nextUrl.search;

  console.log(
    `DEBUG PROXY: Request to ${targetUrl.toString()} | Method: ${request.method} | UserID: ${session.userId || 'none'}`,
  );

  const headers = new Headers(request.headers);
  // Remove original host to avoid conflicts
  headers.delete('host');

  // Inject the custom Auth header for all routes (microservices also validate this)
  if (session.userId) {
    headers.set('X-User-Id', session.userId);
  }

  try {
    // Read body as ArrayBuffer to avoid "detached ArrayBuffer" issues
    let requestBody: ArrayBuffer | undefined = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      requestBody = await request.arrayBuffer();
    }

    const backendResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: requestBody,
      redirect: 'follow',
    });

    const responseBody = await backendResponse.arrayBuffer();
    const proxyHeaders = new Headers(backendResponse.headers);

    // Remove content-encoding since fetch already decoded it
    proxyHeaders.delete('content-encoding');

    if (!backendResponse.ok) {
      const errorText = new TextDecoder().decode(responseBody);
      console.error(`DEBUG PROXY: Backend Error (${backendResponse.status}):`, errorText);
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: proxyHeaders,
    });
  } catch (error) {
    console.error('DEBUG PROXY: Fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        detail: String(error),
        url: targetUrl.toString(),
      },
      { status: 500 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
