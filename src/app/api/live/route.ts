import { NextResponse } from 'next/server';

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
export async function GET() {
  try {
    // 直接从 runtime config 读取直播流数据
    const liveStreams = (runtimeConfig as any).live_streams || {};

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