'use client';
import { useState, useEffect } from "react";
import { ListChecks, Circle, Clock, Eye, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/common/Toast";
import taskService from "@/services/taskService";

const STATUS_CONFIG = {
  TODO:        { icon: Circle,       color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
  IN_PROGRESS: { icon: Clock,        color: 'text-sky-500 bg-sky-100 dark:bg-sky-900/20' },
  IN_REVIEW:   { icon: Eye,          color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' },
  COMPLETED:   { icon: CheckCircle2, color: 'text-green-500 bg-green-100 dark:bg-green-900/20' },
};

const PRIORITY_COLOR = {
  LOW:    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  HIGH:   'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function MyTasksOverview() {
  const router = useRouter();
  const { showError } = useToast();
  const [taskStats,   setTaskStats]   = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await taskService.getMyTasks();
        if (res.success) {
          setTaskStats(res.stats);
          const assigned = res.assignedToMe?.slice(0, 2) || [];
          const created  = res.createdByMe?.slice(0, 2)  || [];
          setRecentTasks([...assigned, ...created].slice(0, 4));
        }
      } catch {
        showError('Failed to load task overview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded w-1/3" />
        <div className="h-20 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded" />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" /> My Tasks Overview
        </h2>
        <Link href="/efficiency/tasks" className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {taskStats && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'To Do',       value: taskStats.todo        || 0, cls: 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400' },
            { label: 'In Progress', value: taskStats.in_progress || 0, cls: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' },
            { label: 'In Review',   value: taskStats.in_review   || 0, cls: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
            { label: 'Completed',   value: taskStats.completed   || 0, cls: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`text-center p-2 rounded-xl ${cls.split(' ').slice(0, 2).join(' ')}`}>
              <div className={`text-lg font-bold ${cls.split(' ').slice(2).join(' ')}`}>{value}</div>
              <p className={`text-[10px] uppercase ${cls.split(' ').slice(2).join(' ')}`}>{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {recentTasks.length > 0 ? recentTasks.map(task => {
          const cfg        = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
          const StatusIcon = cfg.icon;
          return (
            <div
              key={task.id}
              onClick={() => router.push('/efficiency/tasks')}
              className="p-3 bg-almet-mystic/20 dark:bg-almet-san-juan/20 hover:bg-almet-mystic/40 dark:hover:bg-almet-san-juan/40 rounded-xl border border-almet-mystic/50 dark:border-almet-san-juan/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors flex-1">
                  {task.title}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.LOW}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${cfg.color}`}>
                  <StatusIcon className="h-3 w-3" />{task.status.replace('_', ' ')}
                </span>
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8">
            <p className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-1">No tasks yet</p>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-4">You have no assigned tasks at the moment.</p>
            <button
              onClick={() => router.push('/efficiency/tasks')}
              className="px-4 py-2 rounded-xl bg-almet-sapphire/10 text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:bg-almet-sapphire hover:text-white transition-all"
            >
              Go to Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
