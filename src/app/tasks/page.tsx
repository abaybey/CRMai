'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import { TaskStatus } from '@/types';
import { Filter, CheckCircle2, Calendar, Clock } from 'lucide-react';

export default function TasksPage() {
  const { refreshData } = useAuth();
  const tasks = retailDataStore.getTasks();
  const customers = retailDataStore.getCustomers();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState('');

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    retailDataStore.updateTaskStatus(
      taskId,
      newStatus,
      newStatus === 'completed' ? 'Telah diselesaikan oleh staf.' : undefined
    );
    refreshData();
    setFeedback(`Status tugas diperbarui.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <AppLayout
      title="Tugas & Tindak Lanjut"
      subtitle="Manajemen tindak lanjut clienteling & agenda kerja staf"
    >
      <div className="space-y-5">
        {feedback && (
          <div className="bg-[#EBF7EE] border border-[#D1EED5] p-3 rounded text-xs text-[#1E7E34] flex items-center justify-between">
            <span>✓ {feedback}</span>
            <button onClick={() => setFeedback('')} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#EAEAEA]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#777777]" />
              <span className="text-[#777777]">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-[#EAEAEA] rounded px-2 py-1 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="in_progress">Dalam Proses</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#777777]">Prioritas:</span>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="text-xs border border-[#EAEAEA] rounded px-2 py-1 bg-white"
              >
                <option value="all">Semua Prioritas</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-[#888888]">{filteredTasks.length} Tugas</span>
        </div>

        {/* Task Cards Stream */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-6 text-center text-xs text-[#888888]">
              Tidak ada tugas yang sesuai filter.
            </div>
          ) : (
            filteredTasks.map(task => {
              const customer = customers.find(c => c.id === task.customer_id);

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-lg border border-[#EAEAEA] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#D5D5D5] transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#555555]">
                        {task.priority}
                      </span>
                      <span className="text-xs font-medium text-[#111111]">
                        {customer
                          ? customer.full_name.replace('[DEMO] ', '')
                          : 'Tugas Operasional Gerai'}
                      </span>
                      {customer?.tier && (
                        <span className="text-[10px] text-[#777777]">• {customer.tier}</span>
                      )}
                      <span className="text-[10px] text-[#888888]">
                        ({task.task_type.replace('_', ' ')})
                      </span>
                    </div>

                    <p className="text-xs text-[#444444] leading-relaxed">
                      {task.recommended_action}
                    </p>

                    {task.notes && (
                      <p className="text-[11px] text-[#888888]">Catatan: {task.notes}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-[#888888] pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Jatuh tempo: {task.due_at.split('T')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Status: <strong className="uppercase text-[#444444]">{task.status}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    {task.status !== 'completed' ? (
                      <>
                        {task.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                            className="px-2.5 py-1 rounded border border-[#EAEAEA] text-xs font-medium text-[#444444] hover:bg-[#F5F5F5]"
                          >
                            Proses
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Selesai
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#1E7E34] font-medium bg-[#EBF7EE] px-2.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Selesai ({task.completed_at ? task.completed_at.split('T')[0] : 'Hari ini'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
