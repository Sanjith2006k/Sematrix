import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Headphones, 
  Sparkles, 
  Play,
  Code,
  X,
  Save,
  CheckCircle,
  ExternalLink,
  Target,
  Shuffle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../../components/GlassCard/GlassCard';
import ProgressRing from '../../components/ProgressRing/ProgressRing';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import FocusTimer from '../../components/FocusTimer/FocusTimer';
import AuthNavbar from '../../components/AuthNavbar/AuthNavbar';
import './Dashboard.css';
import toast from 'react-hot-toast';

const MotionGlassCard = motion(GlassCard);

const LOFI_STREAMS = [
  'https://streams.ilovemusic.de/iloveradio17.mp3', // Chillhop
  'https://stream.zeno.fm/f3wvbbqmdg8uv', // Lofi 
  'https://play.streamafrica.net/lofi' // Lofi Fallback
];

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match12 = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
  if (match12) {
    let [_, h, m, period] = match12;
    h = parseInt(h);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + parseInt(m);
  }
  const match24 = timeStr.match(/(\d+):(\d+)/);
  if (match24) {
    return parseInt(match24[1]) * 60 + parseInt(match24[2]);
  }
  return 0;
};

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JD';
  
  const [todayEntries, setTodayEntries] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [dsaProblems, setDsaProblems] = useState([]);
  const [dsaVideo, setDsaVideo] = useState(null);
  const [dsaLoading, setDsaLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [activeTab, setActiveTab] = useState('Easy');
  const [mainTab, setMainTab] = useState('Lab'); // 'Lab' or 'LeetCode'
  const [searchQuery, setSearchQuery] = useState('');
  const [solvedSearchQuery, setSolvedSearchQuery] = useState('');
  
  const [lofiPlaying, setLofiPlaying] = useState(false);
  const audioRef = useRef(null);
  const currentStreamIdxRef = useRef(0);
  const [currentStreamIdx, setCurrentStreamIdx] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Keep the ref in sync with state
  useEffect(() => {
    currentStreamIdxRef.current = currentStreamIdx;
  }, [currentStreamIdx]);

  const [problemNotes, setProblemNotes] = useState([]);
  const [focusNote, setFocusNote] = useState('');
  const [isSavingFocus, setIsSavingFocus] = useState(false);

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemContent, setProblemContent] = useState('');
  const [problemContentLoading, setProblemContentLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (user?.dsaFocusNote) {
      setFocusNote(user.dsaFocusNote);
    }
  }, [user]);

  useEffect(() => {
    const fetchTodayTimetable = async () => {
      try {
        const res = await axios.get('/api/timetable/entries');
        const todayDayOfWeek = new Date().getDay(); 
        const entriesForToday = res.data.filter(e => e.dayOfWeek === todayDayOfWeek);
        entriesForToday.sort((a, b) => a.timeSlotIndex - b.timeSlotIndex);
        
        if (user?.timeSlots && entriesForToday.length > 0) {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          let active = null;
          let next = null;
          const upcomingOrActiveEntries = [];

          for (let i = 0; i < entriesForToday.length; i++) {
            const entry = entriesForToday[i];
            const slotTimeStr = user.timeSlots[entry.timeSlotIndex];
            if (!slotTimeStr) continue;

            const slotMinutes = parseTimeToMinutes(slotTimeStr);
            const slotEndMinutes = slotMinutes + 60; 

            if (currentMinutes < slotEndMinutes) {
              upcomingOrActiveEntries.push(entry);
              
              if (currentMinutes >= slotMinutes && currentMinutes < slotEndMinutes) {
                active = { ...entry, timeStr: slotTimeStr };
              } else if (currentMinutes < slotMinutes && !next) {
                next = { ...entry, timeStr: slotTimeStr };
              }
            }
          }

          setTodayEntries(upcomingOrActiveEntries);
          setActiveSession(active);
          setNextSession(next);
        } else {
          setTodayEntries(entriesForToday);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard timetable", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchNotes = async () => {
      try {
        const res = await axios.get('/api/dsa/notes');
        setProblemNotes(res.data);
      } catch (err) {
        console.error("Failed to fetch notes", err);
      }
    }

    if (user) {
      fetchTodayTimetable();
      fetchNotes();
    }
  }, [user]);

  const targetSession = activeSession || nextSession;
  const lastFetchedSubject = useRef(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.post('/api/dsa/problems', { topic: 'All' });
        setDsaProblems(res.data || []);
      } catch (error) {
        console.error("Failed to fetch LeetCode problems", error);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    const subjectName = targetSession?.subject?.name;
    if (!subjectName) return;
    
    const fetchVideo = async () => {
      setDsaLoading(true);
      try {
        const videoRes = await axios.post('/api/dsa/video', { topic: subjectName, language: selectedLanguage });
        setDsaVideo(videoRes.data);
        lastFetchedSubject.current = subjectName;
      } catch (error) {
        console.error("Failed to fetch DSA video", error);
      } finally {
        setDsaLoading(false);
      }
    };

    fetchVideo();
  }, [targetSession?.subject?.name, selectedLanguage]);

  const playLofiRadio = () => {
    if (!audioRef.current) {
      const audio = new Audio(LOFI_STREAMS[currentStreamIdxRef.current]);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }
    audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    setLofiPlaying(true);
  };

  const pauseLofiRadio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src'); // Fully destroy stream connection
      audioRef.current.load();
      audioRef.current = null;
    }
    setLofiPlaying(false);
  };

  const toggleLofi = () => {
    if (lofiPlaying && audioRef.current) {
      pauseLofiRadio();
    } else {
      playLofiRadio();
    }
  };

  const shuffleLofi = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    
    const nextIdx = (currentStreamIdxRef.current + 1) % LOFI_STREAMS.length;
    setCurrentStreamIdx(nextIdx);
    currentStreamIdxRef.current = nextIdx;
    
    if (lofiPlaying) {
      playLofiRadio();
    }
  };

  const saveFocusNote = async () => {
    setIsSavingFocus(true);
    try {
      await axios.put('/api/dsa/focus', { dsaFocusNote: focusNote });
      toast.success('Focus note saved!');
    } catch (err) {
      toast.error('Failed to save focus note');
    } finally {
      setIsSavingFocus(false);
    }
  };

  const openProblemModal = async (prob) => {
    setSelectedProblem(prob);
    setProblemContent('');
    const existingNote = problemNotes.find(n => n.problemSlug === prob.titleSlug);
    if (existingNote) {
      setNoteContent(existingNote.notes);
      setCodeContent(existingNote.codeSnippet);
      setIsSolved(existingNote.isSolved);
    } else {
      setNoteContent('');
      setCodeContent('');
      setIsSolved(false);
    }

    setProblemContentLoading(true);
    try {
      const res = await axios.post('/api/dsa/problem-content', { titleSlug: prob.titleSlug });
      setProblemContent(res.data.content);
    } catch (err) {
      console.error(err);
      setProblemContent('<p style="color:#ff375f;">Failed to load problem description.</p>');
    } finally {
      setProblemContentLoading(false);
    }
  };

  const saveProblemNote = async () => {
    setIsSavingNote(true);
    try {
      const payload = {
        problemSlug: selectedProblem.titleSlug,
        title: selectedProblem.title,
        difficulty: selectedProblem.difficulty,
        topic: targetSession?.subject?.name || 'General',
        codeSnippet: codeContent,
        notes: noteContent,
        isSolved
      };
      const res = await axios.post('/api/dsa/notes', payload);
      
      // Update local state
      setProblemNotes(prev => {
        const filtered = prev.filter(n => n.problemSlug !== res.data.problemSlug);
        return [res.data, ...filtered];
      });
      
      toast.success('Notes saved successfully!');
      setSelectedProblem(null);
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNote(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };


  const filteredProblems = dsaProblems.filter(p => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const qId = p.frontendQuestionId ? p.frontendQuestionId.toString() : '';
    return p.title.toLowerCase().includes(lowerQuery) || qId.includes(lowerQuery);
  });

  const easyProblems = filteredProblems.filter(p => p.difficulty === 'Easy');
  const mediumProblems = filteredProblems.filter(p => p.difficulty === 'Medium');
  const hardProblems = filteredProblems.filter(p => p.difficulty === 'Hard');

  const filteredSolvedNotes = problemNotes.filter(n => {
    if (!n.isSolved) return false;
    if (!solvedSearchQuery) return true;
    return n.title.toLowerCase().includes(solvedSearchQuery.toLowerCase());
  });

  return (
    <div className="dashboard-layout">
      <AuthNavbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-greeting">
            Welcome back, {firstName}!
            <span>Here's your DSA practice overview for today.</span>
          </div>
          <div className="user-profile" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button 
              variant={lofiPlaying ? 'primary' : 'secondary'} 
              className="px-4 py-2 text-sm" 
              onClick={toggleLofi}
            >
              <Headphones size={16} /> {lofiPlaying ? 'Lofi Playing...' : 'Lofi Radio'}
            </Button>
            <Button 
              variant="secondary" 
              className="px-3 py-2 text-sm" 
              onClick={shuffleLofi}
              title="Shuffle Station"
            >
              <Shuffle size={16} />
            </Button>
          </div>
        </header>

        <motion.div 
          className="dashboard-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid-col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <MotionGlassCard variants={itemVariants}>
              <h2 className="dashboard-card-title">
                <Calendar size={20} color="#37AA9C" />
                Today's Timetable
              </h2>
              
              {!loading && todayEntries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {todayEntries.map((entry) => {
                    const isActive = activeSession?._id === entry._id;
                    const isNext = nextSession?._id === entry._id;
                    return (
                      <div key={entry._id} style={{ 
                        padding: '1rem', 
                        background: isActive ? 'rgba(55, 170, 156, 0.1)' : 'rgba(255,255,255,0.05)', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        borderLeft: `4px solid ${entry.subject?.color || '#37AA9C'}`,
                        border: isActive ? `1px solid ${entry.subject?.color}` : 'none'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{entry.subject?.name}</h3>
                          {isActive && <span style={{ color: '#37AA9C', fontSize: '0.8rem', fontWeight: 'bold' }}>ACTIVE NOW</span>}
                          {isNext && <span style={{ color: '#B8B8B8', fontSize: '0.8rem' }}>Next Session</span>}
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                          {user.timeSlots?.[entry.timeSlotIndex] || 'Time set'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#B8B8B8', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <Calendar size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                  <p>No study sessions scheduled for today.</p>
                  <Link to="/timetable">
                    <Button variant="primary" style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      Create Timetable
                    </Button>
                  </Link>
                </div>
              )}
            </MotionGlassCard>

            <MotionGlassCard variants={itemVariants}>
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <button 
                  onClick={() => setMainTab('Lab')}
                  style={{ background: 'transparent', border: 'none', color: mainTab === 'Lab' ? '#94F3E4' : '#B8B8B8', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Play size={20} /> DSA Practice Lab
                </button>
                <button 
                  onClick={() => setMainTab('LeetCode')}
                  style={{ background: 'transparent', border: 'none', color: mainTab === 'LeetCode' ? '#94F3E4' : '#B8B8B8', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Code size={20} /> All LeetCode Questions
                </button>
              </div>

              {mainTab === 'Lab' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#B8B8B8' }}>Language:</span>
                      <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                          color: '#94F3E4', padding: '0.4rem 0.8rem', borderRadius: '8px', outline: 'none',
                          fontWeight: 'bold', cursor: 'pointer'
                        }}
                      >
                        <option value="Python" style={{background: '#1a1a2e', color: 'white'}}>Python</option>
                        <option value="C++" style={{background: '#1a1a2e', color: 'white'}}>C++</option>
                        <option value="Java" style={{background: '#1a1a2e', color: 'white'}}>Java</option>
                        <option value="JavaScript" style={{background: '#1a1a2e', color: 'white'}}>JavaScript</option>
                        <option value="TypeScript" style={{background: '#1a1a2e', color: 'white'}}>TypeScript</option>
                        <option value="C#" style={{background: '#1a1a2e', color: 'white'}}>C#</option>
                        <option value="Go" style={{background: '#1a1a2e', color: 'white'}}>Go</option>
                        <option value="Rust" style={{background: '#1a1a2e', color: 'white'}}>Rust</option>
                        <option value="Ruby" style={{background: '#1a1a2e', color: 'white'}}>Ruby</option>
                        <option value="Swift" style={{background: '#1a1a2e', color: 'white'}}>Swift</option>
                      </select>
                    </div>
                  </div>
                  
                  {targetSession ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(148, 243, 228, 0.1)', borderRadius: '8px', borderLeft: '4px solid #94F3E4' }}>
                        <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {activeSession ? 'Current Focus: ' : 'Upcoming Focus: '}
                          {targetSession.subject?.name}
                        </h3>
                        <p style={{ color: '#B8B8B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          Master the topic by watching the best tutorial and practicing LeetCode problems in {selectedLanguage}.
                        </p>
                      </div>
                      
                      {dsaLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#37AA9C' }}>
                          <Sparkles className="animate-spin" size={24} style={{ margin: '0 auto 1rem auto' }} />
                          <p>Loading YouTube recommendations...</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                          {dsaVideo && (
                            <a 
                              href={`https://www.youtube.com/watch?v=${dsaVideo.videoId}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ 
                                borderRadius: '8px', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', 
                                position: 'relative', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' 
                              }}
                            >
                              <img 
                                src={`https://img.youtube.com/vi/${dsaVideo.videoId}/maxresdefault.jpg`} 
                                alt="Thumbnail" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,0,0,0.9)', padding: '0.75rem 1.25rem', borderRadius: '8px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}>
                                <Play size={18} fill="white" /> Watch Tutorial
                              </div>
                              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))', padding: '1rem', color: 'white' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94F3E4', fontWeight: 'bold', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Video for {targetSession.subject?.name}</div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{dsaVideo.title}</div>
                                {dsaVideo.channelTitle && <div style={{ fontSize: '0.75rem', color: '#B8B8B8', marginTop: '0.25rem' }}>by {dsaVideo.channelTitle}</div>}
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#B8B8B8', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <Play size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                      <p>You don't have an active study session right now.</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        {nextSession ? `Your next session is ${nextSession.subject?.name} at ${nextSession.timeStr}.` : 'Add DSA topics to your timetable to get video recommendations.'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {mainTab === 'LeetCode' && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Code size={16} color="#94F3E4" /> LeetCode Questions
                    </h4>
                    <input 
                      type="text" 
                      placeholder="Search problems or ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', outline: 'none', 
                        fontSize: '0.85rem', width: '250px'
                      }}
                    />
                  </div>
                  
                  {dsaProblems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Tabs Header */}
                      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        {['Easy', 'Medium', 'Hard'].map(diff => (
                          <button 
                            key={diff}
                            onClick={() => setActiveTab(diff)}
                            style={{
                              background: activeTab === diff ? 'rgba(255,255,255,0.1)' : 'transparent',
                              border: 'none',
                              color: activeTab === diff ? (diff === 'Easy' ? '#00b8a3' : diff === 'Medium' ? '#ffc01e' : '#ff375f') : '#B8B8B8',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: activeTab === diff ? 'bold' : 'normal',
                              transition: 'all 0.2s'
                            }}
                          >
                            {diff} ({diff === 'Easy' ? easyProblems.length : diff === 'Medium' ? mediumProblems.length : hardProblems.length})
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {(activeTab === 'Easy' ? easyProblems : activeTab === 'Medium' ? mediumProblems : hardProblems).map((prob, idx) => {
                          const isSolvedLocally = problemNotes.find(n => n.problemSlug === prob.titleSlug)?.isSolved;
                          const diffColor = prob.difficulty === 'Easy' ? '#00b8a3' : prob.difficulty === 'Medium' ? '#ffc01e' : '#ff375f';
                          return (
                            <div key={idx} onClick={() => openProblemModal(prob)} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', cursor: 'pointer', borderLeft: `3px solid ${diffColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.85rem' }}>
                                {prob.frontendQuestionId && <span style={{ color: '#B8B8B8', marginRight: '0.5rem' }}>#{prob.frontendQuestionId}</span>}
                                {prob.title}
                              </span>
                              {isSolvedLocally && <CheckCircle size={14} color={diffColor} />}
                            </div>
                          )
                        })}
                        
                        {(activeTab === 'Easy' ? easyProblems : activeTab === 'Medium' ? mediumProblems : hardProblems).length === 0 && (
                          <p style={{ color: '#B8B8B8', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>No {activeTab} problems found.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#B8B8B8' }}>
                      <Sparkles className="animate-spin" size={24} style={{ margin: '0 auto 1rem auto' }} />
                      <p>Loading LeetCode problems...</p>
                    </div>
                  )}
                </div>
              )}
            </MotionGlassCard>
            
            {/* Solved Problems Section */}
            <MotionGlassCard variants={itemVariants}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="dashboard-card-title" style={{ margin: 0 }}>
                  <CheckCircle size={20} color="#37AA9C" />
                  Solved Problems
                </h2>
                <input 
                  type="text" 
                  placeholder="Search solved..." 
                  value={solvedSearchQuery}
                  onChange={(e) => setSolvedSearchQuery(e.target.value)}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', outline: 'none', 
                    fontSize: '0.85rem', width: '150px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {filteredSolvedNotes.length > 0 ? (
                  filteredSolvedNotes.map((note, idx) => (
                    <div key={idx} onClick={() => openProblemModal({ title: note.title, titleSlug: note.problemSlug, difficulty: note.difficulty })} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{note.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#B8B8B8' }}>{note.topic}</div>
                      </div>
                      <div style={{ color: note.difficulty === 'Easy' ? '#00b8a3' : note.difficulty === 'Medium' ? '#ffc01e' : '#ff375f' }}>
                        {note.difficulty}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#B8B8B8', fontSize: '0.85rem', textAlign: 'center' }}>No problems found.</p>
                )}
              </div>
            </MotionGlassCard>
          </div>

          <div className="grid-col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <MotionGlassCard variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="dashboard-card-title" style={{ alignSelf: 'flex-start' }}>
                <Target size={20} color="#F3D250" />
                Focus Goals
              </h2>
              <p style={{ color: '#B8B8B8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                What DSA concepts should you concentrate on getting better at?
              </p>
              <textarea 
                value={focusNote}
                onChange={(e) => setFocusNote(e.target.value)}
                placeholder="e.g., I need to practice more Sliding Window problems and review Graph traversal..."
                style={{ 
                  width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', 
                  padding: '1rem', resize: 'none', marginBottom: '1rem', outline: 'none' 
                }}
              />
              <Button onClick={saveFocusNote} disabled={isSavingFocus} variant="primary" style={{ alignSelf: 'flex-end', fontSize: '0.8rem' }}>
                {isSavingFocus ? 'Saving...' : 'Save Notes'}
              </Button>
            </MotionGlassCard>

            <MotionGlassCard variants={itemVariants}>
              <h2 className="dashboard-card-title">
                <Clock size={20} color="#FF94B4" />
                Focus Mode
              </h2>
              <FocusTimer onTimerStart={playLofiRadio} onTimerStop={pauseLofiRadio} />
            </MotionGlassCard>
          </div>

        </motion.div>
      </main>

      {/* Problem Modal */}
      {selectedProblem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <MotionGlassCard 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>{selectedProblem.title}</h2>
                <span style={{ 
                  padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                  background: selectedProblem.difficulty === 'Easy' ? '#00b8a322' : selectedProblem.difficulty === 'Medium' ? '#ffc01e22' : '#ff375f22',
                  color: selectedProblem.difficulty === 'Easy' ? '#00b8a3' : selectedProblem.difficulty === 'Medium' ? '#ffc01e' : '#ff375f' 
                }}>
                  {selectedProblem.difficulty}
                </span>
              </div>
              <button onClick={() => setSelectedProblem(null)} style={{ background: 'transparent', border: 'none', color: '#B8B8B8', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <a 
                href={`https://leetcode.com/problems/${selectedProblem.titleSlug}`}
                target="_blank" rel="noreferrer"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#37AA9C', color: '#000', 
                  padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' 
                }}
              >
                <ExternalLink size={16} /> Take me to question
              </a>
              
              <div 
                onClick={() => setIsSolved(!isSolved)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  background: isSolved ? 'rgba(55, 170, 156, 0.2)' : 'rgba(255,255,255,0.05)', 
                  border: isSolved ? '1px solid #37AA9C' : '1px solid rgba(255,255,255,0.1)',
                  padding: '0.5rem 1rem', borderRadius: '6px', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' 
                }}
              >
                <CheckCircle size={16} color={isSolved ? '#37AA9C' : '#B8B8B8'} />
                {isSolved ? 'Marked as Solved' : 'Mark as Solved'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1.5rem', color: '#e0e0e0', fontSize: '0.95rem', lineHeight: '1.6', overflowY: 'auto', maxHeight: '300px' }} className="leetcode-content-html">
                {problemContentLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8B8B8' }}>
                    <Sparkles className="animate-spin" size={16} /> Loading problem description...
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: problemContent }} />
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: '#B8B8B8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Important Notes</label>
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="What was the core logic? Any edge cases?"
                  style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '1rem', resize: 'vertical', outline: 'none' }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#B8B8B8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Code Snippet</label>
                <textarea 
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="Paste your solution code here..."
                  style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94F3E4', padding: '1rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button onClick={() => setSelectedProblem(null)} variant="secondary">Cancel</Button>
              <Button onClick={saveProblemNote} variant="primary" disabled={isSavingNote}>
                {isSavingNote ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </MotionGlassCard>
        </div>
      )}
    </div>
  );
}
