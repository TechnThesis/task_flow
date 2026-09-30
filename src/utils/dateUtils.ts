export function getRelativeDueDateInfo(dueDateString: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isSoon: boolean;
  colorClass: string;
} {
  if (!dueDateString) {
    return {
      label: 'No due date',
      isOverdue: false,
      isToday: false,
      isSoon: false,
      colorClass: 'text-neutral-400',
    };
  }

  // Today reference (2026-09-30)
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  const due = new Date(dueDateString + 'T00:00:00');
  const today = new Date(todayDateStr + 'T00:00:00');

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      label: daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`,
      isOverdue: true,
      isToday: false,
      isSoon: false,
      colorClass: 'text-rose-600 font-medium',
    };
  } else if (diffDays === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isToday: true,
      isSoon: true,
      colorClass: 'text-amber-600 font-medium',
    };
  } else if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      isToday: false,
      isSoon: true,
      colorClass: 'text-blue-600',
    };
  } else if (diffDays <= 4) {
    return {
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      isToday: false,
      isSoon: true,
      colorClass: 'text-neutral-600',
    };
  } else {
    // Format Month Day (e.g. Oct 12)
    const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      label: `Due ${formatted}`,
      isOverdue: false,
      isToday: false,
      isSoon: false,
      colorClass: 'text-neutral-500',
    };
  }
}

export function formatSimpleDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}
