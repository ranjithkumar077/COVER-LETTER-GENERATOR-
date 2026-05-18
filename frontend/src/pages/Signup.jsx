import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    // We check length manually in the checklist, regex just needs to ensure all conditions are met
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[@$!%*?&]/.test(password)) {
      toast.error('Password does not meet all security requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(fullName, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base relative overflow-hidden py-12">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl"></div>
      
      <div className="card w-full max-w-md z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-serif font-bold text-accent flex items-center justify-center space-x-2">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8 flex-shrink-0" />
            <span>Cover Letter Generator</span>
          </Link>
          <h2 className="text-3xl font-bold mt-6 mb-2">Create an Account</h2>
          <p className="text-textMuted">Start generating ATS-ready cover letters</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              className="input-field py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              className="input-field py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field py-2 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain bg-transparent border-none p-0 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Live Visual Checklist */}
            <div className="mt-3 text-xs space-y-1.5 p-3 bg-gray-800/50 rounded-md border border-gray-700/50">
              <div className={`flex items-center transition-colors ${password.length >= 8 ? "text-green-500" : "text-textMuted"}`}>
                <span className="mr-2 w-3">{password.length >= 8 ? '✓' : '○'}</span> Min 8 characters
              </div>
              <div className={`flex items-center transition-colors ${/[A-Z]/.test(password) ? "text-green-500" : "text-textMuted"}`}>
                <span className="mr-2 w-3">{/[A-Z]/.test(password) ? '✓' : '○'}</span> 1 capital letter
              </div>
              <div className={`flex items-center transition-colors ${/[a-z]/.test(password) ? "text-green-500" : "text-textMuted"}`}>
                <span className="mr-2 w-3">{/[a-z]/.test(password) ? '✓' : '○'}</span> 1 small letter
              </div>
              <div className={`flex items-center transition-colors ${/\d/.test(password) ? "text-green-500" : "text-textMuted"}`}>
                <span className="mr-2 w-3">{/\d/.test(password) ? '✓' : '○'}</span> 1 digit
              </div>
              <div className={`flex items-center transition-colors ${/[@$!%*?&]/.test(password) ? "text-green-500" : "text-textMuted"}`}>
                <span className="mr-2 w-3">{/[@$!%*?&]/.test(password) ? '✓' : '○'}</span> 1 special character (@$!%*?&)
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="input-field py-2 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain bg-transparent border-none p-0 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary w-full py-3 mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-textMuted">
          Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
