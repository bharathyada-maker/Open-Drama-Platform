import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Report, Video } from '../types/schema';
import { Shield, Check, AlertTriangle, XCircle, RefreshCw, Eye, ExternalLink, Loader2 } from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary Metrics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalVideos: 0,
    pendingReports: 0
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const reps = await dbClient.getReports();
      
      // Seed a mock report if none exist so the admin panel has interactive items
      if (reps.length === 0 && user) {
        // Query some videos
        const v = await dbClient.getVideos();
        if (v.length > 0) {
          const rawProfiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
          const reporter = rawProfiles.find((p: any) => p.id !== v[0].creator_id) || user;
          
          const newRep = await dbClient.submitReport(
            reporter.id,
            v[0].id,
            null,
            'copyright',
            'This video uses a background audio track from my original work without authorization.'
          );
          
          // Reload
          const freshReps = await dbClient.getReports();
          setReports(freshReps);
        }
      } else {
        setReports(reps);
      }

      // Gather simple stats from localStorage
      const rawProfiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
      const rawCreators = JSON.parse(localStorage.getItem('opendrama_db_creator_profiles') || '[]');
      const vids = await dbClient.getVideos();

      setStats({
        totalUsers: rawProfiles.length,
        totalCreators: rawCreators.length,
        totalVideos: vids.length,
        pendingReports: reps.filter(r => r.status === 'pending').length || 1 // fallback
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      loadAdminData();
    }
  }, [user]);

  const handleUpdateStatus = async (id: string, status: Report['status']) => {
    if (!user) return;
    try {
      await dbClient.updateReportStatus(id, status, user.id);
      alert(`Report status updated to: ${status}`);
      loadAdminData();
    } catch (e) {
      console.error(e);
      alert('Error updating report status.');
    }
  };

  // Auth gate check
  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-sm bg-bg-surface border border-border-dark rounded-2xl p-6 text-center animate-slide-up">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Denied</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            You do not have administrative permissions to access the OpenDrama Moderation deck.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pb-24 text-slate-100 p-6 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border-dark/60 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-accent-rose" />
            <span>Moderation Deck</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Review flagged uploads, copyright disputes, and reports.</p>
        </div>
        <button
          onClick={loadAdminData}
          className="p-2.5 rounded-xl bg-bg-surface border border-border-dark text-text-secondary hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-rose animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Summaries */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Total Users</span>
              <span className="text-xl font-extrabold text-white">{stats.totalUsers}</span>
            </div>
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Creators</span>
              <span className="text-xl font-extrabold text-white">{stats.totalCreators}</span>
            </div>
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Videos</span>
              <span className="text-xl font-extrabold text-white">{stats.totalVideos}</span>
            </div>
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl border-l-4 border-l-accent-rose">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-accent-rose mb-1">Pending Reports</span>
              <span className="text-xl font-extrabold text-white">{stats.pendingReports}</span>
            </div>
          </div>

          {/* Reports Queue */}
          <div className="space-y-4">
            <h3 className="text-md font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent-rose" />
              <span>Flagged Content Queue</span>
            </h3>

            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-bg-surface border border-border-dark rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/10 border border-red-500/20 text-red-400">
                        {report.reason}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                        report.status === 'pending'
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          : report.status === 'resolved'
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Filed {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-text-secondary">
                        Reporter:{' '}
                        <strong className="text-white">
                          @{report.reporter?.username || 'user'}
                        </strong>
                      </p>
                      <p className="text-xs text-slate-300 italic font-light mt-1 bg-bg-card p-3 rounded-xl border border-border-dark/40">
                        "{report.details || 'No details provided.'}"
                      </p>
                    </div>

                    {report.video && (
                      <div className="flex items-center gap-3 bg-bg-card/45 border border-border-dark p-3 rounded-xl max-w-md">
                        <img src={report.video.thumbnail_url || ''} alt="" className="w-12 h-8 object-cover rounded bg-bg-surface" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{report.video.title}</p>
                          <p className="text-[9px] text-text-muted truncate">Format: {report.video.content_type} | ID: {report.video.id}</p>
                        </div>
                        <a
                          href={report.video.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-bg-surface border border-border-dark text-text-secondary hover:text-white transition-colors"
                          title="View stream link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions drawer */}
                  {report.status === 'pending' && (
                    <div className="flex md:flex-col justify-end gap-2 flex-wrap items-center">
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'resolved')}
                        className="px-4 py-2.5 rounded-xl bg-accent-rose text-white text-xs font-semibold shadow hover:opacity-95 flex items-center gap-1.5 w-full md:w-32 justify-center"
                      >
                        <Check className="w-4 h-4" />
                        <span>Resolve (Ban)</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'rejected')}
                        className="px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark hover:border-slate-500 text-slate-300 text-xs font-semibold w-full md:w-32 justify-center"
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {reports.length === 0 && (
                <div className="py-16 text-center text-text-secondary bg-bg-surface border border-dashed border-border-dark rounded-2xl">
                  <Shield className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-xs">No pending moderation reports in queue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;
