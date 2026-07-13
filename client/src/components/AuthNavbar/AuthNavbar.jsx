import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, LayoutDashboard, Calendar, LogOut, Settings, Lock, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AuthNavbar.css';

export default function AuthNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const openSettings = () => {
    setDropdownOpen(false);
    setSettingsOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setSettingsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JD';

  return (
    <>
      <nav className="auth-navbar">
        <Link to="/dashboard" className="auth-nav-logo">
          <BrainCircuit color="#37AA9C" size={28} />
          <span>Sematrix</span>
        </Link>
        
        <div className="auth-nav-links">
          <Link 
            to="/dashboard" 
            className={`auth-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link 
            to="/timetable" 
            className={`auth-nav-link ${location.pathname === '/timetable' ? 'active' : ''}`}
          >
            <Calendar size={18} /> Timetable
          </Link>
        </div>

        <div className="auth-nav-profile" ref={dropdownRef}>
          <div 
            className="auth-avatar" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
            title="Profile Menu"
          >
            {initials}
          </div>

          {dropdownOpen && (
            <div className="auth-dropdown">
              <div className="auth-dropdown-header">
                <div className="auth-dropdown-name">{user?.name || 'User'}</div>
                <div className="auth-dropdown-email">{user?.email || ''}</div>
              </div>
              <div className="auth-dropdown-divider" />
              <button className="auth-dropdown-item" onClick={openSettings}>
                <Settings size={16} /> Settings
              </button>
              <button className="auth-dropdown-item auth-dropdown-logout" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2><Settings size={22} /> Settings</h2>
              <button className="settings-close" onClick={() => setSettingsOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="settings-section">
              <h3><Lock size={16} /> Change Password</h3>
              <form onSubmit={handleChangePassword} className="settings-form">
                <div className="settings-field">
                  <label>Current Password</label>
                  <div className="settings-input-wrap">
                    <input 
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button type="button" className="settings-eye" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>New Password</label>
                  <div className="settings-input-wrap">
                    <input 
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      required
                      minLength={6}
                    />
                    <button type="button" className="settings-eye" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <div className="settings-input-wrap">
                    <input 
                      type={showNew ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="settings-save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
