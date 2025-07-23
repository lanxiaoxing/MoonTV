'use client';

import { useEffect, useRef, useState } from 'react';

import { LiveStream } from '@/app/api/live/route';

interface LivePlayerProps {
  channel: LiveStream;
  onClose: () => void;
}

export default function LivePlayer({ channel, onClose }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    const loadVideo = async () => {
      try {
        // 动态导入 HLS.js
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          // 如果已有 HLS 实例，先销毁
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          // 创建新的 HLS 实例
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxLoadingDelay: 4,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });

          hlsRef.current = hls as any;

          // 加载直播流
          hls.loadSource(channel.url);
          hls.attachMedia(video);

          // 监听事件
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed, starting playback');
            setIsLoading(false);
            video.play().catch((error) => {
              console.error('Failed to start playback:', error);
              setError('播放失败，请检查网络连接');
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', event, data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Fatal network error, trying to recover...');
                  if (retryCountRef.current < maxRetries) {
                    retryCountRef.current++;
                    setTimeout(() => {
                      hls.startLoad();
                    }, 1000 * retryCountRef.current);
                  } else {
                    setError('网络连接失败，请检查网络或稍后重试');
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Fatal media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, destroying HLS instance');
                  hls.destroy();
                  setError('播放器错误，请刷新页面重试');
                  setIsLoading(false);
                  break;
              }
            }
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            setIsLoading(false);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari 原生支持 HLS
          video.src = channel.url;
          video.addEventListener('loadstart', () => setIsLoading(false));
          video.addEventListener('error', () => {
            setError('播放失败，请检查直播源');
            setIsLoading(false);
          });
          video.play().catch((error) => {
            console.error('Failed to start playback:', error);
            setError('播放失败，请检查网络连接');
            setIsLoading(false);
          });
        } else {
          console.error('HLS is not supported in this browser');
          setError('当前浏览器不支持直播播放');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load HLS.js:', error);
        // 回退到原生播放
        video.src = channel.url;
        video.addEventListener('loadstart', () => setIsLoading(false));
        video.addEventListener('error', () => {
          setError('播放失败，请检查直播源');
          setIsLoading(false);
        });
        video.play().catch((playError) => {
          console.error('Native playback also failed:', playError);
          setError('播放失败，请检查网络连接');
          setIsLoading(false);
        });
      }
    };

    loadVideo();

    // 清理函数
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      retryCountRef.current = 0;
    };
  }, [channel.url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {channel.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 播放器区域 */}
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
            muted={false}
          />
          
          {/* 加载指示器和错误显示 */}
          {(isLoading || error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">正在加载直播流...</p>
                  </>
                ) : error ? (
                  <>
                    <div className="text-red-400 mb-2">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      刷新重试
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
        
        {/* 底部信息 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                正在播放: {channel.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                直播信号源: HLS 流媒体
              </p>
            </div>
            <div className="flex items-center text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
              <span className="text-xs font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}