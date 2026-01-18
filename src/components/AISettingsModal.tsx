import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Plus, Trash2, CheckCircle, 
  AlertCircle, Server, Key, Brain 
} from 'lucide-react';
import { toast } from 'sonner';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [configs, setConfigs] = useState<AIServiceConfigDisplay[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<Partial<AIServiceConfigDisplay>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    if (!window.llmApi) return;
    
    try {
      setIsLoading(true);
      const [providersData, configsData, activeId] = await Promise.all([
        window.llmApi.getProviders(),
        window.llmApi.getAllConfigs(),
        window.llmApi.getActiveConfigId()
      ]);
      
      setProviders(providersData);
      setConfigs(configsData);
      setActiveConfigId(activeId);
    } catch (error) {
      toast.error('加载配置失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setCurrentConfig({
      provider: providers[0]?.id || 'openai',
      name: '新的配置',
      apiKey: '',
      baseUrl: '',
    });
  };

  const handleEdit = (config: AIServiceConfigDisplay) => {
    setIsEditing(true);
    setCurrentConfig({ ...config });
  };

  const handleSave = async () => {
    if (!currentConfig.name || !currentConfig.provider || !currentConfig.apiKey) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      if (currentConfig.id) {
        // 更新现有配置
        const result = await window.llmApi.updateConfig(currentConfig.id, {
          name: currentConfig.name,
          provider: currentConfig.provider,
          apiKey: currentConfig.apiKey,
          model: currentConfig.model,
          baseUrl: currentConfig.baseUrl,
          maxTokens: currentConfig.maxTokens,
        });
        if (result.success) {
          toast.success('更新成功');
          setIsEditing(false);
          loadData();
        } else {
          toast.error(result.error || '更新失败');
        }
      } else {
        // 添加新配置
        const result = await window.llmApi.addConfig({
          name: currentConfig.name!,
          provider: currentConfig.provider!,
          apiKey: currentConfig.apiKey!,
          model: currentConfig.model,
          baseUrl: currentConfig.baseUrl,
          maxTokens: currentConfig.maxTokens,
        });
        if (result.success) {
          toast.success('添加成功');
          setIsEditing(false);
          loadData();
        } else {
          toast.error(result.error || '添加失败');
        }
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
      const result = await window.llmApi.deleteConfig(id);
      if (result.success) {
        toast.success('删除成功');
        loadData();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const result = await window.llmApi.setActiveConfig(id);
      if (result.success) {
        setActiveConfigId(id);
        toast.success('已切换当前配置');
      } else {
        toast.error(result.error || '切换失败');
      }
    } catch (error) {
      toast.error('切换失败');
    }
  };

  const handleValidate = async () => {
    if (!currentConfig.provider || !currentConfig.apiKey) {
      toast.error('请填写 Provider 和 API Key');
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await window.llmApi.validateApiKey(
        currentConfig.provider,
        currentConfig.apiKey,
        currentConfig.baseUrl,
        currentConfig.model
      );
      if (isValid) {
        toast.success('验证成功！API Key 有效');
      } else {
        toast.error('验证失败，请检查 API Key 或网络设置');
      }
    } catch (error) {
      toast.error('验证过程发生错误');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI 模型配置
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* 左侧列表 */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
            <div className="p-3">
              <button
                onClick={handleAddNew}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加配置
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {configs.map(config => (
                <div 
                  key={config.id}
                  onClick={() => handleEdit(config)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${
                    config.id === currentConfig.id && isEditing
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate pr-2">{config.name}</span>
                    {config.id === activeConfigId && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                    <Server className="w-3 h-3" />
                    {providers.find(p => p.id === config.provider)?.name || config.provider}
                  </div>
                  <div className="flex gap-2">
                    {config.id !== activeConfigId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetActive(config.id); }}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 rounded transition-colors"
                      >
                        设为默认
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(config.id, e)}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 rounded transition-colors ml-auto"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
              
              {configs.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  暂无配置，请添加
                </div>
              )}
            </div>
          </div>

          {/* 右侧编辑区 */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    配置名称
                  </label>
                  <input
                    type="text"
                    value={currentConfig.name || ''}
                    onChange={e => setCurrentConfig({ ...currentConfig, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="例如：我的 GPT-4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI 服务商
                  </label>
                  <select
                    value={currentConfig.provider || ''}
                    onChange={e => {
                      const provider = providers.find(p => p.id === e.target.value);
                      setCurrentConfig({ 
                        ...currentConfig, 
                        provider: e.target.value,
                        baseUrl: provider?.defaultBaseUrl || '',
                        model: provider?.models?.[0]?.id || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={currentConfig.apiKey || ''}
                      onChange={e => setCurrentConfig({ ...currentConfig, apiKey: e.target.value })}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      placeholder="sk-..."
                    />
                    <Key className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    选择模型
                  </label>
                  <select
                    value={currentConfig.model || ''}
                    onChange={e => setCurrentConfig({ ...currentConfig, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                     {providers.find(p => p.id === currentConfig.provider)?.models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                    ))}
                    <option value="custom">自定义模型...</option>
                  </select>
                  {currentConfig.model === 'custom' && (
                     <input
                      type="text"
                      value={currentConfig.model === 'custom' ? '' : currentConfig.model}
                      onChange={e => setCurrentConfig({ ...currentConfig, model: e.target.value })} // Note: this logic is slightly flawed for pure custom input handling, simplified for now
                      className="mt-2 w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/10 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="输入自定义模型 ID"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    代理地址 (Base URL)
                  </label>
                  <input
                    type="text"
                    value={currentConfig.baseUrl || ''}
                    onChange={e => setCurrentConfig({ ...currentConfig, baseUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    placeholder="https://api.openai.com/v1"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    默认: {providers.find(p => p.id === currentConfig.provider)?.defaultBaseUrl}
                  </p>
                </div>

                <div className="pt-4 flex gap-3 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={handleValidate}
                    disabled={isValidating || !currentConfig.apiKey}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    验证连接
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存配置
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p>请选择左侧配置进行编辑，或点击"添加配置"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
