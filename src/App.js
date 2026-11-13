import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings2,
  ShieldAlert,
  BookOpen,
  ChevronDown,
  ChevronRight,
  HardHat,
  BarChart2,
  ListTodo,
  CalendarDays,
  Shield,
  CheckSquare,
  Square,
  FileCheck,
  Activity,
  AlertOctagon,
  Printer,
  Download,
  Search,
  CloudSun,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [weatherCondition, setWeatherCondition] = useState("แจ่มใส (ปกติ)");
  const [workerCount, setWorkerCount] = useState(0);
  const [dailyNote, setDailyNote] = useState("");
  const [dailyLogs, setDailyLogs] = useState([]);

  // ข้อมูลแผนงานก่อสร้างศูนย์เยาวชน
  const [tasks, setTasks] = useState([
    { id: 1, category: "1. เตรียมการ", name: "สำรวจพื้นที่และเคลียร์พื้นที่ก่อสร้าง", duration: 5, status: "ยังไม่เริ่ม", weight: 5 },
    { id: 2, category: "1. เตรียมการ", name: "ติดตั้งป้ายโครงการและสิ่งอำนวยความสะดวก", duration: 3, status: "ยังไม่เริ่ม", weight: 3 },
    { id: 3, category: "2. งานโครงสร้าง", name: "ขุดดินและเตรียมฐานรากอาคาร", duration: 10, status: "ยังไม่เริ่ม", weight: 10 },
    { id: 4, category: "2. งานโครงสร้าง", name: "เทคอนกรีตฐานรากและคานคอดิน", duration: 12, status: "ยังไม่เริ่ม", weight: 12 },
    { id: 5, category: "2. งานโครงสร้าง", name: "ติดตั้งเสาและโครงสร้างเหล็กชั้น 1", duration: 15, status: "ยังไม่เริ่ม", weight: 15 },
    { id: 6, category: "3. งานสถาปัตยกรรม", name: "ก่อผนังและฉาบปูน", duration: 15, status: "ยังไม่เริ่ม", weight: 15 },
    { id: 7, category: "3. งานสถาปัตยกรรม", name: "ติดตั้งระบบไฟฟ้าและประปาภายใน", duration: 12, status: "ยังไม่เริ่ม", weight: 12 },
    { id: 8, category: "3. งานสถาปัตยกรรม", name: "ปูกระเบื้องและงานสี", duration: 10, status: "ยังไม่เริ่ม", weight: 10 },
    { id: 9, category: "4. งานภายนอกและส่งมอบ", name: "ปรับภูมิทัศน์และทำความสะอาดรอบอาคาร", duration: 8, status: "ยังไม่เริ่ม", weight: 8 },
    { id: 10, category: "4. งานภายนอกและส่งมอบ", name: "ตรวจสอบระบบและส่งมอบงาน", duration: 5, status: "ยังไม่เริ่ม", weight: 10 },
  ]);

  // ฟังก์ชันอัปเดตสถานะงาน
  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  // ฟังก์ชันแก้ไขจำนวนวันใน Gantt
  const handleDurationChange = (id, newDuration) => {
    const val = parseInt(newDuration) || 0;
    setTasks(tasks.map(t => t.id === id ? { ...t, duration: val } : t));
  };

  // คำนวณภาพรวมสถานะงาน
  const taskSummary = useMemo(() => {
    const counts = { "ยังไม่เริ่ม": 0, "กำลังดำเนินการ": 0, "ล่าช้า": 0, "แล้วเสร็จ": 0 };
    tasks.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return counts;
  }, [tasks]);

  // คำนวณความคืบหน้ารวม
  const totalProgress = useMemo(() => {
    let completedWeight = 0;
    let totalWeight = 0;
    tasks.forEach(t => {
      totalWeight += t.weight;
      if (t.status === "แล้วเสร็จ") {
        completedWeight += t.weight;
      } else if (t.status === "กำลังดำเนินการ") {
        completedWeight += t.weight * 0.5; // คิดให้ครึ่งหนึ่งเมื่อกำลังทำ
      }
    });
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  }, [tasks]);

  // ฟังก์ชันบันทึกสภาวะหน้างานและส่งข้อมูลเข้า Google Sheets
  const handleSaveDailyLog = async () => {
    const newLog = {
      timestamp: new Date().toLocaleString("th-TH"),
      weather: weatherCondition,
      workers: workerCount,
      note: dailyNote || "ไม่มีบันทึกเพิ่มเติม",
    };

    try {
      await fetch("https://script.google.com/macros/s/AKfycbyO1FPKdnK5qV8xXlssNmJLtVYVkcdxNU2ckuE_ORVn1cfP2tHJNMI4WgDjoZw3aKI/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLog),
      });

      setDailyLogs([newLog, ...dailyLogs]);
      setDailyNote("");
      alert("บันทึกสภาวะหน้างานลง Google Drive สำเร็จเรียบร้อยครับ!");
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <HardHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">โครงการปรับปรุงศูนย์เยาวชน</h1>
            <p className="text-xs text-slate-400">เทศบาลนครสุราษฎร์ธานี • เชื่อมต่อ Google Sheets (Cloud)</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm transition"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900/50 border-b border-slate-800 px-6 flex space-x-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 font-medium text-sm transition ${
            activeTab === "dashboard"
              ? "border-blue-500 text-blue-400 bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart2 size={18} />
          <span>ภาพรวม (Dashboard)</span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 font-medium text-sm transition ${
            activeTab === "tasks"
              ? "border-blue-500 text-blue-400 bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ListTodo size={18} />
          <span>แผนงาน / อัปเดตสถานะ</span>
        </button>
        <button
          onClick={() => setActiveTab("gantt")}
          className={`py-3 px-4 flex items-center space-x-2 border-b-2 font-medium text-sm transition ${
            activeTab === "gantt"
              ? "border-blue-500 text-blue-400 bg-blue-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CalendarDays size={18} />
          <span>แผนภูมิเวลา (Gantt)</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {activeTab === "dashboard" && (
          <>
            {/* สภาวะหน้างานวันนี้ */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center space-x-2 mb-4 text-blue-400 font-semibold text-lg">
                <CloudSun size={22} />
                <span>สภาวะหน้างานวันนี้</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">สภาพอากาศ</label>
                  <select
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="แจ่มใส (ปกติ)">แจ่มใส (ปกติ)</option>
                    <option value="มีฝนตก (หยุดงานบางส่วน)">มีฝนตก (หยุดงานบางส่วน)</option>
                    <option value="ฝนตกหนัก (หยุดงาน)">ฝนตกหนัก (หยุดงาน)</option>
                    <option value="ครึ้มฟ้าครึ้มฝน">ครึ้มฟ้าครึ้มฝน</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">กำลังคน (คน)</label>
                  <div className="flex items-center space-x-2">
                    <Users size={18} className="text-slate-400" />
                    <input
                      type="number"
                      value={workerCount}
                      onChange={(e) => setWorkerCount(e.target.value)}
                      placeholder="จำนวนคน"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-slate-400 block mb-1">บันทึกเหตุการณ์หน้างาน</label>
                  <input
                    type="text"
                    value={dailyNote}
                    onChange={(e) => setDailyNote(e.target.value)}
                    placeholder="เช่น วัสดุเข้าหน้างาน, ปัญหาที่พบ..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSaveDailyLog}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2 shadow-md"
                  >
                    <CheckCircle2 size={18} />
                    <span>บันทึก</span>
                  </button>
                </div>
              </div>

              {/* ตารางประวัติสภาวะหน้างานย้อนหลัง */}
              {dailyLogs.length > 0 && (
                <div className="mt-6 border-t border-slate-800 pt-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">ประวัติการบันทึกสภาวะหน้างาน</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-800/60 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="p-2 rounded-l-lg">วันที่และเวลา</th>
                          <th className="p-2">สภาพอากาศ</th>
                          <th className="p-2">กำลังคน</th>
                          <th className="p-2 rounded-r-lg">บันทึกเหตุการณ์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {dailyLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-slate-800/40">
                            <td className="p-2 font-mono text-xs text-slate-400">{log.timestamp}</td>
                            <td className="p-2">{log.weather}</td>
                            <td className="p-2">{log.workers} คน</td>
                            <td className="p-2">{log.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ภาพรวมโครงการ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">ความคืบหน้าโครงการรวม</h3>
                  <div className="text-4xl font-bold text-blue-400 mb-2">{totalProgress}%</div>
                  <p className="text-xs text-slate-500">อัปเดตความคืบหน้าจากสัดส่วนน้ำหนักงานทั้งหมด</p>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${totalProgress}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-medium text-slate-400 mb-3">สถานะงาน (Tasks)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-300">• ยังไม่เริ่ม</span><span className="font-bold">{taskSummary["ยังไม่เริ่ม"]}</span></div>
                  <div className="flex justify-between items-center"><span className="text-blue-400">• กำลังดำเนินการ</span><span className="font-bold">{taskSummary["กำลังดำเนินการ"]}</span></div>
                  <div className="flex justify-between items-center"><span className="text-amber-400">• ล่าช้า</span><span className="font-bold">{taskSummary["ล่าช้า"]}</span></div>
                  <div className="flex justify-between items-center"><span className="text-emerald-400">• แล้วเสร็จ</span><span className="font-bold">{taskSummary["แล้วเสร็จ"]}</span></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-around">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 flex items-center space-x-2"><AlertOctagon size={16} className="text-amber-500" /><span>วิกฤต (Hold Point)</span></span>
                  <span className="text-xl font-bold text-amber-500">11 / 11</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-sm text-slate-400 flex items-center space-x-2"><Clock size={16} className="text-blue-400" /><span>เวลาประเมินรวม</span></span>
                  <span className="text-xl font-bold text-blue-400">{tasks.reduce((sum, t) => sum + t.duration, 0)} วัน</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "tasks" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-slate-200">แผนงานและอัปเดตสถานะโครงการ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">ชื่องาน</th>
                    <th className="p-3">ระยะเวลา (วัน)</th>
                    <th className="p-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-xs text-slate-400">{task.category}</td>
                      <td className="p-3 font-medium text-slate-200">{task.name}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={task.duration}
                          onChange={(e) => handleDurationChange(task.id, e.target.value)}
                          className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-center"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none"
                        >
                          <option value="ยังไม่เริ่ม">ยังไม่เริ่ม</option>
                          <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                          <option value="ล่าช้า">ล่าช้า</option>
                          <option value="แล้วเสร็จ">แล้วเสร็จ</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "gantt" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-slate-200">แผนภูมิเวลา (Gantt Chart)</h2>
            <p className="text-xs text-slate-400">แสดงภาพรวมกรอบเวลางานแต่ละหมวดหมู่ สามารถปรับแก้จำนวนวันในหน้าแผนงานได้ทันที</p>
            <div className="space-y-3 pt-4">
              {tasks.map((task) => (
                <div key={task.id} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{task.name}</span>
                    <span className="font-mono text-blue-400">{task.duration} วัน ({task.status})</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        task.status === "แล้วเสร็จ" ? "bg-emerald-500" :
                        task.status === "กำลังดำเนินการ" ? "bg-blue-500" :
                        task.status === "ล่าช้า" ? "bg-amber-500" : "bg-slate-600"
                      }`}
                      style={{ width: `${Math.min(task.duration * 6, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
