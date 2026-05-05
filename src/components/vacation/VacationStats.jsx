import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Download } from 'lucide-react';

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();
    const to = Number(target) || 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const animated = useCountUp(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">{title}</p>
          <p className={`text-xl font-semibold ${color}`}>{animated}</p>
          {subtitle && <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  );
};

function exportVacationCardPDF(balances, employeeName, year) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = [
    { label: 'Start Balance (Carried Over)', value: balances.start_balance ?? 0, color: '#7c3aed' },
    { label: 'Yearly Entitlement',           value: balances.yearly_balance,      color: '#4f46e5' },
    { label: 'Total Balance',                value: balances.total_balance,        color: '#1d4ed8', bold: true },
    { label: 'Used Days',                    value: balances.used_days,            color: '#ea580c' },
    { label: 'Scheduled (Future Plans)',     value: balances.scheduled_days,       color: '#0369a1' },
    { label: 'Remaining Balance',            value: balances.remaining_balance,    color: '#16a34a', bold: true },
    { label: 'Days to Plan',                 value: balances.should_be_planned,    color: '#dc2626' },
  ];

  const rowsHTML = rows.map(r => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:11px 16px;font-size:13px;color:#475569;${r.bold ? 'font-weight:700;' : ''}">${r.label}</td>
      <td style="padding:11px 16px;text-align:center;font-size:15px;font-weight:700;color:${r.color};">${r.value}</td>
    </tr>`).join('');

  const remaining = Number(balances.remaining_balance ?? 0);
  const statusColor = remaining > 10 ? '#16a34a' : remaining > 0 ? '#d97706' : '#dc2626';
  const statusText  = remaining > 10 ? 'Good Standing' : remaining > 0 ? 'Low Balance' : 'Balance Exhausted';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Vacation Balance Card – ${employeeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 32px 16px; }
    .card { background: #fff; border-radius: 16px; width: 600px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%); padding: 32px 36px 24px; color: #fff; }
    .logo { height: 36px; margin-bottom: 20px; }
    .header-title { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .header-sub { font-size: 12px; opacity: 0.75; margin-top: 2px; }
    .employee-row { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
    .emp-name { font-size: 16px; font-weight: 700; }
    .emp-year { font-size: 12px; opacity: 0.75; }
    .status-badge { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 600; }
    .body { padding: 28px 36px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f8fafc; }
    thead th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-row { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border-radius: 10px; padding: 14px 18px; }
    .status-label { font-size: 12px; color: #64748b; }
    .status-value { font-size: 13px; font-weight: 700; padding: 3px 14px; border-radius: 20px; color: #fff; }
    .footer { border-top: 1px solid #e2e8f0; padding: 16px 36px; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print {
      body { background: none; padding: 0; }
      .card { box-shadow: none; border-radius: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="https://www.myalmet.com/pdfs/logo.png" alt="Almet" class="logo" onerror="this.style.display='none'" />
      <div class="header-title">Vacation Balance Card</div>
      <div class="header-sub">Annual Leave Summary · ${year}</div>
      <div class="employee-row">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="avatar">${(employeeName || 'E').charAt(0).toUpperCase()}</div>
          <div>
            <div class="emp-name">${employeeName || '—'}</div>
            <div class="emp-year">Year ${year}</div>
          </div>
        </div>
        <div class="status-badge">Official Document</div>
      </div>
    </div>

    <div class="body">
      <table>
        <thead>
          <tr>
            <th style="text-align:left;">Description</th>
            <th style="text-align:center;">Days</th>
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>

      <div class="status-row">
        <div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;">Balance Status</div>
          <div class="status-label">As of ${today}</div>
        </div>
        <div class="status-value" style="background:${statusColor};">${statusText}</div>
      </div>
    </div>

    <div class="footer">
      Generated on ${today} · myalmet.com · Almet Holding
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=700,height=800');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export default function VacationStats({ balances, allowNegativeBalance, employeeName }) {
  const [exporting, setExporting] = useState(false);
  const year = new Date().getFullYear();

  const handleExport = () => {
    setExporting(true);
    exportVacationCardPDF(balances, employeeName, year);
    setTimeout(() => setExporting(false), 1000);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
          My Vacation Balance · {year}
        </h3>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-all shadow-sm disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? 'Opening…' : 'Export PDF'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Balance"
          value={balances.total_balance}
          icon={Calendar}
          color="text-almet-sapphire"
        />
        <StatCard
          title="Yearly Balance"
          value={balances.yearly_balance}
          icon={Calendar}
          color="text-almet-astral"
        />
        <StatCard
          title="Used Days"
          value={balances.used_days}
          icon={CheckCircle}
          color="text-orange-600"
        />
        <StatCard
          title="Remaining"
          value={balances.remaining_balance}
          icon={Clock}
          color="text-green-600"
          subtitle="Available now"
        />
        <StatCard
          title="Scheduled"
          value={balances.scheduled_days}
          icon={Users}
          color="text-almet-steel-blue"
          subtitle="Future plans"
        />
        <StatCard
          title="To Plan"
          value={balances.should_be_planned}
          icon={AlertCircle}
          color="text-red-600"
          subtitle="Must schedule"
        />
      </div>

      {!allowNegativeBalance && balances.remaining_balance < 5 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-600 rounded-r-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Low Balance Warning</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                You have only <strong>{balances.remaining_balance} days</strong> remaining.
                {balances.remaining_balance <= 0 && ' Negative balance is not allowed.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
