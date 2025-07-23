import { NextRequest, NextResponse } from 'next/server';

import { config as runtimeConfig } from '@/lib/runtime';

export interface LiveStream {
  name: string;
  url: string;
  logo: string;
}

export interface LiveCategory {
  [categoryName: string]: LiveStream[];
}

// 获取直播频道列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 直接从 runtime config 读取直播流数据
    const liveStreams = (runtimeConfig as any).live_streams || {};

    if (category) {
      // 返回指定分类的频道
      const channels = liveStreams[category] || [];
      return NextResponse.json({
        code: 200,
        message: 'success',
        data: {
          category,
          channels,
        },
      });
    }

    // 返回所有分类和频道
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: liveStreams,
    });
  } catch (error) {
    console.error('获取直播频道失败:', error);
    return NextResponse.json(
      {
        code: 500,
        message: '获取直播频道失败',
        data: null,
      },
      { status: 500 }
    );
  }
}