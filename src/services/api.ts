/**
 * API 服务模块 - 与后端交互
 */

const API_BASE_URL = 'http://localhost:8000/api';

// 类型定义
export interface MemoryEntry {
  entry_id: string;
  topic: string;
  content: any;
  importance: number;
  access_count: number;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface Episode {
  episode_id: string;
  request: string;
  output: string;
  success: boolean;
  created_at: string;
  metadata?: any;
}

export interface Workflow {
  workflow_id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  state: string;
}

export interface WorkflowStep {
  step_id: string;
  name: string;
  description: string;
  action: string;
  dependencies: string[];
}

export interface Task {
  task_id: string;
  status: 'running' | 'completed' | 'failed';
  output: string;
  error: string;
  extracted_knowledge_count: number;
}

export interface WorkflowInfo {
  name: string;
  description: string;
  current: boolean;
}

export interface AgentStatus {
  status: string;
  current_workflow: string;
  workflows_count: number;
  memory_enabled: {
    semantic: boolean;
    episodic: boolean;
  };
  knowledge_generator_enabled: boolean;
}

export interface SystemStats {
  semantic_memory: any;
  episodic_memory: any;
  workflows: {
    count: number;
    list: WorkflowInfo[];
    current: string;
  };
  tasks: {
    total: number;
    completed: number;
    failed: number;
    running: number;
  };
}

// API 函数

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    return false;
  }
}

export async function getAgentStatus(): Promise<AgentStatus> {
  const response = await fetch(`${API_BASE_URL}/agent/status`);
  return response.json();
}

export async function getStats(): Promise<SystemStats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  return response.json();
}

// 语义记忆 API
export async function getSemanticMemory(query?: string, limit?: number): Promise<MemoryEntry[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (limit) params.append('limit', limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/semantic-memory?${params}`);
  const data = await response.json();
  return data.items;
}

export async function addKnowledge(topic: string, content: any, importance: number = 0.5): Promise<{ entry_id: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, content, importance }),
  });
  return response.json();
}

export async function getWorkflowKnowledge(workflowName: string, limit: number = 10): Promise<MemoryEntry[]> {
  const response = await fetch(`${API_BASE_URL}/workflow-knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow_name: workflowName, limit }),
  });
  const data = await response.json();
  return data.items;
}

// 情景记忆 API
export async function getEpisodicMemory(request?: string, limit?: number): Promise<Episode[]> {
  const params = new URLSearchParams();
  if (request) params.append('request', request);
  if (limit) params.append('limit', limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/episodic-memory?${params}`);
  const data = await response.json();
  return data.items;
}

// 工作流 API
export async function getWorkflows(): Promise<WorkflowInfo[]> {
  const response = await fetch(`${API_BASE_URL}/workflows`);
  const data = await response.json();
  return data.workflows;
}

export async function createWorkflow(name: string, description?: string, purpose?: string): Promise<{ status: string; workflow: Workflow; message: string }> {
  const response = await fetch(`${API_BASE_URL}/workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, purpose }),
  });
  return response.json();
}

export async function switchWorkflow(workflowName: string): Promise<{ status: string; workflow_name: string; related_knowledge_count: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/workflow/${workflowName}/switch`, {
    method: 'POST',
  });
  return response.json();
}

export async function getWorkflowSpecificKnowledge(workflowName: string, limit?: number): Promise<MemoryEntry[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/workflow/${workflowName}/knowledge?${params}`);
  const data = await response.json();
  return data.items;
}

export async function deleteWorkflow(workflowName: string): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/workflow/${workflowName}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function saveWorkflow(workflowName: string): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/workflow/${workflowName}/save`, {
    method: 'POST',
  });
  return response.json();
}

export async function reloadWorkflows(): Promise<{ status: string; workflows: WorkflowInfo[]; message: string }> {
  const response = await fetch(`${API_BASE_URL}/workflows/reload`, {
    method: 'POST',
  });
  return response.json();
}

export async function getWorkflowStorageStats(): Promise<{ status: string; stats: any }> {
  const response = await fetch(`${API_BASE_URL}/workflow/storage/stats`);
  return response.json();
}

// 任务 API
export async function createTask(request: string, workflowName: string = 'default'): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request, workflow_name: workflowName }),
  });
  return response.json();
}

export async function getTaskStatus(taskId: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}`);
  return response.json();
}

// 反馈 API
export async function addFeedback(content: string, feedbackType: string, rating: number = 0.0): Promise<{ status: string; analysis: any }> {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, feedback_type: feedbackType, rating }),
  });
  return response.json();
}
