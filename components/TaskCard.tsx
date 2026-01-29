/**
 * Task card component for displaying individual tasks
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string, newStatus: 'PENDING' | 'COMPLETED') => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isLoading?: boolean;
}

export function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isLoading,
}: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED';

  return (
    <Card className="hover:shadow-md transition-shadow border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() =>
                onToggleStatus(task.id, isCompleted ? 'PENDING' : 'COMPLETED')
              }
              disabled={isLoading}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle
                className={`text-base ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </CardTitle>
              {task.description && (
                <p
                  className={`text-sm mt-1 ${
                    isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
            disabled={isLoading}
            className="flex-1"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(task.id)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
