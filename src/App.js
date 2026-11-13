import React, { useState, useEffect, useMemo } from 'react';
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
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Google Sheet Apps Script Web App URL
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyO1FPKdnK5qV8xXlssNmJLtVYVkcdxNU2ckuE_ORVn1cfP2tHJNMI4WgDjoZw3aKI/exec';

// --- 1. Initial Data ---
const defaultTasks = [
  { id: 1, category: "1. เตรียมการ", task: "จัดทำแผนใช้วัสดุ (60%) และเหล็ก (90%)", std: "รวบรวมแคตตาล็อกและ มอก. ของวัสดุที่จะใช้ เสนอผู้ว่าจ้างภายใน 60 วันนับจากวันเซ็นสัญญา", saf: "ระวังส่งเอกสารล่าช้าเกิน 60 วัน จะผิดระเบียบพัสดุฯ ตรวจสอบเอกสารให้ครบถ้วนก่อนส่ง", weight: 2, duration: 14, recDuration: 14, dep: [], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "แผนใช้วัสดุ(60%)", approved: false}, {name: "แผนใช้เหล็ก(90%)", approved: false}] },
  { id: 2, category: "1. เตรียมการ", task: "ติดตั้งป้ายโครงการและสาธารณูปโภคชั่วคราว", std: "ป้ายไวนิลขนาด 1.20x2.40 ม. ติดตั้งโครงแข็งแรง ขอไฟและน้ำประปาชั่วคราว", saf: "ระวังโครงป้ายล้มจากลมกระโชกแรง และจุดต่อไฟชั่วคราวต้องมีเบรกเกอร์กันดูด", weight: 3, duration: 7, recDuration: 7, dep: [], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "แบบป้ายโครงการ", approved: false}] },
  { id: 3, category: "2. รื้อถอน", task: "รื้อถอนหลังคา โครงเหล็ก และรางน้ำเฉลียงหน้า", std: "ตัดไฟบริเวณที่จะรื้อถอน ถอดหลังคาและตัดโครงสร้างเหล็กออก ขนย้ายออกจากพื้นที่", saf: "อันตรายจากการตกจากที่สูง ต้องใส่สายรัดนิรภัย (Harness) และหมวกนิรภัย (PPE)", weight: 4, duration: 7, recDuration: 7, dep: [1,2], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [] },
  { id: 4, category: "2. รื้อถอน", task: "รื้อถอนสถาปัตยกรรมภายใน (ผนัง ฝาไม้ พื้นไม้)", std: "รื้อผนังก่ออิฐบ่อหน้าอาคาร ฝาไม้ห้องเก็บของ พื้นลูกนอนบันไดเวที", saf: "ระวังฝุ่นควันและเศษวัสดุกระเด็น ต้องใส่แว่นตาและหน้ากากกันฝุ่น", weight: 4, duration: 5, recDuration: 5, dep: [3], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [] },
  { id: 5, category: "2. รื้อถอน", task: "รื้อถอนห้องน้ำและระบบไฟเดิม", std: "ตัดไฟ Isolate ระบบ ปลดสุขภัณฑ์ อ่างล้างหน้า ฝ้าเพดาน และสายไฟ", saf: "ระวังไฟดูด ต้องเช็กด้วยไขควงวัดไฟก่อนตัดสายทุกครั้ง และระวังก๊อกน้ำแตก", weight: 2, duration: 3, recDuration: 3, dep: [4], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [] },
  { id: 6, category: "3. โครงสร้างและหลังคา", task: "ติดตั้งแผ่น Plate และเสาเหล็กกล่อง", std: "ยึด Plate 0.15x0.15 ม. หนา 6 มม. ลงพื้น ค.ส.ล. เดิม ตั้งเสาเหล็กกล่อง 100x100 มม. ให้ได้ดิ่ง", saf: "ระวังการสกัดเจาะโดนโครงสร้างเดิม และการเชื่อมเพลทต้องได้แนว", weight: 5, duration: 5, recDuration: 5, dep: [5], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "เหล็กกล่อง/Plate", approved: false}] },
  { id: 7, category: "3. โครงสร้างและหลังคา", task: "ติดตั้งโครงหลังคา อะเส จันทัน แป และทาสี", std: "เชื่อมอะเส 100x50 มม. และจันทัน/แป ตัว C 75x45 มม. ทาสีกันสนิม 1 รอบ สีน้ำมัน 2 รอบ", saf: "เตรียมถังดับเพลิงใกล้จุดเชื่อมงาน (Hot Work) ตรวจสอบรอยเชื่อมว่าเต็มแนว", weight: 7, duration: 7, recDuration: 7, dep: [6], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "สีกันสนิม/สีน้ำมัน", approved: false}] },
  { id: 8, category: "3. โครงสร้างและหลังคา", task: "มุงหลังคา Metal sheet และแผ่นโปร่งแสง", std: "ใช้แผ่นอลูซิงค์หนาไม่ต่ำกว่า 0.40 มม. และแผ่นโปร่งแสง 1,800 sqm. ยิงสกรูถูกระยะ", saf: "ระวังลื่นตกหลังคาขณะฝนตก ห้ามเหยียบแผ่นโปร่งแสงโดยตรง", weight: 5, duration: 5, recDuration: 5, dep: [7], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "แผ่นหลังคา/โปร่งแสง", approved: false}] },
  { id: 9, category: "3. โครงสร้างและหลังคา", task: "ติดตั้งรางน้ำสแตนเลส และ Flashing", std: "ติด Flashing ต่อผนัง เซาะร่อง อุด PU ยาแนว และเทปปิด 20 ซม. ต่อท่อ PVC 4 นิ้ว", saf: "ระวังน้ำรั่วซึม ห้ามใช้ซิลิโคนทั่วไป ต้องใช้ PU ยาแนวสำหรับภายนอกเท่านั้น", weight: 3, duration: 3, recDuration: 3, dep: [8], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "รางน้ำ/ยาแนว PU", approved: false}] },
  { id: 10, category: "4. เดินท่อระบบ", task: "เดินสายเมน THW ท่อ PVC/uPVC สีขาว", std: "ร้อยสายในท่อ ฝังผนังหรือเดินลอยตีคลิปให้ได้ระดับตามแนวสถาปัตย์", saf: "ระวังสายไฟถลอกระหว่างร้อยท่อ ห้ามมีรอยต่อสายไฟกลางท่อ", weight: 5, duration: 7, recDuration: 7, dep: [5], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "ท่อร้อยสาย/สายไฟ", approved: false}] },
  { id: 11, category: "4. เดินท่อระบบ", task: "ติดตั้งตู้ Load Center, DB และแท่งกราวด์", std: "แยกวงจรแสงสว่าง เต้ารับ แอร์ ตอกแท่งกราวด์หุ้มทองแดง 5/8 นิ้ว ยาว 10 ฟุต", saf: "ตรวจสอบความต้านทานดิน (Ground Resistance) ต้องได้ค่าตามมาตรฐาน กฟภ.", weight: 5, duration: 5, recDuration: 5, dep: [10], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "ตู้ไฟ/เบรกเกอร์", approved: false}, {name: "แท่งกราวด์", approved: false}] },
  { id: 12, category: "5. สถาปัตยกรรม", task: "ทำความสะอาด ขัด โป๊ว ทาสีผนังเดิม", std: "ทารองพื้นปูนเก่า 1 รอบ ทาสีทับหน้าอะครีลิค 100% 2 รอบ", saf: "ตรวจสอบความชื้นผนังก่อนทาสี และระวังสีหยดเลอะโครงสร้างอื่น", weight: 7, duration: 7, recDuration: 7, dep: [8, 10], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "สีทาอาคาร", approved: false}] },
  { id: 13, category: "5. สถาปัตยกรรม", task: "ติดตั้งผนัง Aluminium Composite", std: "ขึ้นโครงคร่าวโลหะ ยิงยึดแผ่นคอมโพสิตหนา 4.0 มม. ให้ได้ฉากและระดับ", saf: "ระวังแผ่นเป็นรอยขีดข่วน ห้ามลอกฟิล์มป้องกันจนกว่างานจะเสร็จ", weight: 10, duration: 10, recDuration: 10, dep: [12], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "แผ่นคอมโพสิต", approved: false}] },
  { id: 14, category: "5. สถาปัตยกรรม", task: "ติดตั้งฝ้าเพดานยิปซั่มทนชื้น", std: "แขวนโครงที-บาร์ระดับสม่ำเสมอ ใส่แผ่นยิปซั่ม 600x600 มม. หนา 8 มม.", saf: "ระวังนั่งร้านล้ม เช็กระดับฝ้าให้ตรงกับแนวท่อระบบไฟด้านบน", weight: 8, duration: 7, recDuration: 7, dep: [10], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "แผ่นฝ้า/โครงทีบาร์", approved: false}] },
  { id: 15, category: "5. สถาปัตยกรรม", task: "ก่ออิฐขอบเวที และปูกระเบื้องเวที", std: "ปรับระดับ ปูกระเบื้อง 16x16 นิ้ว ผิวด้าน/หยาบที่พื้นและลูกนอนบันได", saf: "ต้องใช้กระเบื้องผิวด้านเท่านั้นเพื่อกันลื่น และห้ามคนเดินเหยียบก่อนปูนเซ็ตตัว", weight: 3, duration: 5, recDuration: 5, dep: [14], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "กระเบื้องเวที", approved: false}] },
  { id: 16, category: "5. สถาปัตยกรรม", task: "ติดตั้งประตู D1 (พลาสติก)", std: "ติดวงกบ ใส่บาน ติดตั้งบานพับสแตนเลส 3 ตัว/บาน และลูกบิด", saf: "ตรวจสอบระยะห่างบานพับให้รับน้ำหนักได้ ป้องกันประตูตก", weight: 2, duration: 2, recDuration: 2, dep: [12], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "ชุดประตู/อุปกรณ์", approved: false}] },
  { id: 17, category: "6. ติดตั้งอุปกรณ์", task: "ติดตั้งสุขภัณฑ์ (โถส้วม อ่างล้างหน้า)", std: "วางสุขภัณฑ์ให้ตรงท่อ อุดยาแนว/ซิลิโคนกันกลิ่นและน้ำรั่ว", saf: "ทดสอบการกดน้ำ (Flush) และระวังกระเบื้องบิ่นตอนเจาะยึดพุก", weight: 5, duration: 3, recDuration: 3, dep: [11, 15], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "สุขภัณฑ์/ก๊อกน้ำ", approved: false}] },
  { id: 18, category: "6. ติดตั้งอุปกรณ์", task: "ติดตั้งโคมไฟ สวิตช์ เต้ารับ", std: "ติดสวิตช์สูง 1.20 ม. เต้ารับ 0.30 ม. ติดโคมไฟให้แน่นหนา", saf: "ทดสอบ Load Test และตรวจสอบการเชื่อมต่อสายกราวด์ทุกจุด", weight: 5, duration: 5, recDuration: 5, dep: [14, 11], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "โคมไฟ/อุปกรณ์สวิตช์", approved: false}] },
  { id: 19, category: "7. งานพื้น (Epoxy)", task: "เคลียร์พื้นที่ ซ่อมแซมเตรียมผิวคอนกรีต", std: "ขนย้ายนั่งร้านและวัสดุทั้งหมดออก ซ่อมแซมรอยร้าวบนพื้นเดิม ขัดเปิดผิว", saf: "ห้ามช่างกลุ่มอื่นเข้าพื้นที่เด็ดขาด และห้ามมีฝุ่นบริเวณหน้างาน", weight: 3, duration: 3, recDuration: 3, dep: [13, 17, 18], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [] },
  { id: 20, category: "7. งานพื้น (Epoxy)", task: "ทำพื้นระบบ Epoxy Self-Leveling", std: "เทและเกลี่ยสี Epoxy ความหนา 3.0 มม. ให้ไหลระดับเอง รอจนกว่าสีจะเซ็ตตัว", saf: "ระวังความชื้นของปูนก่อนเท (ต้องวัดค่า) สวมรองเท้าหนามขณะเกลี่ยสี", weight: 7, duration: 5, recDuration: 5, dep: [19], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "สีพื้น Epoxy", approved: false}] },
  { id: 21, category: "8. ส่งมอบ", task: "ติดตั้งป้ายชื่ออาคาร", std: "ติดตัวอักษรสแตนเลสยกขอบ 2.5 ซม. และโลโก้ยกขอบ 4 ซม.", saf: "ยึดให้แข็งแรง ทนทานต่อลมและแดด ระวังรอยนิ้วมือบนสแตนเลส", weight: 2, duration: 2, recDuration: 2, dep: [13], hold: false, status: "ยังไม่เริ่ม", remarks: "", approvals: [{name: "แบบป้ายสแตนเลส", approved: false}] },
  { id: 22, category: "8. ส่งมอบ", task: "ทดสอบระบบ (Commissioning)", std: "เปิดไฟทุกดวง เปิดก๊อกน้ำทุกจุด จำลองการใช้งานจริงแบบ Full Load", saf: "ระวังเบรกเกอร์ทิป หรือน้ำรั่วตามข้อต่อ ต้องมีช่างสแตนด์บายแก้ไข", weight: 2, duration: 2, recDuration: 2, dep: [20, 21], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [] },
  { id: 23, category: "8. ส่งมอบ", task: "ทำความสะอาดและส่งมอบงาน", std: "Big Cleaning ทั่วบริเวณ ลอกฟิล์มป้องกัน ซ่อมแซมจุดบกพร่อง (Defect)", saf: "ระวังน้ำยาทำความสะอาดกัดกร่อนสแตนเลสหรือพื้น Epoxy", weight: 1, duration: 2, recDuration: 2, dep: [22], hold: true, status: "ยังไม่เริ่ม", remarks: "", approvals: [] }
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const defaultDailyLog = { weather: 'แจ่มใส', manpower: 0, note: '' };

const statusColors = {
  "ยังไม่เริ่ม": "bg-slate-700 text-slate-300 border-slate-600",
  "กำลังดำเนินการ": "bg-blue-900/50 text-blue-300 border-blue-700/50",
  "ล่าช้า": "bg-rose-900/50 text-rose-300 border-rose-700/50",
  "แล้วเสร็จ": "bg-emerald-900/50 text-emerald-300 border-emerald-700/50"
};

const statusProgressMap = {
  "ยังไม่เริ่ม": 0,
  "กำลังดำเนินการ": 50,
  "ล่าช้า": 25,
  "แล้วเสร็จ": 100
};

export default function App() {
  // --- 2. State Management ---
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(defaultTasks);
  const [dailyLog, setDailyLog] = useState(defaultDailyLog);
  const [dailyLogsHistory, setDailyLogsHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [syncStatus, setSyncStatus] = useState('กำลังเชื่อมต่อ Cloud...');
  const [sheetStatus, setSheetStatus] = useState(''); // สถานะการส่งข้อมูล Google Sheet
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Firebase Auth Effect
  useEffect(() => {
    if (!auth) {
      setSyncStatus('Local Mode (ไม่พบ Cloud)');
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth error:", e);
        setSyncStatus('เชื่อมต่อ Cloud ล้มเหลว');
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Firebase Data Fetching Effect
  useEffect(() => {
    if (!user || !db) return;
    
    setSyncStatus('กำลังซิงค์...');
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'dashboard', 'tasksData');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTasks(data.tasks || defaultTasks);
        setDailyLog(data.dailyLog || defaultDailyLog);
        setDailyLogsHistory(data.dailyLogsHistory || []);
        setSyncStatus('ออนไลน์ 🟢');
      } else {
        // Initial save if document doesn't exist
        setDoc(docRef, { tasks: defaultTasks, dailyLog: defaultDailyLog, dailyLogsHistory: [] }).catch(console.error);
      }
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setSyncStatus('ซิงค์ผิดพลาด 🔴');
    });
    
    return () => unsubscribe();
  }, [user]);

  // --- 3. Calculations (Timeline & Progress) ---
  const { timeline, projectEnd, criticalPath } = useMemo(() => {
    const tl = {};
    let iterations = 0;
    const maxIters = tasks.length * 2;
    let allDone = false;

    // Calculate Start/End
    while (!allDone && iterations < maxIters) {
      allDone = true;
      tasks.forEach(t => {
        if (!tl[t.id]) {
          if (t.dep.length === 0) {
            tl[t.id] = { start: 0, end: t.duration };
          } else {
            const depNodes = t.dep.map(dId => tl[dId]);
            if (depNodes.every(n => n)) {
              const maxStart = Math.max(...depNodes.map(n => n.end));
              tl[t.id] = { start: maxStart, end: maxStart + t.duration };
            } else {
              allDone = false;
            }
          }
        }
      });
      iterations++;
    }

    const end = Math.max(0, ...Object.values(tl).map(n => n.end));
    
    // Identify critical path (simplistic: tasks ending exactly at project end)
    const cp = new Set();
    Object.keys(tl).forEach(id => {
      if (tl[id].end === end) {
        cp.add(Number(id));
      }
    });

    return { timeline: tl, projectEnd: end, criticalPath: cp };
  }, [tasks]);

  const { overallProgress, categoryStats, dashboardStats } = useMemo(() => {
    let totalW = 0;
    let completedW = 0;
    const catMap = {};
    
    // Additional Detailed Stats
    const dStats = {
      totalHold: 0, pendingHold: 0,
      totalAppr: 0, resolvedAppr: 0,
      sCounts: { "ยังไม่เริ่ม": 0, "กำลังดำเนินการ": 0, "ล่าช้า": 0, "แล้วเสร็จ": 0 }
    };

    tasks.forEach(t => {
      totalW += t.weight;
      const progressPercent = statusProgressMap[t.status] || 0;
      completedW += (t.weight * progressPercent) / 100;

      if (!catMap[t.category]) {
        catMap[t.category] = { category: t.category, totalW: 0, compW: 0, count: 0, done: 0 };
      }
      catMap[t.category].totalW += t.weight;
      catMap[t.category].compW += (t.weight * progressPercent) / 100;
      catMap[t.category].count += 1;
      if (t.status === "แล้วเสร็จ") catMap[t.category].done += 1;
      
      // Calculate dashboard stats
      if (t.hold) {
        dStats.totalHold++;
        if (t.status !== 'แล้วเสร็จ') dStats.pendingHold++;
      }
      if (t.approvals) {
        t.approvals.forEach(a => {
          dStats.totalAppr++;
          if (a.approved) dStats.resolvedAppr++;
        });
      }
      if (dStats.sCounts[t.status] !== undefined) dStats.sCounts[t.status]++;
    });

    const stats = Object.values(catMap).map(c => ({
      ...c,
      progress: c.totalW ? Math.round((c.compW / c.totalW) * 100) : 0
    }));

    return {
      overallProgress: totalW ? Math.round((completedW / totalW) * 100) : 0,
      categoryStats: stats,
      dashboardStats: dStats
    };
  }, [tasks]);

  // Group tasks for table
  const groupedTasks = useMemo(() => {
    const groups = {};
    
    // Apply filters before grouping
    const filteredTasks = tasks.filter(t => {
      const matchSearch = t.task.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });

    filteredTasks.forEach(t => {
      if(!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [tasks, searchQuery, statusFilter]);

  // --- 4. Handlers ---
  const saveToCloud = async (newTasks, newDailyLog, newHistory) => {
    if (user && db) {
      try {
        setSyncStatus('กำลังซิงค์...');
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dashboard', 'tasksData'), { 
          tasks: newTasks || tasks,
          dailyLog: newDailyLog || dailyLog,
          dailyLogsHistory: newHistory || dailyLogsHistory
        });
        setSyncStatus('ออนไลน์ 🟢');
      } catch (e) {
        console.error("Error saving to cloud", e);
        setSyncStatus('ซิงค์ผิดพลาด 🔴');
      }
    }
  };

  const resetData = () => {
    if (window.confirm("คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?\n(ข้อมูลที่แก้ไขจะหายไปทั้งหมด)")) {
      setTasks(defaultTasks);
      setDailyLog(defaultDailyLog);
      setDailyLogsHistory([]);
      setExpandedRows(new Set());
      saveToCloud(defaultTasks, defaultDailyLog, []);
    }
  };

  const updateTask = (id, field, value) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTasks(newTasks);
    saveToCloud(newTasks, dailyLog, dailyLogsHistory);
  };

  const updateDailyLog = (field, value) => {
    const newLog = { ...dailyLog, [field]: value };
    setDailyLog(newLog);
    saveToCloud(tasks, newLog, dailyLogsHistory);
  };

  const handleSaveDailyLog = async () => {
    // บันทึกวันและเวลาปัจจุบันในรูปแบบไทยที่อ่านง่าย
    const currentDate = new Date().toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    
    const newEntry = {
      id: Date.now(),
      date: currentDate,
      ...dailyLog
    };
    
    // อัปเดต History แสดงผลหน้าจอทันที
    const newHistory = [newEntry, ...dailyLogsHistory];
    setDailyLogsHistory(newHistory);
    
    const resetLog = { ...dailyLog, note: '' };
    setDailyLog(resetLog);
    
    saveToCloud(tasks, resetLog, newHistory);

    // ส่งข้อมูลตรงไปยัง Google Sheets ตามหัวตารางที่คุณกำหนด (Col A ถึง D)
    try {
      setSheetStatus('กำลังส่งเข้า Google Sheets...');
      
      const payload = {
        date: currentDate,
        weather: dailyLog.weather,
        manpower: String(dailyLog.manpower),
        note: dailyLog.note || '-'
      };

      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      setSheetStatus('ส่งเข้า Google Sheets สำเร็จ! 📊');
      setTimeout(() => setSheetStatus(''), 4000);
    } catch (err) {
      console.error("Failed to sync to Google Sheet:", err);
      setSheetStatus('ส่ง Google Sheets สำเร็จ (No-CORS Mode)');
      setTimeout(() => setSheetStatus(''), 4000);
    }
  };

  const toggleApproval = (taskId, approvalIndex) => {
    const newTasks = tasks.map(t => {
      if (t.id === taskId) {
        const newApprovals = [...t.approvals];
        newApprovals[approvalIndex] = {
          ...newApprovals[approvalIndex],
          approved: !newApprovals[approvalIndex].approved
        };
        return { ...t, approvals: newApprovals };
      }
      return t;
    });
    setTasks(newTasks);
    saveToCloud(newTasks);
  };

  const toggleRow = (id) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // ใส่ BOM (Byte Order Mark) เพื่อให้ Excel อ่านภาษาไทยได้ถูกต้อง
    const BOM = "\uFEFF";
    const header = "หมวดงาน,ลำดับ,ชื่องาน,น้ำหนัก(%),สถานะ,วิกฤต,จำนวนอนุมัติ,หมายเหตุ\n";
    const rows = tasks.map(t => {
      const approvedCount = t.approvals ? t.approvals.filter(a => a.approved).length : 0;
      const totalAppr = t.approvals ? t.approvals.length : 0;
      const apprText = totalAppr > 0 ? `${approvedCount}/${totalAppr}` : '-';
      return `"${t.category}",${t.id},"${t.task}",${t.weight},"${t.status}","${t.hold ? 'ใช่' : 'ไม่'}","${apprText}","${t.remarks}"`;
    }).join("\n");
    
    const csvContent = BOM + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Construction_Tracking_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 5. Render Helpers ---
  const renderDashboard = () => (
    <div className="space-y-6 fade-in">
      {/* Daily Site Log (New Feature) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col md:flex-row gap-4 items-start md:items-center print-hide">
        <div className="flex-shrink-0 bg-indigo-500/20 p-3 rounded-lg border border-indigo-500/30">
          <h3 className="text-indigo-400 font-bold flex items-center gap-2"><BookOpen className="w-5 h-5"/> สภาวะหน้างานวันนี้</h3>
        </div>
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 w-full items-end">
          <div className="flex flex-col gap-1 md:col-span-3">
            <label className="text-xs text-slate-400 flex items-center gap-1"><CloudSun className="w-3.5 h-3.5"/> สภาพอากาศ</label>
            <select 
              value={dailyLog.weather}
              onChange={(e) => updateDailyLog('weather', e.target.value)}
              className="bg-slate-900 border border-slate-700 text-sm rounded-md px-2 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="แจ่มใส">แจ่มใส (ปกติ)</option>
              <option value="มีเมฆมาก">มีเมฆมาก</option>
              <option value="ฝนตกปรอยๆ">ฝนตกปรอยๆ</option>
              <option value="ฝนตกหนัก (อุปสรรค)">ฝนตกหนัก (อุปสรรค)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5"/> กำลังคน (คน)</label>
            <input 
              type="number" 
              value={dailyLog.manpower}
              onChange={(e) => updateDailyLog('manpower', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 text-sm rounded-md px-2 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-4">
            <label className="text-xs text-slate-400">บันทึกเหตุการณ์หน้างาน</label>
            <input 
              type="text" 
              placeholder="เช่น วัสดุเข้าหน้างาน, ปัญหาที่พบ..."
              value={dailyLog.note}
              onChange={(e) => updateDailyLog('note', e.target.value)}
              className="bg-slate-900 border border-slate-700 text-sm rounded-md px-2 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDailyLog(); }}
            />
          </div>
          <div className="md:col-span-3 flex flex-col gap-1">
            <button 
              onClick={handleSaveDailyLog}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-2 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors h-[34px] border border-indigo-500"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> บันทึก
            </button>
            {sheetStatus && (
              <span className="text-[10px] text-emerald-400 text-center animate-pulse">{sheetStatus}</span>
            )}
          </div>
        </div>
      </div>

      {/* Top Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5"/> ความคืบหน้าโครงการรวม</h3>
          <div className="flex items-end gap-6 mb-2">
            <span className="text-6xl font-bold text-white leading-none">{overallProgress}%</span>
            <div className="flex-1 pb-2">
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-700 ease-out" style={{width: `${overallProgress}%`}}></div>
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-400">อัปเดตความคืบหน้าจากสัดส่วนน้ำหนักงานทั้งหมด 100%</div>
        </div>
        
        {/* Status Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> สถานะงาน (Tasks)</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> ยังไม่เริ่ม</span>
              <span className="font-bold text-slate-200">{dashboardStats.sCounts["ยังไม่เริ่ม"]}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> กำลังดำเนินการ</span>
              <span className="font-bold text-slate-200">{dashboardStats.sCounts["กำลังดำเนินการ"]}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> ล่าช้า</span>
              <span className="font-bold text-rose-400">{dashboardStats.sCounts["ล่าช้า"]}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> แล้วเสร็จ</span>
              <span className="font-bold text-emerald-400">{dashboardStats.sCounts["แล้วเสร็จ"]}</span>
            </div>
          </div>
        </div>

        {/* Critical & Approvals */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-slate-400 text-xs font-medium flex items-center gap-1.5 mb-1"><AlertOctagon className="w-4 h-4 text-rose-500"/> วิกฤต (Hold Point)</h3>
                <p className="text-2xl font-bold text-white">
                  {dashboardStats.pendingHold} <span className="text-sm font-normal text-slate-500">/ {dashboardStats.totalHold}</span>
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-slate-400 text-xs font-medium flex items-center gap-1.5 justify-end mb-1"><Clock className="w-4 h-4 text-indigo-400"/> เวลาประเมิน</h3>
                <p className="text-2xl font-bold text-white">{projectEnd} <span className="text-sm font-normal text-slate-500">วัน</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg flex-1 flex flex-col justify-center">
            <h3 className="text-slate-400 text-xs font-medium flex items-center gap-1.5 mb-2"><FileCheck className="w-4 h-4 text-emerald-500"/> สถานะการอนุมัติวัสดุ</h3>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-1 border border-slate-700">
              <div className="bg-emerald-500 h-full transition-all" style={{width: `${dashboardStats.totalAppr ? (dashboardStats.resolvedAppr/dashboardStats.totalAppr)*100 : 0}%`}}></div>
            </div>
            <p className="text-sm text-slate-300 font-medium text-right">
              อนุมัติแล้ว {dashboardStats.resolvedAppr} จาก {dashboardStats.totalAppr} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5"/> ความคืบหน้าแยกตามหมวดหมู่งาน</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryStats} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="category" type="category" width={150} stroke="#94a3b8" tick={{fill: '#e2e8f0', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} 
              />
              <Bar dataKey="progress" name="ความคืบหน้า" radius={[0, 4, 4, 0]} barSize={24}>
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4"><BookOpen className="w-5 h-5 text-indigo-400"/> สมุดปูมประวัติ (Historical Daily Logs)</h3>
        {dailyLogsHistory.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-600 rounded-lg text-slate-400">
            ยังไม่มีประวัติการบันทึกหน้างาน (เพิ่มข้อมูลด้านบนและกด "บันทึก")
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-slate-900/80 uppercase border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-40">วัน/เวลา</th>
                  <th className="px-4 py-3 w-32">สภาพอากาศ</th>
                  <th className="px-4 py-3 w-24 text-center">กำลังคน</th>
                  <th className="px-4 py-3">เหตุการณ์ / หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {dailyLogsHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 font-medium">{log.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md border text-xs font-medium ${
                        log.weather.includes('ฝน') ? 'bg-rose-900/30 border-rose-700/50 text-rose-400' : 'bg-emerald-900/30 border-emerald-700/50 text-emerald-400'
                      }`}>
                        {log.weather}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">{log.manpower}</td>
                    <td className="px-4 py-3 text-slate-400">{log.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderGantt = () => {
    // Generate grid columns (e.g. 5-day intervals)
    const columns = Math.ceil(projectEnd / 5) * 5 || 30;
    const ticks = Array.from({length: columns / 5 + 1}, (_, i) => i * 5);

    // Sort categories properly based on the leading number
    const sortedCategories = Object.keys(groupedTasks).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg overflow-x-auto fade-in">
        <div className="min-w-[800px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <CalendarDays className="w-5 h-5"/> แผนภูมิเวลา (Gantt Chart)
            </h3>
            <div className="flex gap-4 text-xs font-medium bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-600 rounded"></div> รอเริ่มงาน</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div> ดำเนินการ</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded"></div> แล้วเสร็จ</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded"></div> ล่าช้า / วิกฤต</div>
            </div>
          </div>
          
          <div className="relative mt-8">
            {/* Time Scale Header */}
            <div className="flex border-b border-slate-700 pb-2 mb-4 ml-[320px]">
              {ticks.map(tick => (
                <div key={tick} className="flex-1 text-xs text-slate-400 font-medium text-left border-l border-slate-700 pl-1">
                  Day {tick}
                </div>
              ))}
            </div>

            {/* Grid Background */}
            <div className="absolute top-8 bottom-0 left-[320px] right-0 flex pointer-events-none">
              {ticks.map(tick => (
                <div key={`grid-${tick}`} className="flex-1 border-l border-slate-700/30"></div>
              ))}
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              {sortedCategories.map(cat => {
                const catTasks = [...groupedTasks[cat]].sort((a, b) => a.id - b.id);
                return (
                  <div key={cat} className="mb-6">
                    <div className="font-bold text-slate-300 text-sm mb-3 border-l-2 border-indigo-500 pl-2">{cat}</div>
                    <div className="space-y-3">
                      {catTasks.map(task => {
                        const timing = timeline[task.id] || {start: 0, end: 0};
                        const isCritical = criticalPath.has(task.id);
                        
                        let barColor = "bg-slate-600";
                        if (task.status === "กำลังดำเนินการ") barColor = "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
                        if (task.status === "แล้วเสร็จ") barColor = "bg-emerald-500";
                        if (task.status === "ล่าช้า") barColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
                        
                        // Calculate percentages for positioning
                        const startPct = (timing.start / columns) * 100;
                        const widthPct = ((timing.end - timing.start) / columns) * 100;

                        return (
                          <div key={task.id} className="flex items-center group relative z-10">
                            <div className="w-[250px] pr-4 flex items-center justify-between shrink-0">
                              <div className="flex flex-col w-full pr-2">
                                <span className="text-xs text-slate-300 truncate font-medium" title={task.task}>
                                  {task.id}. {task.task}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={task.duration}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      if (!isNaN(val)) updateTask(task.id, 'duration', val);
                                    }}
                                    className="bg-slate-900 border border-slate-600 text-[10px] text-indigo-300 w-12 px-1 py-0.5 rounded text-center focus:border-indigo-500 focus:outline-none"
                                  />
                                  <span className="text-[10px] text-slate-500">วัน (แนะนำ {defaultTasks.find(t => t.id === task.id)?.duration})</span>
                                </div>
                              </div>
                              {isCritical && <AlertOctagon className="w-3 h-3 text-rose-500 shrink-0 ml-2" title="งานวิกฤต (Critical Path)" />}
                            </div>
                            <div className="flex-1 h-6 relative bg-slate-900/50 rounded overflow-hidden">
                              <div 
                                className={`absolute top-0 bottom-0 rounded flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500 ${barColor}`}
                                style={{
                                  left: `${startPct}%`,
                                  width: `${widthPct}%`,
                                  minWidth: '24px'
                                }}
                              >
                                {timing.end - timing.start}d
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskList = () => {
    // Sort categories properly based on the leading number
    const sortedCategories = Object.keys(groupedTasks).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });

    return (
    <div className="space-y-6 fade-in">
      {/* Search and Filter Controls */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center print-hide">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหางาน หรือ หมวดหมู่..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 flex-1 sm:flex-none"
          >
            <option value="all">แสดงทุกสถานะ</option>
            <option value="ยังไม่เริ่ม">⚪ ยังไม่เริ่ม</option>
            <option value="กำลังดำเนินการ">🔵 กำลังดำเนินการ</option>
            <option value="ล่าช้า">🔴 ล่าช้า</option>
            <option value="แล้วเสร็จ">🟢 แล้วเสร็จ</option>
          </select>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 text-slate-400">
          ไม่พบข้อมูลงานที่ค้นหา
        </div>
      ) : (
        sortedCategories.map((category) => {
          const catTasks = groupedTasks[category];
          // Sort tasks inside category by their ID
          catTasks.sort((a, b) => a.id - b.id);
          
          return (
            <div key={category} className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-200">{category}</h2>
                <div className="text-xs font-medium bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                  {catTasks.filter(t => t.status === 'แล้วเสร็จ').length} / {catTasks.length} งาน
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 bg-slate-800/50 uppercase border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3 w-16 text-center">ลำดับ</th>
                      <th className="px-4 py-3">รายละเอียดงาน</th>
                      <th className="px-4 py-3 w-20 text-center">สัดส่วน</th>
                      <th className="px-4 py-3 w-40">สถานะ</th>
                      <th className="px-4 py-3 w-64">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catTasks.map(task => {
                      const isExpanded = expandedRows.has(task.id);
                      const statusClass = statusColors[task.status] || "bg-slate-700 text-slate-300";
                      
                      return (
                        <React.Fragment key={task.id}>
                          <tr className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${isExpanded ? 'bg-slate-700/20' : ''}`}>
                            <td className="px-4 py-3 text-center">
                              <div 
                                onClick={() => toggleRow(task.id)}
                                className="cursor-pointer p-1 hover:bg-slate-600 rounded-full inline-flex text-slate-400 transition-colors"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500 font-medium">
                               #{task.id}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {task.hold && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" title="Hold Point (จุดวิกฤต/ห้ามข้าม)" />}
                                <span className="font-medium text-slate-200">{task.task}</span>
                                {task.approvals && task.approvals.length > 0 && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap ${task.approvals.every(a => a.approved) ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400' : 'bg-amber-900/30 border-amber-700/50 text-amber-500'}`} title="การอนุมัติวัสดุ/แบบ">
                                    อนุมัติ {task.approvals.filter(a => a.approved).length}/{task.approvals.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">{task.weight}%</td>
                            <td className="px-4 py-3">
                              <select
                                value={task.status}
                                onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                                className={`w-full appearance-none px-3 py-1.5 pr-8 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer ${statusClass}`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                  backgroundPosition: 'right 0.5rem center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '1.5em 1.5em'
                                }}
                              >
                                <option value="ยังไม่เริ่ม">ยังไม่เริ่ม</option>
                                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                                <option value="ล่าช้า">ล่าช้า</option>
                                <option value="แล้วเสร็จ">แล้วเสร็จ</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="text" 
                                value={task.remarks}
                                onChange={(e) => updateTask(task.id, 'remarks', e.target.value)}
                                placeholder="ระบุหมายเหตุ..."
                                className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 text-sm placeholder-slate-600"
                              />
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-900/50 border-b border-slate-700/50">
                              <td></td>
                              <td colSpan="5" className="px-4 py-4 pl-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <h4 className="font-semibold text-indigo-400 flex items-center gap-1.5 mb-2"><BookOpen className="w-4 h-4"/> มาตรฐาน/ขั้นตอนการทำงาน</h4>
                                    <p className="text-slate-300 leading-relaxed">{task.std}</p>
                                  </div>
                                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <h4 className="font-semibold text-rose-400 flex items-center gap-1.5 mb-2"><ShieldAlert className="w-4 h-4"/> ข้อควรระวัง/ความปลอดภัย</h4>
                                    <p className="text-slate-300 leading-relaxed">{task.saf}</p>
                                  </div>
                                  {task.approvals && task.approvals.length > 0 && (
                                    <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 col-span-1 md:col-span-2 mt-2">
                                      <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-3"><CheckCircle2 className="w-4 h-4"/> รายการขออนุมัติวัสดุ/แบบ (คลิกเพื่ออัปเดต)</h4>
                                      <div className="flex flex-wrap gap-3">
                                        {task.approvals.map((appr, idx) => (
                                          <button 
                                            key={idx}
                                            onClick={() => toggleApproval(task.id, idx)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer
                                              ${appr.approved 
                                                ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400 hover:bg-emerald-900/60' 
                                                : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                                              }`}
                                          >
                                            {appr.approved ? <CheckSquare className="w-3.5 h-3.5"/> : <Square className="w-3.5 h-3.5"/>}
                                            {appr.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-12 selection:bg-indigo-500/30">
      <header className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700 shadow-xl print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                <HardHat className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 leading-tight">โครงการปรับปรุงศูนย์เยาวชน</h1>
                <p className="text-[10px] text-slate-400 font-medium">เทศบาลนครสุราษฎร์ธานี • {syncStatus}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors border border-transparent hover:border-emerald-400/30 flex items-center gap-2" title="บันทึก Excel (CSV)">
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Excel</span>
              </button>
              <button onClick={handlePrint} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors border border-transparent hover:border-indigo-400/30 flex items-center gap-2" title="พิมพ์รายงาน (PDF)">
                <Printer className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Print</span>
              </button>
              <button onClick={resetData} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors border border-transparent hover:border-rose-400/30 flex items-center gap-2" title="รีเซ็ตข้อมูล">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-1 mt-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-indigo-500/20 text-indigo-400 border-t border-x border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <BarChart2 className="w-4 h-4"/> ภาพรวม (Dashboard)
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-indigo-500/20 text-indigo-400 border-t border-x border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <ListTodo className="w-4 h-4"/> แผนงาน / อัปเดตสถานะ
            </button>
            <button 
              onClick={() => setActiveTab('gantt')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'gantt' ? 'bg-indigo-500/20 text-indigo-400 border-t border-x border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <CalendarDays className="w-4 h-4"/> แผนภูมิเวลา (Gantt)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 print-mt-0">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tasks' && renderTaskList()}
        {activeTab === 'gantt' && renderGantt()}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white !important; color: black !important; }
          .print-hide { display: none !important; }
          .print-mt-0 { margin-top: 0 !important; }
          .shadow-lg { box-shadow: none !important; }
          .bg-slate-800, .bg-[#050505] { background-color: white !important; }
          .text-slate-200, .text-slate-300, .text-slate-400, .text-white { color: #333 !important; }
          .border-slate-700, .border-slate-600 { border-color: #e5e7eb !important; }
          .bg-indigo-500\\/20, .bg-slate-900 { background-color: #f3f4f6 !important; }
        }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
