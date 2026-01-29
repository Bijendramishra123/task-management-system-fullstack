/**
 * Dashboard Page - Main task management interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TaskCard } from '@/components/TaskCard';
import { TaskDialog } from '@/components/TaskDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Plus, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter and search state
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');

  // Task dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // Fetch tasks
  const fetchTasks = async (page: number = 1, searchTerm: string = '', filterStatus: string = '') => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus && filterStatus !== 'ALL') params.append('status', filterStatus);

      const response = await apiClient.get(`/api/tasks?${params}`);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error('Failed to load tasks');
      console.error('[v0] Fetch tasks error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (accessToken) {
      fetchTasks(1, search, status);
    }
  }, [accessToken]);

  // Handle search and filter changes
  const handleSearch = async (term: string) => {
    setSearch(term);
    await fetchTasks(1, term, status);
  };

  const handleFilterChange = async (newStatus: 'ALL' | 'PENDING' | 'COMPLETED') => {
    setStatus(newStatus);
    await fetchTasks(1, search, newStatus);
  };

  // Create task
  const handleCreateTask = async (data: { title: string; description: string }) => {
    try {
      setIsLoading(true);
      await apiClient.post('/api/tasks', {
        title: data.title,
        description: data.description,
      });
      toast.success('Task created successfully');
      setDialogOpen(false);
      await fetchTasks(1, search, status);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  // Update task
  const handleUpdateTask = async (data: { title: string; description: string }) => {
    if (!selectedTask) return;

    try {
      setIsLoading(true);
      await apiClient.patch(`/api/tasks/${selectedTask.id}`, {
        title: data.title,
        description: data.description,
      });
      toast.success('Task updated successfully');
      setDialogOpen(false);
      setSelectedTask(undefined);
      await fetchTasks(pagination.page, search, status);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle task status
  const handleToggleStatus = async (taskId: string, newStatus: 'PENDING' | 'COMPLETED') => {
    try {
      await apiClient.patch(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated');
      await fetchTasks(pagination.page, search, status);
    } catch (error: any) {
      toast.error('Failed to update task');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiClient.delete(`/api/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      await fetchTasks(pagination.page, search, status);
    } catch (error: any) {
      toast.error('Failed to delete task');
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const stats = {
    total: pagination.total,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Task Manager</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Circle className="h-4 w-4 text-yellow-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="md:flex-1"
            />

            <Select value={status} onValueChange={(val: any) => handleFilterChange(val)}>
              <SelectTrigger className="md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tasks</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSelectedTask(undefined);
                setDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Tasks grid */}
          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <Card className="border border-border text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {search || status !== 'ALL' ? 'No tasks found.' : 'No tasks yet. Create one to get started!'}
                </p>
                {!search && status === 'ALL' && (
                  <Button
                    onClick={() => {
                      setSelectedTask(undefined);
                      setDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(task) => {
                    setSelectedTask(task);
                    setDialogOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => fetchTasks(Math.max(1, pagination.page - 1), search, status)}
                disabled={pagination.page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchTasks(Math.min(pagination.totalPages, pagination.page + 1), search, status)}
                disabled={pagination.page === pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </main>

        {/* Task dialog */}
        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={selectedTask}
          onSave={selectedTask ? handleUpdateTask : handleCreateTask}
          isLoading={isLoading}
        />
      </div>
    </ProtectedRoute>
  );
}
