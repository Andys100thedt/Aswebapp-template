"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Workflow, 
  Database, 
  PlayCircle, 
  Plus, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  Clock,
  FileText,
  Lightbulb,
  GitBranch,
  Zap
} from 'lucide-react';
import * as api from '@/services/api';

interface MemoryCardProps {
  title: string;
  entries: (api.MemoryEntry | api.Episode)[];
  onAdd?: () => void;
  type: 'semantic' | 'episodic';
}

function MemoryCard({ title, entries, onAdd, type }: MemoryCardProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'principle': return 'bg-purple-100 text-purple-800';
      case 'pattern': return 'bg-blue-100 text-blue-800';
      case 'lesson': return 'bg-green-100 text-green-800';
      case 'insight': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>
            {type === 'semantic' ? '知识和概念' : '历史经验和事件'}
          </CardDescription>
        </div>
        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            添加
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>暂无数据</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {entries.map((entry) => (
              <div key={type === 'semantic' ? entry.entry_id : entry.episode_id} className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">
                    {type === 'semantic' ? entry.topic : entry.request.substring(0, 50)}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {type === 'semantic' ? (
                    <div>
                      <pre className="whitespace-pre-wrap break-words text-xs">
                        {JSON.stringify(entry.content, null, 2).substring(0, 150)}
                        {JSON.stringify(entry.content).length > 150 && '...'}
                      </pre>
                      {entry.metadata?.category && (
                        <Badge className={`mt-2 ${getCategoryColor(entry.metadata.category)}`}>
                          {entry.metadata.category}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="line-clamp-2 text-xs">
                      {entry.output.substring(0, 100)}
                      {entry.output.length > 100 && '...'}
                    </p>
                  )}
                </div>
                {type === 'semantic' && (
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      重要性: {entry.importance.toFixed(1)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      访问: {entry.access_count}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface WorkflowCardProps {
  workflows: api.WorkflowInfo[];
  currentWorkflow: string;
  onAdd: () => void;
  onSwitch: (name: string) => void;
}

function WorkflowCard({ workflows, currentWorkflow, onAdd, onSwitch }: WorkflowCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">工作流管理</CardTitle>
          <CardDescription>管理和切换工作流</CardDescription>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          创建
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>暂无工作流</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {workflows.map((workflow) => (
              <div 
                key={workflow.name} 
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  workflow.name === currentWorkflow 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSwitch(workflow.name)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{workflow.name}</h4>
                  {workflow.name === currentWorkflow && (
                    <Badge className="bg-indigo-100 text-indigo-800">当前</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{workflow.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskCardProps {
  onSubmit: (request: string, workflowName: string) => void;
  workflows: api.WorkflowInfo[];
  currentWorkflow: string;
}

function TaskCard({ onSubmit, workflows, currentWorkflow }: TaskCardProps) {
  const [request, setRequest] = useState('');
  const [workflowName, setWorkflowName] = useState(currentWorkflow || 'default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow);
    }
  }, [currentWorkflow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(request, workflowName);
      setRequest('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">任务执行</CardTitle>
        <CardDescription>创建和执行新任务</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request">任务描述</Label>
            <Textarea
              id="request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="例如：帮我生成一段小说文案"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow">工作流</Label>
            <select
              id="workflow"
              className="w-full p-2 border rounded-md"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            >
              {workflows.length > 0 ? (
                workflows.map((wf) => (
                  <option key={wf.name} value={wf.name}>
                    {wf.name} {wf.current ? '(当前)' : ''}
                  </option>
                ))
              ) : (
                <option value="default">默认工作流</option>
              )}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                执行中...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                执行任务
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface TaskStatusCardProps {
  task: api.Task | null;
}

function TaskStatusCard({ task }: TaskStatusCardProps) {
  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">任务状态</CardTitle>
          <CardDescription>当前任务的执行状态</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>暂无任务执行</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">任务状态</CardTitle>
          <CardDescription>任务 ID: {task.task_id}</CardDescription>
        </div>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className={`ml-2 text-sm font-medium ${
            task.status === 'completed' ? 'text-green-600' :
            task.status === 'failed' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {task.status === 'running' ? '执行中' :
             task.status === 'completed' ? '已完成' :
             task.status === 'failed' ? '失败' : task.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.extracted_knowledge_count > 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <Lightbulb className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              自动提取了 {task.extracted_knowledge_count} 条知识
            </span>
          </div>
        )}
        {task.output && (
          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">输出结果</h4>
            <pre className="whitespace-pre-wrap text-sm">{task.output}</pre>
          </div>
        )}
        {task.error && (
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <h4 className="font-medium mb-2 text-red-600">错误信息</h4>
            <p className="text-sm text-red-800">{task.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface WorkflowKnowledgeCardProps {
  workflowName: string;
  knowledge: api.MemoryEntry[];
}

function WorkflowKnowledgeCard({ workflowName, knowledge }: WorkflowKnowledgeCardProps) {
  // 确保 knowledge 是数组
  const knowledgeList = knowledge || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <GitBranch className="h-5 w-5 mr-2" />
          工作流相关知识
        </CardTitle>
        <CardDescription>
          工作流 &quot;{workflowName}&quot; 的关联知识
        </CardDescription>
      </CardHeader>
      <CardContent>
        {knowledgeList.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>暂无相关知识</p>
            <p className="text-xs mt-1">执行该工作流的任务后将自动提取知识</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {knowledgeList.map((k) => (
              <div key={k.entry_id} className="p-2 border rounded text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{k.topic}</span>
                  <Badge variant="outline">{k.importance.toFixed(1)}</Badge>
                </div>
                {k.metadata?.category && (
                  <Badge className="mt-1 text-xs" variant="secondary">
                    {k.metadata.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function App() {
  const [semanticMemory, setSemanticMemory] = useState<api.MemoryEntry[]>([]);
  const [episodicMemory, setEpisodicMemory] = useState<api.Episode[]>([]);
  const [workflows, setWorkflows] = useState<api.WorkflowInfo[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('default');
  const [workflowKnowledge, setWorkflowKnowledge] = useState<api.MemoryEntry[]>([]);
  const [currentTask, setCurrentTask] = useState<api.Task | null>(null);
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ topic: '', content: '', importance: 0.5 });
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '', purpose: '' });
  const [apiHealthy, setApiHealthy] = useState(false);
  const [agentStatus, setAgentStatus] = useState<api.AgentStatus | null>(null);

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (apiHealthy) {
      loadData();
    }
  }, [apiHealthy]);

  useEffect(() => {
    if (currentWorkflow && apiHealthy) {
      loadWorkflowKnowledge();
    }
  }, [currentWorkflow, apiHealthy]);

  const checkApiHealth = async () => {
    const healthy = await api.healthCheck();
    setApiHealthy(healthy);
    
    if (healthy) {
      const status = await api.getAgentStatus();
      setAgentStatus(status);
      if (status.current_workflow) {
        setCurrentWorkflow(status.current_workflow);
      }
    }
  };

  const loadData = async () => {
    if (!apiHealthy) return;

    const [semantic, episodic, wf] = await Promise.all([
      api.getSemanticMemory(),
      api.getEpisodicMemory(),
      api.getWorkflows()
    ]);

    setSemanticMemory(semantic);
    setEpisodicMemory(episodic);
    setWorkflows(wf);
    
    // 找到当前工作流
    const current = wf.find(w => w.current);
    if (current) {
      setCurrentWorkflow(current.name);
    }
  };

  const loadWorkflowKnowledge = async () => {
    if (!currentWorkflow) return;
    
    try {
      const knowledge = await api.getWorkflowSpecificKnowledge(currentWorkflow, 10);
      setWorkflowKnowledge(knowledge);
    } catch (error) {
      console.error('加载工作流知识失败:', error);
    }
  };

  const handleAddKnowledge = async () => {
    if (!newKnowledge.topic || !newKnowledge.content) return;

    try {
      const content = JSON.parse(newKnowledge.content);
      await api.addKnowledge(
        newKnowledge.topic,
        content,
        parseFloat(newKnowledge.importance.toString())
      );
      setIsAddKnowledgeOpen(false);
      setNewKnowledge({ topic: '', content: '', importance: 0.5 });
      loadData();
    } catch (error) {
      console.error('添加知识失败:', error);
      alert('添加知识失败，请检查内容格式是否为有效的JSON');
    }
  };

  const handleAddWorkflow = async () => {
    if (!newWorkflow.name) return;

    try {
      await api.createWorkflow(
        newWorkflow.name,
        newWorkflow.description,
        newWorkflow.purpose
      );
      setIsAddWorkflowOpen(false);
      setNewWorkflow({ name: '', description: '', purpose: '' });
      loadData();
    } catch (error) {
      console.error('创建工作流失败:', error);
    }
  };

  const handleSwitchWorkflow = async (name: string) => {
    try {
      await api.switchWorkflow(name);
      setCurrentWorkflow(name);
      loadData();
    } catch (error) {
      console.error('切换工作流失败:', error);
    }
  };

  const handleExecuteTask = async (request: string, workflowName: string) => {
    try {
      const task = await api.createTask(request, workflowName);
      setCurrentTask(task);
      
      if (task.status === 'completed' || task.status === 'failed') {
        loadData();
        loadWorkflowKnowledge();
      }
    } catch (error) {
      console.error('执行任务失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold">Liminality Fallback</h1>
              <p className="text-xs text-gray-500">第一性原理对齐的智能体框架</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {agentStatus && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4" />
                <span>工作流: {currentWorkflow}</span>
                {agentStatus.knowledge_generator_enabled && (
                  <Badge variant="outline" className="text-xs">知识生成已启用</Badge>
                )}
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              apiHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiHealthy ? 'API 在线' : 'API 离线'}
            </div>
            <Button onClick={loadData} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!apiHealthy && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h3 className="font-medium text-red-800">API 服务未运行</h3>
                <p className="text-sm text-red-600">请先启动后端服务：python visualize/local_backend/main.py</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MemoryCard 
            title="语义记忆" 
            entries={semanticMemory} 
            onAdd={() => setIsAddKnowledgeOpen(true)}
            type="semantic"
          />
          <MemoryCard 
            title="情景记忆" 
            entries={episodicMemory}
            type="episodic"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <WorkflowCard 
            workflows={workflows} 
            currentWorkflow={currentWorkflow}
            onAdd={() => setIsAddWorkflowOpen(true)}
            onSwitch={handleSwitchWorkflow}
          />
          <div className="lg:col-span-2 space-y-6">
            <TaskCard 
              onSubmit={handleExecuteTask} 
              workflows={workflows}
              currentWorkflow={currentWorkflow}
            />
            <TaskStatusCard task={currentTask} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WorkflowKnowledgeCard 
            workflowName={currentWorkflow}
            knowledge={workflowKnowledge}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">系统概览</CardTitle>
              <CardDescription>框架功能和使用说明</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-indigo-600" />
                    核心功能
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      第一性原理对齐
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      自动知识生成
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      工作流切换
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      记忆pick-up
                    </li>
                  </ul>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                    使用说明
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      1. 创建或选择工作流
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      2. 执行任务
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      3. 系统自动提取知识
                    </li>
                    <li className="flex items-center">
                      <Check className="h-3 w-3 mr-2 text-green-500" />
                      4. 知识自动关联工作流
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 添加知识对话框 */}
      <Dialog open={isAddKnowledgeOpen} onOpenChange={setIsAddKnowledgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加知识到语义记忆</DialogTitle>
            <DialogDescription>
              向语义记忆中添加新的知识和概念
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">主题</Label>
              <Input
                id="topic"
                value={newKnowledge.topic}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, topic: e.target.value })}
                placeholder="知识主题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">内容 (JSON格式)</Label>
              <Textarea
                id="content"
                value={newKnowledge.content}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="importance">重要性 (0-1)</Label>
              <Input
                id="importance"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={newKnowledge.importance}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, importance: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAddKnowledgeOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddKnowledge}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加工作流对话框 */}
      <Dialog open={isAddWorkflowOpen} onOpenChange={setIsAddWorkflowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新工作流</DialogTitle>
            <DialogDescription>
              创建一个新的工作流来处理特定类型的任务
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">工作流名称</Label>
              <Input
                id="workflow-name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="工作流名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">描述</Label>
              <Textarea
                id="workflow-description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="工作流描述"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-purpose">目标（用于指导Agent）</Label>
              <Textarea
                id="workflow-purpose"
                value={newWorkflow.purpose}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, purpose: e.target.value })}
                placeholder="这个工作流的目标是什么？例如：生成高质量的小说文案"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAddWorkflowOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddWorkflow}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
