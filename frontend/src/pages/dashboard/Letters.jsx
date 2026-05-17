import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Trash2, Edit, Download, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Letters = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadDropdownId, setDownloadDropdownId] = useState(null);

  const fetchLetters = async () => {
    try {
      const res = await api.get('/cover-letters');
      setLetters(res.data);
    } catch (error) {
      toast.error('Failed to load letters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cover letter?')) {
      try {
        await api.delete(`/cover-letters/${id}`);
        setLetters(letters.filter(l => l.id !== id));
        toast.success('Letter deleted');
      } catch (error) {
        toast.error('Failed to delete letter');
      }
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await api.get(`/cover-letters/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'Cover_Letter'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDownloadTxt = async (id, title) => {
    try {
      const res = await api.get(`/cover-letters/${id}/txt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'Cover_Letter'}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const filteredLetters = letters.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">My Cover Letters</h1>
          <p className="text-textMuted">Manage and download your generated letters.</p>
        </div>
        <Link to="/dashboard/generate" className="btn-primary inline-flex items-center">
          <PlusCircle size={20} className="mr-2" />
          Generate New
        </Link>
      </div>

      <div className="card p-0 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-800 flex items-center bg-surface/50">
          <Search size={20} className="text-textMuted mr-3" />
          <input 
            type="text" 
            placeholder="Search by role or company..." 
            className="bg-transparent border-none focus:outline-none text-textMain w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-textMuted flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mb-4"></div>
            Loading letters...
          </div>
        ) : filteredLetters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 text-textMuted text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredLetters.map(letter => (
                  <tr key={letter.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg mb-1">{letter.job_title}</div>
                      <div className="text-textMuted text-sm flex items-center">
                        <span className="text-accent mr-2">{letter.company_name}</span>
                        {letter.ats_score && <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs">{letter.ats_score}% ATS Match</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${letter.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-accent/10 text-accent'}`}>
                        {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-textMuted text-sm">
                      {new Date(letter.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-3">
                        <Link to={`/dashboard/letters/${letter.id}`} className="p-2 text-textMuted hover:text-accent bg-gray-800 rounded-md transition-colors" title="View/Edit">
                          <Edit size={18} />
                        </Link>
                        
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setDownloadDropdownId(downloadDropdownId === letter.id ? null : letter.id)} 
                            className="p-2 text-textMuted hover:text-accent bg-gray-800 rounded-md transition-colors" 
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          
                          {downloadDropdownId === letter.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-surface border border-gray-700 rounded-lg shadow-xl z-50">
                              <div className="p-2 text-xs text-textMuted border-b border-gray-700">Choose format:</div>
                              <button 
                                onClick={() => { handleDownload(letter.id, letter.title || letter.job_title); setDownloadDropdownId(null); }} 
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 flex items-center space-x-2 text-textMain"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>PDF Document</span>
                              </button>
                              <button 
                                onClick={() => { handleDownloadTxt(letter.id, letter.title || letter.job_title); setDownloadDropdownId(null); }} 
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 flex items-center space-x-2 text-textMain"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Text File (.txt)</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button onClick={() => handleDelete(letter.id)} className="p-2 text-textMuted hover:text-red-400 bg-gray-800 rounded-md transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 text-textMuted">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">No letters found</h3>
            <p className="text-textMuted mb-4">You haven't generated any cover letters yet, or none match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Letters;
