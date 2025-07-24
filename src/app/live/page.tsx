'use client';

import { Globe, Radio, Sparkles } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

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

// 获取分类图标
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'english channels':
      return Globe;
    case '国际新闻':
      return Globe;
    case '体育频道':
      return Sparkles;
    case '测试频道':
      return Radio;
    default:
      return Radio;
  }
};

// 获取频道固定封面和图标
const getChannelInfo = (channelName: string) => {
  const name = channelName.toLowerCase();
  
  if (name.includes('al jazeera')) {
    return {
      icon: '🌍',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  } else if (name.includes('france 24')) {
    return {
      icon: '🇫🇷',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    };
  } else if (name.includes('cgtn')) {
    return {
      icon: '📺',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  } else if (name.includes('big buck bunny')) {
    return {
      icon: '🐰',
      bgColor: 'bg-orange-400',
      textColor: 'text-white'
    };
  } else if (name.includes('sintel')) {
    return {
      icon: '🎬',
      bgColor: 'bg-purple-500',
      textColor: 'text-white'
    };
  } else if (name.includes('bbc')) {
    return {
      icon: '🇬🇧',
      bgColor: 'bg-red-700',
      textColor: 'text-white'
    };
  } else if (name.includes('cnn')) {
    return {
      icon: '📰',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  } else if (name.includes('sky news')) {
    return {
      icon: '☁️',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  } else {
    return {
      icon: '📡',
      bgColor: 'bg-gray-500',
      textColor: 'text-white'
    };
  }
};

function LivePageContent() {
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
        <div className="flex items-center mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg mr-3">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Live TV
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Watch live channels from around the world
            </p>
          </div>
        </div>

        {/* 分类选择 */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category);
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-sm ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mr-2 ${
                    activeCategory === category ? 'text-white' : 'text-green-500'
                  }`} />
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* 频道列表 */}
        {currentChannels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentChannels.map((channel, index) => {
              const channelInfo = getChannelInfo(channel.name);
              return (
                <div
                  key={index}
                  onClick={() => handleChannelClick(channel)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border border-gray-100 dark:border-gray-700 group overflow-hidden relative"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* 频道封面 */}
                    <div className={`w-16 h-16 mb-3 flex items-center justify-center ${channelInfo.bgColor} rounded-2xl shadow-lg transform group-hover:rotate-3 transition-transform duration-300 relative`}>
                      <span className={`text-2xl ${channelInfo.textColor}`}>
                        {channelInfo.icon}
                      </span>
                      {/* 光晕效果 */}
                      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* 直播指示器 */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* 频道名称 */}
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate w-full group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 mb-1">
                      {channel.name}
                    </h3>
                    
                    {/* 状态标签 */}
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full shadow-sm">
                        LIVE
                      </span>
                    </div>
                  </div>
                  
                  {/* 背景装饰 */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-100/50 to-transparent dark:from-green-800/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                </div>
              );
            })}
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

export default function LivePage() {
  return (
    <Suspense fallback={
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
    }>
      <LivePageContent />
    </Suspense>
  );
}