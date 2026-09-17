import { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiAlertCircle, FiShare2, FiMail, FiX, FiCamera, FiSearch, FiUserCheck, FiRefreshCw, FiCalendar, FiUser, FiFilter, FiChevronDown, FiCheck, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { TbQrcode, TbMailCheck, TbMailDown, TbCalendarEvent } from 'react-icons/tb';
import { Html5Qrcode } from 'html5-qrcode';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AttendanceMonitor() {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date selection state for viewing history date-wise
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const isViewingToday = selectedDate === todayStr;

  // Student-wise observation state
  const [selectedStudentId, setSelectedStudentId] = useState('ALL'); // 'ALL' or specific student dbId / studentId
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentHistoryData, setStudentHistoryData] = useState([]);
  const [studentDateMode, setStudentDateMode] = useState('ALL_DATES'); // 'ALL_DATES' or YYYY-MM-DD

  // Custom attractive student dropdown state
  const studentDropdownRef = useRef(null);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [dropdownSearchText, setDropdownSearchText] = useState('');

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scanner modal & camera states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [notificationModal, setNotificationModal] = useState(null);

  const html5QrCodeRef = useRef(null);

  // Load students list sorted by Student ID
  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/students', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        const studentArray = Array.isArray(data) ? data : (data.students || []);
        const sorted = [...studentArray].sort((a, b) => {
          const idA = a.studentId || '';
          const idB = b.studentId || '';
          return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
        });
        setStudents(sorted);
      }
    } catch (err) {
      console.error('Error fetching students for attendance:', err);
    }
  };

  // Load attendance logs from database for selected date
  const fetchAttendanceByDate = async (targetDateStr) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryDate = targetDateStr || selectedDate;
      const res = await fetch(`/api/attendance/today?date=${queryDate}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          const formatted = result.data.map(item => {
            const studentObj = item.student || {};
            const studentName = studentObj.name || 'Unknown Student';
            const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';

            return {
              id: item._id,
              studentDbId: studentObj._id,
              studentId: studentObj.studentId || 'N/A',
              name: studentName,
              initials,
              bgClass: studentObj.color || 'bg-indigo-600',
              time: item.timeArrived || new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: item.status || 'Present',
              statusClass: 'bg-emerald-50 text-emerald-600',
              notified: Boolean(item.whatsappSent),
              parentMobile: studentObj.parentMobile || 'Not Provided'
            };
          });
          setAttendanceData(formatted);
        } else {
          setAttendanceData([]);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance logs for date:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load complete attendance history for a specific student across dates
  const fetchStudentHistory = async (studentDbOrStrId, targetDateStr) => {
    if (!studentDbOrStrId || studentDbOrStrId === 'ALL') {
      setStudentHistoryData([]);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const dateQuery = targetDateStr !== undefined ? targetDateStr : studentDateMode;
      const url = (dateQuery && dateQuery !== 'ALL_DATES')
        ? `/api/attendance/today?studentId=${studentDbOrStrId}&date=${dateQuery}`
        : `/api/attendance/student/${studentDbOrStrId}`;

      const res = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          const formatted = result.data.map(item => {
            const studentObj = item.student || {};
            const studentName = studentObj.name || 'Unknown Student';
            const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
            const recordDate = item.date || item.createdAt;
            const dateStr = recordDate ? new Date(recordDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

            return {
              id: item._id,
              studentDbId: studentObj._id,
              studentId: studentObj.studentId || 'N/A',
              name: studentName,
              initials,
              bgClass: studentObj.color || 'bg-indigo-600',
              dateFormatted: dateStr,
              dateISO: recordDate ? new Date(recordDate).toISOString().split('T')[0] : '',
              time: item.timeArrived || new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: item.status || 'Present',
              statusClass: 'bg-emerald-50 text-emerald-600',
              notified: Boolean(item.whatsappSent),
              parentMobile: studentObj.parentMobile || 'Not Provided'
            };
          });
          setStudentHistoryData(formatted);
        } else {
          setStudentHistoryData([]);
        }
      }
    } catch (err) {
      console.error('Error fetching student attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId === 'ALL') {
      fetchAttendanceByDate(selectedDate);
    } else {
      fetchStudentHistory(selectedStudentId, studentDateMode);
    }
  }, [selectedDate, selectedStudentId, studentDateMode]);

  // Cleanup scanner instance
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping QR camera scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const startCamera = async () => {
    setScanError('');
    setScanResult(null);

    // Wait for DOM element
    setTimeout(async () => {
      const element = document.getElementById('qr-reader');
      if (!element) return;

      try {
        if (html5QrCodeRef.current) {
          await stopCamera();
        }

        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText) => {
            handleDecodedQR(decodedText);
          },
          () => {
            // Ignore repetitive frame parse errors
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Camera access error:', err);
        setScanError('Unable to access camera. Please check browser permissions.');
        setIsScanning(false);
      }
    }, 100);
  };

  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen]);

  // Process decoded QR code payload & automatically mark attendance in MongoDB
  const handleDecodedQR = async (decodedText) => {
    stopCamera();
    setScanError('');
    setScanResult(null);

    let parsedData = null;
    try {
      parsedData = JSON.parse(decodedText);
    } catch (e) {
      parsedData = { studentId: decodedText.trim() };
    }

    const searchId = (parsedData.studentId || decodedText).trim();
    const searchEmail = (parsedData.email || '').trim();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentId: searchId,
          email: searchEmail
        })
      });

      const data = await response.json();

      if (!response.ok || data.alreadyMarked) {
        const studentName = data.student ? data.student.name : (parsedData.name || searchId);
        const studentId = data.student ? data.student.studentId : searchId;
        const timeStr = data.data?.timeArrived || 'earlier today';
        const errorText = data.alreadyMarked
          ? `Attendance for ${studentName} (${studentId}) is ALREADY MARKED for today at ${timeStr}. Duplicate check-ins are not allowed.`
          : (data.message || 'Failed to mark attendance for scanned QR code.');

        setScanResult(null);
        setScanError(errorText);
        setNotificationModal({
          type: 'warning',
          title: 'Duplicate Check-in Blocked',
          message: errorText,
          buttonText: 'OK'
        });
        return;
      }

      // Re-fetch attendance logs from backend DB to update live table & counters
      if (selectedDate !== todayStr) {
        setSelectedDate(todayStr);
      } else {
        await fetchAttendanceByDate(todayStr);
      }

      const studentName = data.student ? data.student.name : (parsedData.name || searchId);
      const studentId = data.student ? data.student.studentId : searchId;
      const timeStr = data.data?.timeArrived || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setScanResult({
        success: true,
        message: `Attendance marked successfully for ${studentName} (${studentId})! ${data.whatsappSent ? 'Parent notified on WhatsApp.' : (data.parentMobile !== 'Not Provided' ? 'Parent notification queued.' : 'No parent mobile registered.')}`,
        record: {
          name: studentName,
          studentId: studentId,
          time: timeStr
        }
      });
    } catch (err) {
      console.error('Error marking attendance via QR code:', err);
      setScanError('Server error while saving attendance. Please check network connection.');
      setNotificationModal({
        type: 'error',
        title: 'Server Error',
        message: 'Server error while saving attendance. Please check network connection.',
        buttonText: 'OK'
      });
    }
  };



  // Retry notifying parent via WhatsApp
  const handleNotifyParent = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentDbId: item.studentDbId || item.id,
          studentId: item.studentId,
          forceSend: true
        })
      });

      const data = await res.json();
      if (res.ok && data.whatsappSent) {
        setNotificationModal({
          type: 'success',
          title: 'WhatsApp Notification Sent',
          message: `Parent notification sent successfully for ${item.name}!`,
          buttonText: 'OK'
        });
      } else {
        setNotificationModal({
          type: 'warning',
          title: 'Notification Alert',
          message: data.message || `Could not send WhatsApp notification to parent.`,
          buttonText: 'OK'
        });
      }
      await fetchAttendanceByDate(selectedDate);
    } catch (err) {
      console.error('Error notifying parent:', err);
      setNotificationModal({
        type: 'error',
        title: 'Notification Error',
        message: 'Failed to send parent notification.',
        buttonText: 'OK'
      });
    }
  };

  const presentCount = attendanceData.length;
  const totalEnrolled = Math.max(students.length, presentCount);
  const percentagePresent = totalEnrolled > 0 ? Math.min(100, Math.round((presentCount / totalEnrolled) * 100)) : 0;

  const activeStudentObj = students.find(s => s._id === selectedStudentId || s.studentId === selectedStudentId);
  const activeStudentName = activeStudentObj ? activeStudentObj.name : (studentHistoryData[0]?.name || 'Selected Student');
  const activeStudentInitials = activeStudentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';

  const displayedAttendance = selectedStudentId !== 'ALL'
    ? studentHistoryData
    : attendanceData.filter(item =>
        studentSearchQuery === '' ||
        item.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        item.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase())
      );

  const filteredStudentsForDropdown = [...students]
    .sort((a, b) => {
      const idA = a.studentId || '';
      const idB = b.studentId || '';
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    })
    .filter(st => {
      if (!dropdownSearchText.trim()) return true;
      const q = dropdownSearchText.toLowerCase();
      return (
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.studentId && st.studentId.toLowerCase().includes(q)) ||
        (st.grade && st.grade.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">QR Attendance</h1>
          <p className="text-slate-500 text-base">
            Automatic daily student check-ins, date-wise logs & student-wise attendance records.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Date Selector Bar (Consistently available in both modes) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm gap-1">
            {selectedStudentId !== 'ALL' && (
              <button
                onClick={() => setStudentDateMode('ALL_DATES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  studentDateMode === 'ALL_DATES' ? 'bg-[#3b28cc] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All History
              </button>
            )}

            <button
              onClick={() => {
                setSelectedDate(todayStr);
                setStudentDateMode(todayStr);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                (selectedStudentId === 'ALL' ? isViewingToday : studentDateMode === todayStr) ? 'bg-[#3b28cc] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => {
                const yest = getYesterdayDateString();
                setSelectedDate(yest);
                setStudentDateMode(yest);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                (selectedStudentId === 'ALL' ? selectedDate === getYesterdayDateString() : studentDateMode === getYesterdayDateString()) ? 'bg-[#3b28cc] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Yesterday
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-1.5 px-2 py-1 text-slate-600 text-xs font-semibold">
              <FiCalendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="date"
                value={selectedStudentId === 'ALL' ? selectedDate : (studentDateMode === 'ALL_DATES' ? selectedDate : studentDateMode)}
                max={todayStr}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setStudentDateMode(e.target.value);
                }}
                className="bg-transparent border-none outline-none font-sans text-xs font-bold text-slate-800 cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Student Filter Dropdown (Aligned with Scan Student QR button) */}
          <div className="relative" ref={studentDropdownRef}>
            <button
              onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
              className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer hover:border-indigo-300"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${selectedStudentId === 'ALL' ? 'bg-indigo-50 text-[#3b28cc]' : `${activeStudentObj?.color || 'bg-indigo-600'} text-white`}`}>
                {selectedStudentId === 'ALL' ? <FiUsers className="w-3.5 h-3.5" /> : activeStudentInitials}
              </div>
              
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="truncate max-w-[130px] font-bold text-slate-800">
                  {selectedStudentId === 'ALL' ? 'All Students' : activeStudentName}
                </span>
                {selectedStudentId !== 'ALL' && activeStudentObj?.studentId && (
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                    {activeStudentObj.studentId}
                  </span>
                )}
              </div>

              <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isStudentDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </button>

            {/* Floating Dropdown Menu */}
            {isStudentDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Search Bar inside dropdown */}
                <div className="p-1 mb-1.5 relative">
                  <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student by name or ID..."
                    value={dropdownSearchText}
                    onChange={(e) => setDropdownSearchText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all font-sans"
                    autoFocus
                  />
                  {dropdownSearchText && (
                    <button
                      onClick={() => setDropdownSearchText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {/* All Students Option */}
                  <button
                    onClick={() => {
                      setSelectedStudentId('ALL');
                      setIsStudentDropdownOpen(false);
                      setDropdownSearchText('');
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      selectedStudentId === 'ALL'
                        ? 'bg-indigo-50/80 text-[#3b28cc] font-extrabold shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedStudentId === 'ALL' ? 'bg-[#3b28cc] text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                        <FiUsers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">All Students Overview</span>
                        <span className="text-[10px] text-slate-400 font-medium">Show date logs for all students</span>
                      </div>
                    </div>
                    {selectedStudentId === 'ALL' && <FiCheck className="w-4 h-4 text-[#3b28cc]" />}
                  </button>

                  <div className="h-px bg-slate-100 my-1"></div>

                  {/* Filtered Students List */}
                  {filteredStudentsForDropdown.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      No matching students found
                    </div>
                  ) : (
                    filteredStudentsForDropdown.map((st) => {
                      const isSelected = selectedStudentId === st._id || selectedStudentId === st.studentId;
                      const initials = st.name ? st.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST';

                      return (
                        <button
                          key={st._id}
                          onClick={() => {
                            setSelectedStudentId(st._id);
                            setIsStudentDropdownOpen(false);
                            setDropdownSearchText('');
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 text-[#3b28cc] font-extrabold shadow-xs'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-full ${st.color || 'bg-indigo-600'} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}>
                              {initials}
                            </div>
                            <div className="truncate min-w-0">
                              <span className="text-xs font-bold block truncate text-slate-800">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-medium block">{st.studentId || 'ID N/A'} • {st.grade || 'Grade 10'}</span>
                            </div>
                          </div>
                          {isSelected && <FiCheck className="w-4 h-4 text-[#3b28cc] shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Aligned Action Buttons */}
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={() => {
                setScanResult(null);
                setScanError('');
                setIsScannerOpen(true);
              }}
              className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <TbQrcode className="w-5 h-5" />
              Scan Student QR
            </button>

            <button
              onClick={() => {
                if (selectedStudentId !== 'ALL') {
                  fetchStudentHistory(selectedStudentId);
                } else {
                  fetchAttendanceByDate(selectedDate);
                }
              }}
              title="Refresh Attendance Data"
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student-Wise Observation Hero Card */}
      {selectedStudentId !== 'ALL' && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in duration-200 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${activeStudentObj?.color || 'bg-indigo-600'} text-white font-extrabold text-lg flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0`}>
              {activeStudentInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold">{activeStudentName}</h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {activeStudentObj?.studentId || 'ID N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                <span>Class / Grade: <strong className="text-white">{activeStudentObj?.grade || '10-A'}</strong></span>
                <span>•</span>
                <span>Parent Mobile: <strong className="text-white">{activeStudentObj?.parentMobile || 'Not Provided'}</strong></span>
                {activeStudentObj?.email && (
                  <>
                    <span>•</span>
                    <span>Email: <strong className="text-white">{activeStudentObj.email}</strong></span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Days Present</span>
              <span className="text-2xl font-extrabold text-emerald-400">{studentHistoryData.length} Check-ins</span>
            </div>
            
            <button
              onClick={() => setSelectedStudentId('ALL')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Show All Students
            </button>
          </div>
        </div>
      )}

      {/* Historical Date Notice Banner (Visible in Date mode) */}
      {selectedStudentId === 'ALL' && !isViewingToday && (
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-indigo-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <FiCalendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Viewing Historical Attendance Records for <span className="underline decoration-indigo-400 font-extrabold">{formatDateLabel(selectedDate)}</span> ({selectedDate})
              </p>
              <p className="text-[11px] text-indigo-600/80 mt-0.5">
                Past attendance records loaded from database. Click any student row to view student-wise attendance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            Back to Today
          </button>
        </div>
      )}

      {/* Attendance Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {selectedStudentId !== 'ALL'
                ? `Student Attendance History (${activeStudentName})`
                : (isViewingToday ? 'Recent Check-ins' : `Attendance Logs for ${formatDateLabel(selectedDate)}`)}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {selectedStudentId !== 'ALL'
                ? `Complete check-in records for ${activeStudentName} across all dates`
                : (isViewingToday ? 'Real-time attendance logs for today. Click a student to view history.' : `Archived database records for ${selectedDate}`)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedStudentId === 'ALL' && (
              <div className="relative">
                <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-indigo-300 transition-all w-48"
                />
              </div>
            )}

            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 shrink-0">
              {displayedAttendance.length} Recorded
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Student ID</th>
                <th className="p-4">{selectedStudentId !== 'ALL' ? 'Date' : 'Check-in Time'}</th>
                {selectedStudentId !== 'ALL' && <th className="p-4">Time</th>}
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Parent Notified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 text-sm">
                    {selectedStudentId !== 'ALL' ? (
                      <>No attendance records found in database for <span className="font-semibold text-slate-700">{activeStudentName}</span>.</>
                    ) : (
                      isViewingToday ? (
                        <>No attendance records marked yet for today. Click <span className="font-semibold text-indigo-600">"Scan Student QR"</span> to scan a student's QR code!</>
                      ) : (
                        <>No attendance records found for <span className="font-semibold text-slate-700">{formatDateLabel(selectedDate)} ({selectedDate})</span>.</>
                      )
                    )}
                  </td>
                </tr>
              ) : (
                displayedAttendance.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => {
                      if (selectedStudentId === 'ALL') {
                        setSelectedStudentId(item.studentDbId || item.studentId);
                      }
                    }}
                    className={`transition-colors ${selectedStudentId === 'ALL' ? 'hover:bg-indigo-50/40 cursor-pointer' : 'hover:bg-slate-50/30'}`}
                    title={selectedStudentId === 'ALL' ? `Click to view student-wise attendance for ${item.name}` : ''}
                  >
                    {/* Student Name */}
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${item.bgClass} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                        {item.initials}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{item.name}</span>
                        {selectedStudentId === 'ALL' && (
                          <span className="text-[10px] text-indigo-600 font-semibold opacity-0 hover:opacity-100 transition-opacity">Click to view student history</span>
                        )}
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="p-4 text-slate-600 font-mono text-xs font-bold">
                      {item.studentId || 'N/A'}
                    </td>

                    {/* Date / Check-in Time */}
                    {selectedStudentId !== 'ALL' ? (
                      <>
                        <td className="p-4 text-slate-700 font-bold text-xs">
                          {item.dateFormatted}
                        </td>
                        <td className="p-4 text-slate-500 font-semibold text-sm">
                          {item.time}
                        </td>
                      </>
                    ) : (
                      <td className="p-4 text-slate-500 font-semibold text-sm">
                        {item.time}
                      </td>
                    )}

                    {/* Status */}
                    <td className="p-4">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Parent Notified Status */}
                    <td className="p-4 pr-6">
                      {item.notified ? (
                        <div className="text-teal-600 flex items-center gap-1.5 text-xs font-semibold">
                          <FiCheckCircle className="w-5 h-5 shrink-0" />
                          <span>Sent</span>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotifyParent(item);
                          }}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1.5 cursor-pointer transition-colors p-1 text-xs font-semibold"
                          title="Click to notify parent via WhatsApp"
                        >
                          <FiAlertCircle className="w-5 h-5 shrink-0" />
                          <span>Retry WhatsApp</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Present Today / Selected Date / Student widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">
              {selectedStudentId !== 'ALL'
                ? `Student Attendance Rate (${activeStudentName})`
                : `Present ${isViewingToday ? 'Today' : `on ${formatDateLabel(selectedDate)}`}`}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-indigo-600">
                {selectedStudentId !== 'ALL' ? studentHistoryData.length : presentCount}
              </span>
              <span className="text-slate-400 font-semibold text-sm">
                / {totalEnrolled} Students
              </span>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#3b28cc] h-full rounded-full transition-all duration-500" 
                style={{ width: `${selectedStudentId !== 'ALL' ? (studentHistoryData.length > 0 ? 100 : 0) : percentagePresent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Parent Notifications widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">
            Parent Notifications ({selectedStudentId !== 'ALL' ? activeStudentName : (isViewingToday ? 'Today' : formatDateLabel(selectedDate))})
          </span>
          
          <div className="space-y-4">
            {/* Sent Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Sent</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated WhatsApp</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-teal-600">
                {displayedAttendance.filter(a => a.notified).length}
              </span>
            </div>

            {/* Pending / Failed Row */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Pending / Failed</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Requires action</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-red-500">
                {displayedAttendance.filter(a => !a.notified).length}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden container for temp file scanning */}
      <div id="file-qr-temp" className="hidden"></div>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            stopCamera();
            setIsScannerOpen(false);
            setScanResult(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  scanResult ? (scanResult.isDuplicate ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600') : 'bg-indigo-50 text-[#3b28cc]'
                }`}>
                  {scanResult ? <FiCheckCircle className="w-5 h-5" /> : <TbQrcode className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {scanResult ? (scanResult.isDuplicate ? 'Attendance Already Marked' : 'Attendance Marked Successfully') : 'Scan Student QR Code'}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    {scanResult ? 'Student check-in result details' : 'Scan QR code to mark attendance automatically'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopCamera();
                  setIsScannerOpen(false);
                  setScanResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Success Pop-up View after successful scan */}
              {scanResult ? (
                <div className="flex flex-col items-center justify-center py-4 px-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border-4 border-emerald-50">
                    <FiCheckCircle className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-emerald-100 text-emerald-800">
                      Successful Scan
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-900">
                      {scanResult.record.name}
                    </h4>
                  </div>

                  {/* Details Card */}
                  <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
                      <span className="text-slate-400 font-semibold uppercase">Student ID</span>
                      <span className="font-mono font-bold text-slate-800">{scanResult.record.studentId}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
                      <span className="text-slate-400 font-semibold uppercase">Arrival Time</span>
                      <span className="font-bold text-[#3b28cc]">{scanResult.record.time}</span>
                    </div>

                    <div className="text-xs text-slate-600 pt-1 font-medium leading-relaxed">
                      {scanResult.message}
                    </div>
                  </div>

                  {/* Action Buttons: Back to Previous Interface & Scan Next */}
                  <div className="w-full space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setIsScannerOpen(false);
                        setScanResult(null);
                        setScanError('');
                      }}
                      className="w-full bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Back to Attendance Monitor
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScanResult(null);
                        setScanError('');
                        startCamera();
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      Scan Next Student
                    </button>
                  </div>
                </div>
              ) : scanError ? (
                /* Error Pop-up View for Duplicate or Failed Scan */
                <div className="flex flex-col items-center justify-center py-4 px-2 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-lg border-4 border-red-50">
                    <FiAlertCircle className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-red-100 text-red-800">
                      Duplicate Scan Blocked
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900">
                      Cannot Scan Student ID Twice
                    </h4>
                  </div>

                  <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-2 text-red-800 shadow-xs">
                    <p className="text-xs font-semibold leading-relaxed">
                      {scanError}
                    </p>
                  </div>

                  {/* Error Action Buttons */}
                  <div className="w-full space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScanError('');
                        setScanResult(null);
                        startCamera();
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Try Again / Scan Next Student
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setIsScannerOpen(false);
                        setScanError('');
                        setScanResult(null);
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Back to Attendance Monitor
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Camera Scanner View */
                <>
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center shadow-inner">
                      <div id="qr-reader" className="w-full h-full"></div>
                      {!isScanning && !scanError && (
                        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center text-white">
                          <FiRefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                          <span className="text-xs font-semibold">Initializing camera...</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 text-center mt-3">
                      Point camera at the student's Attendance QR Code
                    </p>
                  </div>
                </>
              )}

            </div>

            {/* Footer for camera mode */}
            {!scanResult && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs font-semibold text-[#3b28cc] hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  Restart Camera
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsScannerOpen(false);
                    setScanResult(null);
                  }}
                  className="ml-auto px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* System Custom Notification Pop-up Modal */}
      {notificationModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setNotificationModal(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-md border-4 ${
              notificationModal.type === 'error'
                ? 'bg-red-100 text-red-600 border-red-50'
                : notificationModal.type === 'warning'
                ? 'bg-amber-100 text-amber-600 border-amber-50'
                : 'bg-emerald-100 text-emerald-600 border-emerald-50'
            }`}>
              {notificationModal.type === 'error' && <FiAlertCircle className="w-7 h-7" />}
              {notificationModal.type === 'warning' && <FiAlertCircle className="w-7 h-7" />}
              {notificationModal.type === 'success' && <FiCheckCircle className="w-7 h-7" />}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                {notificationModal.title || 'Notification'}
              </h3>
              <p className="text-slate-600 text-xs font-medium leading-relaxed">
                {notificationModal.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setNotificationModal(null)}
                className="w-full bg-[#3b28cc] hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-[0.99]"
              >
                {notificationModal.buttonText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
