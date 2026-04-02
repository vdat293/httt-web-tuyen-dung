import { useState, useEffect } from 'react';
import { savedJobsAPI } from '../../api';
import Layout from '../../components/Layout';
import JobCard from '../../components/JobCard';
import SaveJobButton from '../../components/SaveJobButton';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';

export default function CandidateSavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await savedJobsAPI.getAll();
      setSavedJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await savedJobsAPI.unsave(jobId);
      setSavedJobs((prev) => prev.filter((sj) => sj.job?._id !== jobId));
      addToast('Đã bỏ lưu tin tuyển dụng', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title">Việc đã lưu</h1>
        {!loading && savedJobs.length > 0 && (
          <span className="text-sm text-meta">{savedJobs.length} tin tuyển dụng</span>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="Chưa có tin đã lưu"
          description="Lưu lại những tin tuyển dụng quan tâm để xem lại sau."
          action={() => window.location.href = '/jobs'}
          actionLabel="Tìm việc ngay"
        />
      ) : (
        <div className="space-y-3">
          {savedJobs.map((savedJob) => {
            const job = savedJob.job;
            if (!job) return null;
            return (
              <div key={savedJob._id} className="relative">
                <JobCard job={job} />
                <div className="absolute top-3 right-3">
                  <SaveJobButton jobId={job._id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
