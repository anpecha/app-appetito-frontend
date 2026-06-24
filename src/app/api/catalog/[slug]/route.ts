import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Rota pública para o cardápio digital do cliente.
 * Não exige sessão — qualquer visitante pode acessar.
 * O BACKEND_URL é uma variável servidor (sem NEXT_PUBLIC_) para não expor o backend ao browser.
 */
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/v1/catalog/public/${encodeURIComponent(params.slug)}`,
      { next: { revalidate: 30 } }, // cache 30s no edge
    );

    const data = await res.arrayBuffer();
    const headers = new Headers(res.headers);
    headers.delete('content-encoding');

    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
