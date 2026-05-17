import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, Star, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Overview = () => {
  const { user } = useAuth();
  const [recentLetters, setRecentLetters] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgAts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/cover-letters');
        const allLetters = res.data;
        setRecentLetters(allLetters.slice(0, 3)); // Just top 3
        
        if (allLetters.length > 0) {
          const sum = allLetters.reduce((acc, curr) => acc + (curr.ats_score || 0), 0);
          setStats({ 
            total: allLetters.length, 
            avgAts: Math.round(sum / allLetters.length) 
          });
        }
      } catch (error) {
        console.error("Failed to load letters", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-serif mb-2">Welcome back, {user?.full_name.split(' ')[0]} 👋</h1>
        <p className="text-textMuted">Here's an overview of your cover letter activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card border-t-4 border-t-accent flex items-center space-x-4">
          <div className="p-3 bg-accent/20 rounded-lg text-accent">
            <FileText size={28} />
          </div>
          <div>
            <div className="text-textMuted text-sm">Total Letters</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </div>
        
        <div className="card border-t-4 border-t-accentLight flex items-center space-x-4">
          <div className="p-3 bg-accentLight/20 rounded-lg text-accentLight">
            <Star size={28} />
          </div>
          <div>
            <div className="text-textMuted text-sm">Avg ATS Score</div>
            <div className="text-2xl font-bold">{stats.total > 0 ? `${stats.avgAts}%` : 'N/A'}</div>
          </div>
        </div>
        
        <Link to="/dashboard/generate" className="card border-t-4 border-t-green-500 flex items-center justify-between hover:bg-gray-800 transition-colors group cursor-pointer">
          <div>
            <div className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">Create New</div>
            <div className="text-textMuted text-sm">Generate ATS-ready letter</div>
          </div>
          <div className="text-accent">
            <PlusCircle size={36} />
          </div>
        </Link>
      </div>

      {/* Recent Letters */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold font-serif">Recent Cover Letters</h2>
          <Link to="/dashboard/letters" className="text-accent hover:underline text-sm font-medium">View all</Link>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-24 animate-pulse flex items-center px-6">
                <div className="w-12 h-12 bg-gray-700 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentLetters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recentLetters.map(letter => (
              <div key={letter.id} className="card flex items-center justify-between hover:border-accent transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <FileText size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{letter.title}</h3>
                    <div className="flex items-center text-sm text-textMuted space-x-3 mt-1">
                      <span className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(letter.created_at).toLocaleDateString()}</span>
                      {letter.ats_score && (
                        <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-xs border border-green-400/20">
                          {letter.ats_score}% ATS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link to={`/dashboard/letters/${letter.id}`} className="btn-secondary py-1.5 px-4 text-sm">
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 text-textMuted">
              <FileText size={48} />
            </div>
            <h3 className="text-xl font-bold mb-2">No cover letters yet</h3>
            <p className="text-textMuted mb-6">Create your first highly-optimized cover letter now.</p>
            <Link to="/dashboard/generate" className="btn-primary inline-flex items-center">
              <PlusCircle size={20} className="mr-2" />
              Generate Letter
            </Link>
          </div>
        )}
      </div>

      {/* CV Enhancement Tips */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold font-serif mb-6">How to Enhance Your CV for FAANG</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-surface/50 border-gray-800">
            <h3 className="font-bold text-lg mb-2 text-accent">Use the X-Y-Z Formula</h3>
            <p className="text-textMuted text-sm">
              "Accomplished [X] as measured by [Y], by doing [Z]." For example: "Reduced API latency by 30% by implementing Redis caching."
            </p>
          </div>
          <div className="card bg-surface/50 border-gray-800">
            <h3 className="font-bold text-lg mb-2 text-accent">Focus on Impact</h3>
            <p className="text-textMuted text-sm">
              Don't just list responsibilities. Highlight measurable results, cost savings, or efficiency gains.
            </p>
          </div>
          <div className="card bg-surface/50 border-gray-800">
            <h3 className="font-bold text-lg mb-2 text-accent">Tailor for ATS</h3>
            <p className="text-textMuted text-sm">
              Match keywords from the job description directly in your resume. Use standard section titles like "Experience" and "Education".
            </p>
          </div>
          <div className="card bg-surface/50 border-gray-800">
            <h3 className="font-bold text-lg mb-2 text-accent">Keep it Clean</h3>
            <p className="text-textMuted text-sm">
              Use a simple, readable format. Avoid graphics, tables, or complex layouts that confuse ATS parsers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
