import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, Brain, Calendar, 
  TrendingUp, Lightbulb, Heart, Star, 
  Settings, ChevronRight, Copy, Share2,
  Plus, AlertTriangle, Award, Coffee, Music,
  FileText, Upload, X
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, 
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  Cell 
} from 'recharts';
import { ANALYSIS_PROMPTS } from '@/config/prompts';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { ProfileCard } from '@/components/ProfileCard';
import { Empty } from '@/components/Empty';
import ChatImport from '@/components/ChatImport';
import { AISettingsModal } from '@/components/AISettingsModal';

// 模拟情绪数据
const moodData = [
  { day: '周一', 开心: 65, 平淡: 25, 烦躁: 10 },
  { day: '周二', 开心: 59, 平淡: 30, 烦躁: 11 },
  { day: '周三', 开心: 80, 平淡: 15, 烦躁: 5 },
  { day: '周四', 开心: 81, 平淡: 14, 烦躁: 5 },
  { day: '周五', 开心: 56, 平淡: 24, 烦躁: 20 },
  { day: '周六', 开心: 55, 平淡: 35, 烦躁: 10 },
  { day: '周日', 开心: 40, 平淡: 50, 烦躁: 10 },
];

// 模拟关系变化数据
const relationshipData = [
  { date: '12/17', 热度: 85 },
  { date: '12/24', 热度: 80 },
  { date: '12/31', 热度: 75 },
  { date: '1/7', 热度: 65 },
  { date: '1/14', 热度: 55 },
  { date: '1/17', 热度: 50 },
];

// 模拟灵感数据
const inspirations = [
  {
    id: 1,
    title: '咖啡馆打卡',
    category: '约会计划',
    content: '想一起去打卡新开的咖啡馆',
    execution: '暂定周六下午',
    keyword: '咖啡馆',
  },
  {
    id: 2,
    title: '看展计划',
    category: '约会计划',
    content: '计划周末看展',
    execution: '待确定具体日期',
    keyword: '看展',
  },
  {
    id: 3,
    title: '健身爱好',
    category: '兴趣清单',
    content: '对方提到最近在健身',
    execution: '可以聊健身相关话题',
    keyword: '健身',
  }
];

// 模拟聊天记录
const chatRecords = [
  {
    id: 1,
    speaker: '对方',
    content: '我最近有点忙',
    timestamp: '2026-01-16 14:30',
    keywords: ['忙']
  },
  {id: 2,
    speaker: '我',
    content: '想一起去打卡新开的咖啡馆',
    timestamp: '2026-01-15 10:15',
    keywords: ['咖啡馆']
  },
  {
    id: 3,
    speaker: '对方',
    content: '好呀，我喜欢美式咖啡',
    timestamp: '2026-01-15 11:00',
    keywords: ['美式', '咖啡']
  },
  {
    id: 4,
    speaker: '我',
    content: '关于入赘这件事，你有没有自己的想法呀？',
    timestamp: '2026-01-14 20:30',
    keywords: ['入赘']
  },
  {
    id: 5,
    speaker: '对方',
    content: '我觉得还是要考虑双方感受吧',
    timestamp: '2026-01-14 21:00',
    keywords: ['感受']
  }
];

// 模拟决策分析结果
const decisionAnalysis = {
  preference: '情感驱动型决策',
  description: '你倾向于情感驱动型决策，讨论中多次提及"双方感受"，较少理性分析现实因素',
  issues: ['未明确自身核心诉求，易让对方误解'],
  suggestions: ['先梳理自身立场，再结合对方态度沟通'],
  recommendedPhrases: ['我更在意我们俩的感受，关于入赘这件事，你有没有自己的想法呀？']
};

// 模拟月度复盘数据
const monthlyReview = {
  moodSummary: {
    开心: 40,
    平淡: 35,
    烦躁: 25
  },
  relationshipTrend: '从暧昧进入平淡期',
  keyInspirations: 3,
  insights: ['每周五易情绪波动', '对方回复时效延长', '存在轻微单向投入']
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  // 会话管理
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // AI 分析数据状态
  const [profileData, setProfileData] = useState<any>(null);
  const [decisionData, setDecisionData] = useState<any>(null);
  const [inspirationData, setInspirationData] = useState<any[]>([]);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);
  const [relationshipAnalysis, setRelationshipAnalysis] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  
  // 正在分析的状态
  const [analyzingTab, setAnalyzingTab] = useState<string | null>(null);

  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [activeRelationship, setActiveRelationship] = useState('crush');
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredChats, setFilteredChats] = useState(chatRecords);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    loadSessions();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 加载会话列表
  const loadSessions = async () => {
    if (!window.chatApi) return;
    try {
      const list = await window.chatApi.getSessions();
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        setActiveSessionId(list[0].id);
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  };

  // 监听导入成功，刷新列表
  useEffect(() => {
    if (!showImportModal) {
      loadSessions();
    }
  }, [showImportModal]);

  // 通用分析函数
  const performAnalysis = async (type: 'profile' | 'decision' | 'inspiration' | 'mood' | 'relationship' | 'review') => {
    if (!activeSessionId) {
      toast.error('请先选择或导入一个会话');
      return;
    }
    if (!window.llmApi || !window.aiApi) {
      toast.error('API 未初始化');
      return;
    }

    // 检查是否有 API Key
    const hasConfig = await window.llmApi.hasConfig();
    if (!hasConfig) {
      toast.error('请先配置 AI 模型');
      setIsAISettingsOpen(true);
      return;
    }

    setAnalyzingTab(type);
    const toastId = toast.loading(`正在生成${getTabName(type)}...`);

    try {
      // 1. 获取最近聊天记录作为上下文
      // 获取最近 200 条消息用于分析
      const contextResult = await window.aiApi.getAllRecentMessages(activeSessionId, undefined, 200);
      const messages = contextResult.messages.reverse().map(m => 
        `${m.senderName} (${new Date(m.timestamp).toLocaleString()}): ${m.content}`
      ).join('\n');

      if (!messages) {
        toast.error('没有找到聊天记录', { id: toastId });
        setAnalyzingTab(null);
        return;
      }

      // 2. 构建 Prompt
      const systemPrompt = ANALYSIS_PROMPTS[type];
      const userContent = `以下是最近的聊天记录：\n---\n${messages}\n---\n请根据以上记录进行分析。`;

      // 3. 调用 LLM
      let resultText = '';
      const result = await window.llmApi.chatStream([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ], {}, (chunk) => {
        if (chunk.content) resultText += chunk.content;
      });

      if (result.success) {
        // 4. 解析结果
        try {
          // 尝试提取 JSON (防备 AI 返回了 markdown 代码块)
          const jsonMatch = resultText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          const jsonStr = jsonMatch ? jsonMatch[0] : resultText;
          const parsedData = JSON.parse(jsonStr);
          
          // 更新对应状态
          switch (type) {
            case 'profile': setProfileData(parsedData); break;
            case 'decision': setDecisionData(parsedData); break;
            case 'inspiration': setInspirationData(parsedData); break;
            case 'mood': setMoodAnalysis(parsedData); break;
            case 'relationship': setRelationshipAnalysis(parsedData); break;
            case 'review': setReviewData(parsedData); break;
          }
          toast.success('分析完成', { id: toastId });
        } catch (e) {
          console.error(e);
          toast.error('解析 AI 响应失败', { id: toastId });
        }
      } else {
        toast.error(`分析失败: ${result.error}`, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('发生错误', { id: toastId });
    } finally {
      setAnalyzingTab(null);
    }
  };

  const getTabName = (tab: string) => {
    const map: Record<string, string> = {
      profile: '人物画像',
      decision: '决策分析',
      inspiration: '灵感提取',
      mood: '情绪分析',
      relationship: '关系分析',
      review: '月度复盘'
    };
    return map[tab] || '分析';
  };

  // 处理搜索
  useEffect(() => {
    if (searchKeyword.trim() === '') {
      setFilteredChats(chatRecords);
    } else {
      const filtered = chatRecords.filter(chat => 
        chat.content.includes(searchKeyword) || 
        chat.keywords.some(keyword => keyword.includes(searchKeyword))
      );
      setFilteredChats(filtered);
    }
  }, [searchKeyword]);

  // 复制推荐话术
  const copyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  // 生成关系特定的画像数据
  const getProfileData = () => {
    if (profileData) return profileData; // 优先使用 AI 生成的数据
    
    // 降级使用模拟数据或空数据
    if (activeSessionId) {
      return {
        name: '待分析',
        avatar: '',
        traits: ['点击分析生成'],
        style: '-',
        emotion: '-',
        interests: [],
        relationshipStatus: '-',
        statusDetail: '请点击下方按钮开始分析',
        chatFrequency: '-',
        responseTime: '-'
      };
    }
    
    switch(activeRelationship) {
      case 'mentor':
        return {
          name: '导师',
          avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=professional%20mentor%20business%20suit&sign=bd898d01f1faee8e8e03872faad2222a',
          traits: ['专业严谨', '擅长给出建议', '逻辑清晰', '经验丰富'],
          style: '理性客观',
          emotion: '稳定输出',
          interests: ['行业动态', '知识分享', '职业发展'],
          relationshipStatus: '指导关系',
          statusDetail: '稳定发展中',
          chatFrequency: '近7天5次互动',
          responseTime: '平均回复时效30分钟'
        };
      case 'friend':
        return {
          name: '亲密好友',
          avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=close%20friend%20smiling%20happy&sign=ca74bc5ba75bc3fe140eac141a9c820c',
          traits: ['直爽', '情绪共鸣强', '贴心', '幽默'],
          style: '真诚直接',
          emotion: '主动分享',
          interests: ['美食', '旅行', '电影'],
          relationshipStatus: '多年好友',
          statusDetail: '关系紧密',
          chatFrequency: '近7天10次互动',
          responseTime: '平均回复时效15分钟'
        };
      default: // crush
        return {
          name: 'Crush',
          avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=attractive%20person%20smiling%20charming&sign=c715d08d31d4219bc854715b8bc290e9',
          traits: ['委婉', '幽默', '温柔', '体贴'],
          style: '含蓄表达',
          emotion: '被动回应',
          interests: ['咖啡', '健身', '艺术展览'],
          relationshipStatus: 'Crush',
          statusDetail: '进入平淡期',
          chatFrequency: '近7天3次互动',
          responseTime: '平均回复时效2小时'
        };
    }
  };

  // 页面内容动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">AI正在分析您的沟通数据...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MessageSquare className="text-blue-500 h-6 w-6" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {activeSessionId && sessions.find(s => s.id === activeSessionId)?.name || 'AI微信沟通助理'}
            </h1>
            {sessions.length > 0 && (
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight className="h-4 w-4 text-gray-500 transform group-hover:rotate-90 transition-transform" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
                  {sessions.map(s => (
                    <button
                      key={s.id}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${activeSessionId === s.id ? 'text-blue-500 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setActiveSessionId(s.id)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="切换主题"
            >
              {theme === 'dark' ? (
                <i className="fa-regular fa-sun text-yellow-400"></i>
              ) : (
                <i className="fa-regular fa-moon text-blue-600"></i>
              )}
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="设置"
              onClick={() => setIsAISettingsOpen(true)}
            >
              <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 关系类型选择器 */}
        {!activeSessionId && (
          <div className="flex justify-center mb-8">
             <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-center">
                <p className="text-yellow-800 dark:text-yellow-200 mb-2">👋 欢迎使用 AI 微信沟通助理</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">请点击右下角"导入记录"开始体验，或选择已有的会话。</p>
             </div>
          </div>
        )}

        <motion.div 
          className="flex justify-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <motion.button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeRelationship === 'mentor' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveRelationship('mentor')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="inline-block h-4 w-4 mr-1" /> 导师
            </motion.button>
            <motion.button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeRelationship === 'friend' 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveRelationship('friend')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="inline-block h-4 w-4 mr-1" /> 亲密好友
            </motion.button>
            <motion.button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeRelationship === 'crush' 
                  ? 'bg-pink-500 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveRelationship('crush')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="inline-block h-4 w-4 mr-1" /> Crush
            </motion.button>
          </div>
        </motion.div>

        {/* 功能选项卡 */}
        <motion.div 
          className="flex justify-center mb-8 overflow-x-auto pb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex gap-2">
            <motion.button
              className="px-5 py-3 rounded-lg flex flex-col items-center gap-2 bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all"
              onClick={() => setShowImportModal(true)}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm font-medium">导入记录</span>
            </motion.button>
            <motion.button
              className={`px-5 py-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'profile' 
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-b-2 border-blue-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('profile')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">人物画像</span>
            </motion.button>
            <motion.button
              className={`px-5 py-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'decision' 
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-b-2 border-green-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('decision')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">决策分析</span>
            </motion.button>
            <motion.button
              className={`px-5 py-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'inspiration' 
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-b-2 border-yellow-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('inspiration')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">灵感管理</span>
            </motion.button>
            <motion.button
              className={`px-5 py-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'mood' 
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-b-2 border-purple-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('mood')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">情绪分析</span>
            </motion.button>
            <motion.button
              className={`px-5 py-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'relationship' 
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-b-2 border-red-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('relationship')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">关系变化</span>
            </motion.button>
            <motion.button
              className={`px-5 py-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                activeTab === 'review' 
                  ? 'bg-white dark:bg-gray-800 shadow-lg border-b-2 border-indigo-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('review')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium">月度复盘</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 内容区域 */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`${activeTab}-${activeRelationship}`}
        >
          {/* 人物画像 */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <ProfileCard profile={getProfileData()} />
              
              <motion.div 
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
                  <Award className="h-5 w-5" />
                  关系洞察
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <span>近1周你主动发消息3次，对方仅主动1次，存在轻微单向投入，建议引导对方分享，避免情感疏远。</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <span>对方近期工作繁忙，回复时效从30分钟延长至2小时，聊天内容从主动分享变为被动应答。</span>
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="mt-6"
                variants={itemVariants}
              >
                <motion.button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  onClick={() => setActiveTab('decision')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Brain className="h-5 w-5" />
                  开始决策分析
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* 决策模式分析 */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                决策模式分析
              </motion.h2>
              
              <motion.div 
                className="flex flex-col md:flex-row gap-4"
                variants={itemVariants}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3">选择分析范围</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl max-h-64 overflow-y-auto space-y-2">
                    {chatRecords.map(chat => (
                      <motion.div 
                        key={chat.id} 
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <input type="checkbox" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${chat.speaker === '我' ? 'text-blue-500' : 'text-green-500'}`}>
                              {chat.speaker}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm mt-1">{chat.content}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {chat.keywords.map((keyword, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3">分析结果</h3>
                  <motion.div 
                    className={`p-4 rounded-xl h-full ${showDecisionAnalysis ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {showDecisionAnalysis ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">决策偏好</h4>
                          <p className="font-medium">{decisionAnalysis.preference}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{decisionAnalysis.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">逻辑漏洞</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                            {decisionAnalysis.issues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">优化建议</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                            {decisionAnalysis.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">推荐话术</h4>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                            <p className="text-sm">{decisionAnalysis.recommendedPhrases[0]}</p>
                            <motion.button 
                              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => copyPhrase(decisionAnalysis.recommendedPhrases[0])}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </motion.button>
                          </div>
                          {showCopySuccess && (
                            <motion.p 
                              className="text-xs text-green-500 mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              已复制到剪贴板！
                            </motion.p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Brain className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400">选择聊天片段并点击生成分析</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="flex justify-end"
                variants={itemVariants}
              >
                <motion.button 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  onClick={() => setShowDecisionAnalysis(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="h-4 w-4" />
                  生成分析报告
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* 灵感总结与管理 */}
          {activeTab === 'inspiration' && (
            <div className="space-y-6">
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                灵感总结与管理
              </motion.h2>
              
              <motion.div 
                className="relative"
                variants={itemVariants}
              >
                <input
                  type="text"
                  placeholder="搜索灵感关键词..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={itemVariants}
              >
                {inspirations.map(inspiration => (
                  <motion.div 
                    key={inspiration.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{inspiration.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                        {inspiration.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{inspiration.content}</p>
                    {inspiration.execution && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-check-circle text-green-500 text-sm"></i>
                          <span className="text-sm">{inspiration.execution}</span>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                          #{inspiration.keyword}
                        </span>
                      </div>
                      <button className="text-blue-500 text-sm hover:underline">
                        查看相关聊天
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-300">
                  <Lightbulb className="h-5 w-5" />
                  RAG推荐
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Crush喜欢美式，可优先选择主打美式的咖啡馆。可以考虑推荐市中心那家新开的精品咖啡馆，环境安静适合聊天。
                </p>
              </motion.div>

              <motion.div 
                className="flex justify-center"
                variants={itemVariants}
              >
                <motion.button 
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-6 rounded-xl font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-4 w-4" />
                  添加新灵感
                </motion.button>
              </motion.div>
            </div>
          )}

          {/* 情绪规律分析 */}
          {activeTab === 'mood' && (
            <div className="space-y-6">
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                情绪规律分析
              </motion.h2>
              
              <motion.div 
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold mb-4">近一周情绪变化</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCalm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAnxious" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="开心" stroke="#82ca9d" fillOpacity={1} fill="url(#colorHappy)" />
                      <Area type="monotone" dataKey="平淡" stroke="#8884d8" fillOpacity={1} fill="url(#colorCalm)" />
                      <Area type="monotone" dataKey="烦躁" stroke="#ffc658" fillOpacity={1} fill="url(#colorAnxious)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={itemVariants}
              >
                <motion.div 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 className="text-lg font-semibold mb-3">生理期关联</h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                      <i className="fa-solid fa-droplet text-red-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        生理期前3天情绪低谷，聊天中出现2次烦躁语气，建议提前调整沟通节奏，避免冲突。
                      </p>
                      <div className="mt-2 text-xs text-blue-500 dark:text-blue-400">
                        下次生理期预计: 2026-01-25
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 className="text-lg font-semibold mb-3">生活事件关联</h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                      <i className="fa-solid fa-briefcase text-yellow-500"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        聊天中提及"工作失误"后，情绪低落，Crush的安慰话术带来正向情绪价值。
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <i className="fa-solid fa-calendar"></i>
                        <span>发生于: 2026-01-13</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300">
                  <AlertTriangle className="h-5 w-5" />
                  情绪提醒
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  每周五易情绪波动，可减少重要话题沟通。建议选择轻松话题或延迟至周六再讨论。
                </p>
              </motion.div>
            </div>
          )}

          {/* 关系变化分析 */}
          {activeTab === 'relationship' && (
            <div className="space-y-6">
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                关系变化分析
              </motion.h2>
              
              <motion.div 
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold mb-4">近一个月关系热度变化</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={relationshipData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="热度" 
                        stroke="#ff6b6b" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6, stroke: '#ff6b6b', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={itemVariants}
              >
                <motion.div 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 className="text-lg font-semibold mb-3">转折点识别</h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        2周前开始，对方回复时效从30分钟延长至2小时，聊天内容从主动分享变为被动应答，关系进入平淡期。
                      </p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        可能原因: 对方近期工作繁忙
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 className="text-lg font-semibold mb-3">单向关系检测</h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        近1周你主动发消息3次，对方仅主动1次，存在轻微单向投入。
                      </p>
                      <div className="mt-2 text-xs text-blue-500 dark:text-blue-400">
                        建议: 引导对方分享，避免情感疏远
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 className="text-lg font-semibold mb-3">潜台词解读</h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">"我最近有点忙"</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        可能是真实状态，也可能是委婉回避
                      </p>
                      <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        推荐回应: "那你先忙，等你有空我们再聊～"
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* 月度复盘 */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <motion.h2 
                className="text-2xl font-bold"
                variants={itemVariants}
              >
                月度复盘
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={itemVariants}
              >
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">情绪分布</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(monthlyReview.moodSummary).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(monthlyReview.moodSummary).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <motion.div 
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 className="text-lg font-semibold mb-4">关系趋势</h3>
                  <div className="h-64 flex flex-col justify-center items-center">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                      <TrendingUp className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-xl font-medium text-center mb-2">{monthlyReview.relationshipTrend}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center max-w-xs">
                      关系热度从月初的85分下降至月末的50分，需要采取行动维护关系。
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold mb-3">关键洞察</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {monthlyReview.insights.map((insight, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                      whileHover={{ y: -5, boxShadow: '0 5px 10px -2px rgba(0, 0, 0, 0.1)' }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                          <i className="fa-solid fa-lightbulb text-blue-500 text-xs"></i>
                        </div>
                        <p className="text-sm">{insight}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                  <Award className="h-5 w-5" />
                  本月建议
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  基于本月的沟通模式分析，建议调整沟通策略，增加对方感兴趣话题的讨论，如咖啡、健身等，同时注意在周五避免讨论重要话题，选择轻松愉快的内容。
                </p>
              </motion.div>

              <motion.div 
                className="flex justify-end gap-3"
                variants={itemVariants}
              >
                <motion.button 
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-6 rounded-xl font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="h-4 w-4" />
                  分享报告
                </motion.button>
                <motion.button 
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-6 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Coffee className="h-4 w-4" />
                  生成话术推荐
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="mt-10 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex justify-center items-center gap-1 mb-2">
            <Music className="h-4 w-4" />
            <span>本地处理，不上传云端，保障隐私安全</span>
          </div>
          <p>© 2026 AI微信沟通助理 - 智能人际关系分析平台</p>
        </div>
      </footer>

      {/* 导入聊天记录模态框 */}
      {showImportModal && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold">导入聊天记录</h2>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowImportModal(false)}
                aria-label="关闭"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <ChatImport />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI设置模态框 */}
      <AISettingsModal 
        isOpen={isAISettingsOpen} 
        onClose={() => setIsAISettingsOpen(false)} 
      />
    </div>
  );
}