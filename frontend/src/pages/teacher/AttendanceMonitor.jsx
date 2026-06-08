import { useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiShare2, FiMail } from 'react-icons/fi';
import { TbQrcode, TbMailCheck, TbMailDown } from 'react-icons/tb';

export default function AttendanceMonitor() {
  const [attendanceData, setAttendanceData] = useState([
    {
      id: 1,
      name: 'John Smith',
      initials: 'JS',
      bgClass: 'bg-indigo-600',
      time: '09:02 AM',
      status: 'On Time',
      statusClass: 'bg-emerald-50 text-emerald-600',
      notified: true
    },
    {
      id: 2,
      name: 'Emma Davis',
      initials: 'ED',
      bgClass: 'bg-[#b388ff]',
      time: '09:05 AM',
      status: 'On Time',
      statusClass: 'bg-emerald-50 text-emerald-600',
      notified: true
    },
    {
      id: 3,
      name: 'Michael Johnson',
      initials: 'MJ',
      bgClass: 'bg-slate-400',
      time: '09:15 AM',
      status: 'Late',
      statusClass: 'bg-red-50 text-red-600',
      notified: false
    }
  ]);

  const handleExport = () => {
    alert('Exporting attendance logs to CSV...');
  };

  const handleNotifyParent = (id) => {
    setAttendanceData(attendanceData.map(item => {
      if (item.id === id) {
        alert(`Parent notification sent for ${item.name}`);
        return { ...item, notified: true };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">QR Attendance</h1>
          <p className="text-slate-500 text-base">
            Manage daily check-ins for Math 101 - Fall Semester
          </p>
        </div>
        
        <button 
          onClick={handleExport}
          className="bg-white hover:bg-slate-50 border border-[#3b28cc]/20 hover:border-[#3b28cc]/40 text-[#3b28cc] font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer shrink-0"
        >
          Export Logs
        </button>
      </div>

      {/* Recent Check-ins Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Check-ins</h3>
          <button 
            onClick={() => alert('Viewing all check-ins...')}
            className="text-[#3b28cc] hover:text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Parent Notified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Student Name */}
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${item.bgClass} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                      {item.initials}
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
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
                      <div className="text-teal-600 flex items-center justify-start">
                        <FiCheckCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleNotifyParent(item.id)}
                        className="text-red-500 hover:text-red-700 flex items-center justify-start cursor-pointer transition-colors p-1"
                        title="Click to notify parent"
                      >
                        <FiAlertCircle className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
              <span className="text-3xl font-extrabold text-indigo-600">24</span>
              <span className="text-slate-400 font-semibold text-sm">/ 30 Students</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#3b28cc] h-full rounded-full transition-all duration-550" 
                style={{ width: `${(24/30) * 100}%` }}
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-teal-600">24</span>
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
              <span className="text-2xl font-extrabold text-red-500">1</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
