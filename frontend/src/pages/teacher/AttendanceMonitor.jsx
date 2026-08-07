import { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiAlertCircle, FiShare2, FiMail, FiX, FiCamera, FiUpload, FiSearch, FiUserCheck, FiRefreshCw } from 'react-icons/fi';
import { TbQrcode, TbMailCheck, TbMailDown } from 'react-icons/tb';
import { Html5Qrcode } from 'html5-qrcode';

export default function AttendanceMonitor() {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scanner modal & camera states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [manualIdInput, setManualIdInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef(null);

  // Load students list
  const loadStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students for attendance:', err);
    }
  };

  // Load today's attendance logs from database
  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/today', {
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
        }
      }
    } catch (err) {
      console.error('Error fetching today attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    fetchTodayAttendance();
  }, []);

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
        setScanError('Unable to access camera. Please check browser permissions or try uploading a QR image.');
        setIsScanning(false);
      }
    }, 100);
  };

  useEffect(() => {
    if (isScannerOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen, activeTab]);

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

      if (!response.ok) {
        setScanError(data.message || 'Failed to mark attendance for scanned QR code.');
        return;
      }

      // Re-fetch today's attendance logs from backend DB to update live table & counters
      await fetchTodayAttendance();

      const studentName = data.student ? data.student.name : (parsedData.name || searchId);
      const studentId = data.student ? data.student.studentId : searchId;
      const timeStr = data.data?.timeArrived || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setScanResult({
        success: true,
        isDuplicate: data.alreadyMarked,
        message: data.alreadyMarked
          ? `Attendance for ${studentName} (${studentId}) is already marked for today at ${timeStr}.`
          : `Attendance marked successfully for ${studentName} (${studentId})! ${data.whatsappSent ? 'Parent notified on WhatsApp.' : (data.parentMobile !== 'Not Provided' ? 'Parent notification queued.' : 'No parent mobile registered.')}`,
        record: {
          name: studentName,
          studentId: studentId,
          time: timeStr
        }
      });
    } catch (err) {
      console.error('Error marking attendance via QR code:', err);
      setScanError('Server error while saving attendance. Please check network connection.');
    }
  };

  // Handle QR Image File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanError('');
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode('file-qr-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleDecodedQR(decodedText);
    } catch (err) {
      console.error('Error scanning QR image file:', err);
      setScanError('Failed to read QR code from image. Please ensure the QR code is clearly visible.');
    }
  };

  // Handle Manual Student ID Submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;
    handleDecodedQR(manualIdInput.trim());
    setManualIdInput('');
  };

  // Export logs to CSV file
  const handleExport = () => {
    if (attendanceData.length === 0) {
      alert('No attendance records available for today to export.');
      return;
    }

    const headers = ['Student Name', 'Student ID', 'Check-in Time', 'Status', 'Parent Notified'];
    const rows = attendanceData.map(a => [
      `"${a.name}"`,
      `"${a.studentId}"`,
      `"${a.time}"`,
      `"${a.status}"`,
      `"${a.notified ? 'Yes' : 'No'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        alert(`Parent notification sent successfully for ${item.name}!`);
      } else {
        alert(data.message || `Could not send WhatsApp notification to parent.`);
      }
      await fetchTodayAttendance();
    } catch (err) {
      console.error('Error notifying parent:', err);
      alert('Failed to send parent notification.');
    }
  };

  const totalEnrolled = Math.max(30, students.length);
  const presentCount = attendanceData.length;
  const percentagePresent = Math.round((presentCount / totalEnrolled) * 100);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">QR Attendance</h1>
          <p className="text-slate-500 text-base">
            Automatic daily student check-ins via QR code scanner.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setActiveTab('camera');
            }}
            className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <TbQrcode className="w-5 h-5" />
            Scan Student QR
          </button>

          <button
            onClick={fetchTodayAttendance}
            title="Refresh Attendance Data"
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={handleExport}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer shrink-0"
          >
            Export Logs
          </button>
        </div>
      </div>

      {/* Recent Check-ins Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Check-ins</h3>
            <p className="text-slate-400 text-xs mt-0.5">Real-time attendance logs for today</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            {attendanceData.length} Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Student ID</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Parent Notified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                    No attendance records marked yet for today. Click <span className="font-semibold text-indigo-600">"Scan Student QR"</span> to scan a student's QR code!
                  </td>
                </tr>
              ) : (
                attendanceData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Student Name */}
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${item.bgClass} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                        {item.initials}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    </td>

                    {/* Student ID */}
                    <td className="p-4 text-slate-600 font-mono text-xs font-bold">
                      {item.studentId || 'N/A'}
                    </td>

                    {/* Check-in Time */}
                    <td className="p-4 text-slate-500 font-semibold text-sm">
                      {item.time}
                    </td>

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
                          onClick={() => handleNotifyParent(item)}
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
        
        {/* Present Today widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">Present Today</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-indigo-600">{presentCount}</span>
              <span className="text-slate-400 font-semibold text-sm">/ {totalEnrolled} Students</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#3b28cc] h-full rounded-full transition-all duration-500" 
                style={{ width: `${percentagePresent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Parent Notifications widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4">Parent Notifications</span>
          
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
              <span className="text-2xl font-extrabold text-teal-600">{attendanceData.filter(a => a.notified).length}</span>
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
              <span className="text-2xl font-extrabold text-red-500">{attendanceData.filter(a => !a.notified).length}</span>
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
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3b28cc] flex items-center justify-center font-bold">
                  <TbQrcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Scan Student QR Code</h3>
                  <p className="text-slate-400 text-xs">Scan QR code to mark attendance automatically</p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopCamera();
                  setIsScannerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/30 p-1.5 gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'camera' ? 'bg-white text-[#3b28cc] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FiCamera className="w-4 h-4" />
                Live Camera Scanner
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'upload' ? 'bg-white text-[#3b28cc] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FiUpload className="w-4 h-4" />
                Upload QR Image
              </button>

              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'manual' ? 'bg-white text-[#3b28cc] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FiSearch className="w-4 h-4" />
                Enter Student ID
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Tab 1: Live Camera Scanner */}
              {activeTab === 'camera' && (
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
              )}

              {/* Tab 2: Upload QR Image */}
              {activeTab === 'upload' && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#3b28cc] flex items-center justify-center mb-3">
                    <FiUpload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Select QR Code Image</h4>
                  <p className="text-xs text-slate-400 text-center mb-4 max-w-xs">
                    Upload a saved QR code image or screenshot from student device.
                  </p>

                  <label className="bg-[#3b28cc] hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer shadow-sm">
                    Browse Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Tab 3: Manual Student ID Input */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <label className="block text-slate-400 text-xs font-semibold uppercase">Student ID / QR Payload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. STU-1001"
                      value={manualIdInput}
                      onChange={(e) => setManualIdInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 font-sans"
                    />
                    <button
                      type="submit"
                      className="bg-[#3b28cc] hover:bg-indigo-700 text-white font-semibold px-5 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Check In
                    </button>
                  </div>
                </form>
              )}

              {/* Error Alert */}
              {scanError && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Scan Success Banner */}
              {scanResult && (
                <div className={`p-4 rounded-2xl border text-sm flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200 ${
                  scanResult.isDuplicate ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
                      scanResult.isDuplicate ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      <FiUserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm">{scanResult.record.name}</h4>
                      <p className="text-xs opacity-80 font-mono">ID: {scanResult.record.studentId} • Checked in at {scanResult.record.time}</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium border-t border-black/5 pt-2">
                    {scanResult.message}
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {activeTab === 'camera' && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs font-semibold text-[#3b28cc] hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  Restart Camera
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsScannerOpen(false);
                }}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
