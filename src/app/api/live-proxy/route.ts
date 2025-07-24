import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get('url');

  if (!streamUrl) {
    return NextResponse.json(
      { error: 'Missing stream URL parameter' },
      { status: 400 }
    );
  }

  try {
    // 验证URL是否为预期的直播流域名
    const allowedDomains = [
      'live-hls-web-aje.getaj.net',
      'static.france24.com',
      'f24hls-i.akamaihd.net',
      'news.cgtn.com',
      'live.cgtn.com',
      'cph-p2p-msl.akamaized.net',
      'bitdash-a.akamaihd.net'
    ];
    
    const urlObj = new URL(streamUrl);
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return NextResponse.json(
        { error: 'Unauthorized stream domain' },
        { status: 403 }
      );
    }

    // 代理请求到实际的直播流
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://live.fanmingming.com/',
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取内容类型
    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    
    // 读取响应体
    const body = await response.arrayBuffer();

    // 返回代理的响应
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Live stream proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy live stream' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}