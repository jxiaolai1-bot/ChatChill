import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Clipboard, Upload, MessageSquare, Check, 
  AlertCircle, Info, Shield, X, ChevronDown, 
  User, Calendar, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

// 聊天记录解析类型定义
interface ParsedMessage {
  id: string;
  speaker: string;
  content: string;
  timestamp: string;
}

const ChatImport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clipboard' | 'file'>('clipboard');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedMessages, setParsedMessages] = useState<ParsedMessage[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模拟从剪贴板获取内容并解析
  const handleClipboardSync = async () => {
    try {
      setIsParsing(true);
      setShowResults(false);
      
      // 模拟异步解析过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟解析结果（实际应用中应该从剪贴板读取并解析）
      const mockParsedMessages: ParsedMessage[] = [
        {
          id: '1',
          speaker: 'Crush',
          content: '你好呀，最近在忙什么呢？',
          timestamp: '2026-01-17 14:30:00'
        },
        {
          id: '2',
          speaker: '我',
          content: '最近在准备一个重要的项目，有点忙呢，你呢？',
          timestamp: '2026-01-17 14:32:00'
        },
        {
          id: '3',
          speaker: 'Crush',
          content: '我也是，不过周末想放松一下，要不要一起去新开的那家咖啡馆？',
          timestamp: '2026-01-17 14:35:00'
        },
        {
          id: '4',
          speaker: '我',
          content: '好呀，我也听说那家咖啡馆的美式很不错，周末什么时候？',
          timestamp: '2026-01-17 14:38:00'
        }
      ];
      
      setParsedMessages(mockParsedMessages);
      setShowResults(true);
      toast.success('剪贴板内容解析成功！');
    } catch (error) {
      toast.error('解析失败，请检查剪贴板内容格式');
    } finally {
      setIsParsing(false);
    }
  };

  // 处理文件选择与导入
  const handleSelectFile = async () => {
    if (!window.chatApi) {
      toast.error('请在 Electron 环境中运行以使用此功能');
      return;
    }

    try {
      const result = await window.chatApi.selectFile();
      if (!result || !result.filePath) return;

      const { filePath, format } = result;
      setFileContent(`已选择文件: ${filePath}\n检测格式: ${format}`);
      
      // 开始导入
      handleImport(filePath);
    } catch (error) {
      console.error(error);
      toast.error('选择文件失败');
    }
  };

  // 执行导入
  const handleImport = async (filePath: string) => {
    setIsParsing(true);
    setImportProgress({ stage: 'detecting', progress: 0, message: '准备导入...' });
    
    // 监听进度
    const cleanup = window.chatApi.onImportProgress((progress) => {
      setImportProgress(progress);
      if (progress.stage === 'error') {
        toast.error(`导入失败: ${progress.message}`);
      }
    });

    try {
      const result = await window.chatApi.import(filePath);
      if (result.success) {
        toast.success('导入成功！');
        setFileContent((prev) => prev + '\n\n✅ 导入完成！');
        // 这里可以添加导入成功后的回调，例如刷新会话列表
        // if (onImportSuccess) onImportSuccess(result.sessionId);
      } else {
        toast.error(result.error || '导入失败');
        if (result.diagnosis) {
          setFileContent((prev) => prev + `\n\n❌ 导入失败: ${result.error}\n建议: ${result.diagnosis?.suggestion}`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('导入过程发生错误');
    } finally {
      cleanup();
      setIsParsing(false);
    }
  };

  // 导入解析结果到应用
  const importResults = () => {
    toast.success('聊天记录已成功导入！');
    // 实际应用中应该将解析结果保存到应用状态或存储中
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 导入方式选项卡 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'clipboard' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => setActiveTab('clipboard')}
          >
            <div className="flex items-center justify-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span>剪贴板同步</span>
            </div>
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'file' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => setActiveTab('file')}
          >
             <div className="flex items-center justify-center gap-2">
              <Upload className="h-4 w-4" />
              <span>文件导入</span>
            </div>
          </button>
        </div>

        {/* 剪贴板同步内容 */}
        {activeTab === 'clipboard' && (
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Clipboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">剪贴板同步</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  在微信中复制聊天记录，然后点击下方按钮同步解析
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Info className="h-4 w-4" />
                <span>操作步骤</span>
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>打开微信聊天界面</li>
                <li>长按并选择要复制的聊天记录</li>
                <li>点击"复制"按钮</li>
                <li>返回本应用并点击下方"同步剪贴板"按钮</li>
              </ol>
            </div>
            
            <motion.button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isParsing 
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
              onClick={handleClipboardSync}
              disabled={isParsing}
              whileHover={!isParsing && { scale: 1.02 }}
              whileTap={!isParsing && { scale: 0.98 }}
            >
              {isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  解析中...
                </>
              ) : (
                <>
                  <Clipboard className="h-5 w-5" />
                  同步剪贴板内容
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* 文件导入内容 */}
        {activeTab === 'file' && (
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
               <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">文件导入</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  上传微信聊天记录备份文件进行批量导入
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Info className="h-4 w-4" />
                <span>支持的格式</span>
              </div>
              <div className="text-sm">
                <p className="mb-2">• 微信导出的文本格式 (.txt)</p>
                <p className="mb-2">• 支持最多10MB的文件大小</p>
                <p>• 建议单次导入不超过1000条消息</p>
              </div>
            </div>
            
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              onClick={handleSelectFile}
            >
               <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium mb-1">点击选择文件导入</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                支持 .txt / .json 等格式
              </p>
            </div>
            
            {fileContent && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">导入状态</h4>
                  {!isParsing && (
                    <button 
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => {
                        setFileContent('');
                        setImportProgress(null);
                      }}
                    >
                      <X className="h-3 w-3" /> 清除
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                  {fileContent}
                </p>
                {importProgress && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{importProgress.message}</span>
                      <span>{Math.round(importProgress.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${importProgress.progress}%` }}
                      ></div>
                    </div>
                    {importProgress.stage === 'saving' && (
                      <p className="text-xs text-blue-500 mt-1 animate-pulse">正在保存数据，请稍候...</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {isParsing && !importProgress && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>初始化中...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 隐私保护说明 */}
      <motion.div 
        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 flex items-start gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">隐私保护</h4>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            所有聊天记录解析均在本地完成，不上传云端，确保您的隐私安全。解析完成后可以随时清除本地数据。
          </p>
        </div>
      </motion.div>

      {/* 解析结果展示 */}
      {showResults && (
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                解析结果
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {parsedMessages.length} 条消息
              </span>
            </div>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {parsedMessages.map((message) => (
                <motion.div 
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.speaker === '我' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 ml-auto max-w-[80%]' 
                      : 'bg-gray-50 dark:bg-gray-700/50 max-w-[80%]'
                  }`}
                  initial={{ opacity: 0, x: message.speaker === '我' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {message.speaker}
                    </span>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <motion.button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow transition-all"
              onClick={importResults}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="h-4 w-4" />
              导入到应用
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatImport;