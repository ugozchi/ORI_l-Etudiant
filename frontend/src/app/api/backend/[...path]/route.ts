import { NextRequest, NextResponse } from 'next/server';

function getBackendBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || '').trim();
  if (!raw) {
    throw new Error('Missing NEXT_PUBLIC_API_URL or BACKEND_URL');
  }
  return raw.replace(/\/+$/, '');
}

function buildTargetUrl(path: string[]): string {
  const base = getBackendBaseUrl();
  const joined = path.join('/');
  const normalizedJoined = base.endsWith('/api') && joined.startsWith('api/')
    ? joined.replace(/^api\//, '')
    : joined;
  return `${base}/${normalizedJoined}`;
}

async function forward(request: NextRequest, params: { path: string[] }) {
  try {
    const targetUrl = new URL(buildTargetUrl(params.path));
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    const auth = request.headers.get('authorization');

    if (contentType) headers.set('content-type', contentType);
    if (auth) headers.set('authorization', auth);

    const init: RequestInit = {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    };

    const backendRes = await fetch(targetUrl.toString(), init);
    const bodyText = await backendRes.text();
    return new NextResponse(bodyText, {
      status: backendRes.status,
      headers: {
        'content-type': backendRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        detail: error instanceof Error ? error.message : 'Proxy error',
      },
      { status: 500 }
    );
  }
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return forward(request, await params);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return forward(request, await params);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return forward(request, await params);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return forward(request, await params);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return forward(request, await params);
}
