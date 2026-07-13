import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Trash2, Save, LayoutDashboard, BrainCircuit, Settings, LogOut, Calendar, BookOpen, Clock, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/GlassCard/GlassCard';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import AuthNavbar from '../../components/AuthNavbar/AuthNavbar';
import './Timetable.css';
import '../Dashboard/Dashboard.css'; // Reusing layout styles

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#37AA9C', '#94F3E4', '#FF94B4', '#B497CF', '#F3D250', '#F7786B'];

export default function Timetable() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [activeSubject, setActiveSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user?.timeSlots && user.timeSlots.length > 0) {
        setTimeSlots(user.timeSlots);
      } else {
        setTimeSlots(["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"]);
      }
      const [subsRes, entriesRes] = await Promise.all([
        axios.get('/api/timetable/subjects'),
        axios.get('/api/timetable/entries')
      ]);
      setSubjects(subsRes.data);
      setEntries(entriesRes.data);
    } catch (error) {
      toast.error('Failed to fetch timetable data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const color = COLORS[subjects.length % COLORS.length];
      const res = await axios.post('/api/timetable/subjects', { name: newSubjectName, color });
      setSubjects([...subjects, res.data]);
      setNewSubjectName('');
      toast.success('Subject added');
    } catch (error) {
      toast.error('Failed to add subject');
    }
  };

  const handleDeleteSubject = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/timetable/subjects/${id}`);
      setSubjects(subjects.filter(s => s._id !== id));
      setEntries(entries.filter(e => e.subject?._id !== id));
      if (activeSubject?._id === id) setActiveSubject(null);
      toast.success('Subject deleted');
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const handleCellClick = async (dayOfWeek, timeSlotIndex) => {
    const existingEntry = entries.find(e => e.dayOfWeek === dayOfWeek && e.timeSlotIndex === timeSlotIndex);
    
    try {
      if (existingEntry) {
        // If clicking with same subject, or no subject selected, delete the entry
        if (!activeSubject || existingEntry.subject?._id === activeSubject._id) {
          await axios.delete(`/api/timetable/entries/${dayOfWeek}/${timeSlotIndex}`);
          setEntries(entries.filter(e => e._id !== existingEntry._id));
          return;
        }
      }
      
      // Add or overwrite entry
      if (!activeSubject) {
        toast('Select a subject first to paint!', { icon: '🖌️' });
        return;
      }

      const res = await axios.post('/api/timetable/entries', {
        subjectId: activeSubject._id,
        dayOfWeek,
        timeSlotIndex
      });

      // Filter out old entry if it existed
      const filteredEntries = entries.filter(e => !(e.dayOfWeek === dayOfWeek && e.timeSlotIndex === timeSlotIndex));
      setEntries([...filteredEntries, res.data]);
    } catch (error) {
      toast.error('Failed to update entry');
    }
  };

  const handleTimeSlotChange = (index, value) => {
    const newSlots = [...timeSlots];
    newSlots[index] = value;
    setTimeSlots(newSlots);
  };

  const saveTimeSlots = async () => {
    try {
      await axios.put('/api/timetable/slots', { timeSlots });
      toast.success('Time blocks saved!');
    } catch (error) {
      toast.error('Failed to save time blocks');
    }
  };

  const getEntryForCell = (day, slotIdx) => {
    return entries.find(e => e.dayOfWeek === day && e.timeSlotIndex === slotIdx);
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading Timetable...</div>;
  }

  return (
    <div className="dashboard-layout">
      <AuthNavbar />

      {/* Main Timetable Area */}
      <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
          <div className="dashboard-greeting">
            DSA Timetable
            <span>Create DSA topics and click the grid to paint your schedule.</span>
          </div>
          <Button variant="secondary" onClick={saveTimeSlots}>
            <Save size={16} /> Save Slots
          </Button>
        </header>

        <div className="timetable-page">
          {/* Left Palette */}
          <div className="timetable-sidebar">
            <GlassCard className="palette-card">
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>DSA Topics Palette</h3>
              <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Arrays, DP..." 
                  className="time-slot-input"
                />
                <Button type="submit" variant="primary" style={{ padding: '0.5rem', minWidth: '40px' }}>
                  <Plus size={16} />
                </Button>
              </form>
              
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <p style={{ color: '#B8B8B8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Suggested Topics:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['Arrays', 'Two Pointers', 'Sliding Window', 'Dynamic Programming', 'Trees', 'Graphs', 'Binary Search', 'Linked List'].map(topic => (
                    <span 
                      key={topic}
                      onClick={() => setNewSubjectName(topic)}
                      style={{ 
                        fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#E0E0E0', 
                        padding: '0.3rem 0.6rem', borderRadius: '12px', cursor: 'pointer', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="subject-list">
                {subjects.map(sub => (
                  <motion.div
                    key={sub._id}
                    className={`subject-tag ${activeSubject?._id === sub._id ? 'active' : ''}`}
                    onClick={() => setActiveSubject(sub)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="subject-info">
                      <div className="subject-color-indicator" style={{ background: sub.color }}></div>
                      <span style={{ color: 'white' }}>{sub.name}</span>
                    </div>
                    <button className="delete-btn" onClick={(e) => handleDeleteSubject(e, sub._id)}>
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
                {subjects.length === 0 && (
                  <p style={{ color: '#B8B8B8', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                    Add a DSA topic to start painting.
                  </p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Grid */}
          <GlassCard className="grid-card">
            <div className="calendar-wrapper">
              <div className="calendar-grid">
                {/* Header */}
                <div className="grid-header">
                  <div className="grid-header-cell">Time</div>
                  {DAYS.map((day, idx) => (
                    <div key={day} className="grid-header-cell" style={{ color: day === 'Sun' || day === 'Sat' ? '#FF94B4' : '#FFFFFF' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {timeSlots.map((time, slotIdx) => {
                  // Helper to ensure value is HH:mm for native time input
                  const to24Hour = (timeStr) => {
                    if (!timeStr) return "00:00";
                    const match12 = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
                    if (match12) {
                      let hours = parseInt(match12[1]);
                      const minutes = match12[2];
                      const period = match12[3].toUpperCase();
                      if (hours === 12 && period === 'AM') hours = 0;
                      if (hours !== 12 && period === 'PM') hours += 12;
                      return `${hours.toString().padStart(2, '0')}:${minutes}`;
                    }
                    return timeStr; // Already 24h or arbitrary string
                  };

                  return (
                    <div className="grid-row" key={slotIdx}>
                      <div className="time-label">
                        <input 
                          type="time" 
                          value={to24Hour(time)} 
                          onChange={(e) => handleTimeSlotChange(slotIdx, e.target.value)}
                          className="time-label-input"
                        />
                      </div>
                      {DAYS.map((_, dayIdx) => {
                      const entry = getEntryForCell(dayIdx, slotIdx);
                      return (
                        <div 
                          key={`${slotIdx}-${dayIdx}`} 
                          className="grid-cell"
                          onClick={() => handleCellClick(dayIdx, slotIdx)}
                        >
                          {entry && entry.subject && (
                            <motion.div 
                              className="grid-cell-content"
                              style={{ background: entry.subject.color }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                              {entry.subject.name}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  );
                })}
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Button variant="secondary" onClick={() => setTimeSlots([...timeSlots, 'New Slot'])}>
                  <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Time Block
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
