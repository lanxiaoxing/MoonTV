'use client';

import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

import LivePlayer from '@/components/LivePlayer';
import PageLayout from '@/components/PageLayout';

export interface LiveStream {
  name: string;
  url: string;
  logo: string;
}

export interface LiveData {
  [categoryName: string]: LiveStream[];
}

export default function LivePage() {
  const [liveData, setLiveData] = useState<LiveData>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<LiveStream | null>(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/live');
        const result = await response.json();

        if (result.code === 200) {
          setLiveData(result.data);
          // 设置默认选中第一个分类
          const categories = Object.keys(result.data);
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
        }
      } catch (error) {
        console.error('获取直播数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  const handleChannelClick = (channel: LiveStream) => {
    setSelectedChannel(channel);
  };

  const categories = Object.keys(liveData);
  const currentChannels = activeCategory ? liveData[activeCategory] : [];

  if (loading) {
    return (
      <PageLayout>
        <div className="px-2 sm:px-10 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 dark:bg-gray-800"></div>
            <div className="flex space-x-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-20 dark:bg-gray-800"></div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg p-4 dark:bg-gray-800">
                  <div className="h-4 bg-gray-300 rounded mb-2 dark:bg-gray-700"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="px-2 sm:px-10 py-4 sm:py-8">
        {/* 页面标题 */}
        <div className="flex items-center mb-6">
          <Radio className="w-6 h-6 text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            电视直播
          </h1>
        </div>

        {/* 分类选择 */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* 频道列表 */}
        {currentChannels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentChannels.map((channel, index) => (
              <div
                key={index}
                onClick={() => handleChannelClick(channel)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 border border-gray-200 dark:border-gray-700 group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* 频道 logo */}
                  <div className="w-12 h-12 mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                    {channel.logo ? (
                      <>
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const radioIcon = parent.querySelector('.radio-fallback');
                              if (radioIcon) {
                                radioIcon.classList.remove('hidden');
                              }
                            }
                          }}
                        />
                        <Radio className="radio-fallback w-6 h-6 text-red-500 hidden" />
                      </>
                    ) : (
                      <Radio className="w-6 h-6 text-red-500" />
                    )}
                    {/* 直播指示器 */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  {/* 频道名称 */}
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate w-full group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    LIVE
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {loading ? '加载中...' : activeCategory ? '该分类暂无频道' : '暂无直播频道'}
            </p>
          </div>
        )}

        {/* 播放器弹窗 */}
        {selectedChannel && (
          <LivePlayer
            channel={selectedChannel}
            onClose={() => setSelectedChannel(null)}
          />
        )}
      </div>
    </PageLayout>
  );
}