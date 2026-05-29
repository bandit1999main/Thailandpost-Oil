import { 
  isCloudConnected,
  fetchEmployees,
  saveEmployees,
  fetchWaterEmployees,
  saveWaterEmployees,
  listenToEmployees,
  listenToWaterEmployees,
  fetchRouteData,
  saveRouteData,
  resetCloudRouteData,
  fetchSavedTemplates,
  saveTemplate,
  deleteTemplate,
  fetchSignatoryProfiles,
  saveSignatoryProfile,
  deleteSignatoryProfile
} from './database.js';

// Global Mode State
let activeMode = 'fuel'; // 'fuel' or 'water'
let waterEmployees = JSON.parse(localStorage.getItem('tp_water_employees')) || [];

const OFFICIAL_ROUTE_DATA = {
  "1": { hasCar: false, staffDist: 1300.00, staffLiters: 52.00, workerDist: 50.0, workerLiters: 2.00 },
  "2": { hasCar: false, staffDist: 1497.60, staffLiters: 60.00, workerDist: 57.6, workerLiters: 2.30 },
  "3": { hasCar: false, staffDist: 1560.00, staffLiters: 63.00, workerDist: 60.0, workerLiters: 2.40 },
  "4": { hasCar: false, staffDist: 1560.00, staffLiters: 63.00, workerDist: 60.0, workerLiters: 2.40 },
  "5": { hasCar: false, staffDist: 1352.00, staffLiters: 55.00, workerDist: 52.0, workerLiters: 2.08 },
  "6": { hasCar: false, staffDist: 1560.00, staffLiters: 63.00, workerDist: 60.0, workerLiters: 2.40 },
  "7": { hasCar: false, staffDist: 1497.60, staffLiters: 60.00, workerDist: 57.6, workerLiters: 2.30 },
  "8": { hasCar: true, staffDist: 2184.00, staffLiters: 219.00, workerDist: 84.0, workerLiters: 8.40 },
  "9": { hasCar: true, staffDist: 1937.00, staffLiters: 194.00, workerDist: 74.5, workerLiters: 7.45 },
  "10": { hasCar: false, staffDist: 1341.60, staffLiters: 54.00, workerDist: 51.6, workerLiters: 2.06 },
  "11": { hasCar: false, staffDist: 1612.00, staffLiters: 65.00, workerDist: 62.0, workerLiters: 2.48 },
  "12": { hasCar: false, staffDist: 1274.00, staffLiters: 51.00, workerDist: 49.0, workerLiters: 1.96 },
  "13": { hasCar: false, staffDist: 1518.40, staffLiters: 61.00, workerDist: 58.4, workerLiters: 2.34 },
  "14": { hasCar: false, staffDist: 1560.00, staffLiters: 63.00, workerDist: 60.0, workerLiters: 2.40 },
  "15": { hasCar: false, staffDist: 1622.40, staffLiters: 65.00, workerDist: 62.4, workerLiters: 2.50 },
  "16": { hasCar: false, staffDist: 1716.00, staffLiters: 69.00, workerDist: 66.0, workerLiters: 2.64 },
  "17": { hasCar: false, staffDist: 1716.00, staffLiters: 69.00, workerDist: 66.0, workerLiters: 2.64 },
  "18": { hasCar: false, staffDist: 1653.60, staffLiters: 67.00, workerDist: 63.6, workerLiters: 2.54 },
  "19": { hasCar: false, staffDist: 1404.00, staffLiters: 57.00, workerDist: 54.0, workerLiters: 2.16 },
  "20": { hasCar: false, staffDist: 1768.00, staffLiters: 71.00, workerDist: 68.0, workerLiters: 2.72 },
  "21": { hasCar: false, staffDist: 1768.00, staffLiters: 71.00, workerDist: 68.0, workerLiters: 2.72 },
  "22": { hasCar: true, staffDist: 2028.00, staffLiters: 203.00, workerDist: 78.0, workerLiters: 7.80 },
  "23": { hasCar: false, staffDist: 1664.00, staffLiters: 67.00, workerDist: 64.0, workerLiters: 2.56 },
  "24": { hasCar: false, staffDist: 1586.00, staffLiters: 64.00, workerDist: 61.0, workerLiters: 2.44 },
  "25": { hasCar: false, staffDist: 1627.60, staffLiters: 66.00, workerDist: 62.6, workerLiters: 2.50 },
  "26": { hasCar: false, staffDist: 1560.00, staffLiters: 63.00, workerDist: 60.0, workerLiters: 2.40 },
  "27": { hasCar: false, staffDist: 1445.60, staffLiters: 58.00, workerDist: 55.6, workerLiters: 2.22 },
  "28": { hasCar: false, staffDist: 1336.40, staffLiters: 54.00, workerDist: 51.4, workerLiters: 2.06 },
  "29": { hasCar: false, staffDist: 1352.00, staffLiters: 55.00, workerDist: 52.0, workerLiters: 2.08 },
  "30": { hasCar: false, staffDist: 1580.80, staffLiters: 64.00, workerDist: 60.8, workerLiters: 2.43 },
  "31": { hasCar: false, staffDist: 1612.00, staffLiters: 65.00, workerDist: 62.0, workerLiters: 2.48 },
  "32": { hasCar: false, staffDist: 1768.00, staffLiters: 71.00, workerDist: 68.0, workerLiters: 2.72 },
  "33": { hasCar: false, staffDist: 1846.00, staffLiters: 74.00, workerDist: 71.0, workerLiters: 2.84 },
  "34": { hasCar: false, staffDist: 1690.00, staffLiters: 68.00, workerDist: 65.0, workerLiters: 2.60 },
  "35": { hasCar: false, staffDist: 1716.00, staffLiters: 69.00, workerDist: 66.0, workerLiters: 2.64 },
  "36": { hasCar: false, staffDist: 1248.00, staffLiters: 50.00, workerDist: 48.0, workerLiters: 1.92 },
  "37": { hasCar: false, staffDist: 1612.00, staffLiters: 65.00, workerDist: 62.0, workerLiters: 2.48 },
  "38": { hasCar: true, staffDist: 2054.00, staffLiters: 206.00, workerDist: 79.0, workerLiters: 7.90 },
  "39": { hasCar: true, staffDist: 2012.40, staffLiters: 202.00, workerDist: 77.4, workerLiters: 7.74 },
  "40": { hasCar: true, staffDist: 1981.20, staffLiters: 199.00, workerDist: 76.2, workerLiters: 7.62 }
};

function initRouteData() {
  return JSON.parse(JSON.stringify(OFFICIAL_ROUTE_DATA));
}

let ROUTE_DATA = JSON.parse(localStorage.getItem('tp_route_data')) || initRouteData();

// State Store
let employees = JSON.parse(localStorage.getItem('tp_employees')) || [];
let oilPricePeriods = [];
let tempMissions = []; // temporary missions list for current supervisor input

// DOM Elements
const globalFuelPriceInput = document.getElementById('globalFuelPrice');
const globalMonthSelect = document.getElementById('globalMonth');
const globalYearSelect = document.getElementById('globalYear');
const deliveryRouteSelect = document.getElementById('deliveryRoute');
const empPositionSelect = document.getElementById('empPosition');
const vehicleTypeSelect = document.getElementById('vehicleType');
const claimMethodSelect = document.getElementById('claimMethod');
const claimMethodGroup = document.getElementById('claimMethodGroup');
const workDaysInput = document.getElementById('workDays');
const workDaysRow = document.getElementById('workDaysRow');
const daysNotWorkedInput = document.getElementById('daysNotWorked');
const daysNotWorkedGroup = document.getElementById('daysNotWorkedGroup');
const employeeForm = document.getElementById('employeeForm');
const employeeTableBody = document.getElementById('employeeTableBody');
const routeStatsPreview = document.getElementById('routeStatsPreview');
const formModeInput = document.getElementById('formMode');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

// Tabs
const tabStandard = document.getElementById('tabStandard');
const tabSupervisor = document.getElementById('tabSupervisor');

// Supervisor Mission inputs
const supervisorMissionSection = document.getElementById('supervisorMissionSection');
const missionTypeSelect = document.getElementById('missionType');
const missionRouteSelect = document.getElementById('missionRoute');
const missionDaysInput = document.getElementById('missionDays');
const missionDatesInput = document.getElementById('missionDates');
const addMissionBtn = document.getElementById('addMissionBtn');
const missionTableBody = document.getElementById('missionTableBody');
const positionRouteRow = document.getElementById('positionRouteRow');
const deliveryRouteGroup = document.getElementById('deliveryRouteGroup');

// Live Route Stats Preview
const prevDistDay = document.getElementById('prevDistDay');
const prevFuelDay = document.getElementById('prevFuelDay');
const prevDistMonth = document.getElementById('prevDistMonth');
const prevFuelMonth = document.getElementById('prevFuelMonth');

// Summary Counters
const sumFuelCostSpan = document.getElementById('sumFuelCost');
const sumMaintenanceCostSpan = document.getElementById('sumMaintenanceCost');
const sumTotalCostSpan = document.getElementById('sumTotalCost');

// Weighted Avg Modal Elements
const avgCalcModal = document.getElementById('avgCalcModal');
const openAvgCalcBtn = document.getElementById('openAvgCalcBtn');
const closeAvgModalBtn = document.getElementById('closeAvgModalBtn');
const cancelAvgBtn = document.getElementById('cancelAvgBtn');
const applyAvgPriceBtn = document.getElementById('applyAvgPriceBtn');
const addPeriodBtn = document.getElementById('addPeriodBtn');
const priceInput = document.getElementById('priceInput');
const daysInput = document.getElementById('daysInput');
const periodTableBody = document.getElementById('periodTableBody');
const avgCalcTotalDays = document.getElementById('avgCalcTotalDays');
const avgCalcTotalSum = document.getElementById('avgCalcTotalSum');
const avgCalcResultPrice = document.getElementById('avgCalcResultPrice');

// Mode Switch & Water Calculator DOM Elements
const modeFuelBtn = document.getElementById('modeFuelBtn');
const modeWaterBtn = document.getElementById('modeWaterBtn');
const salaryGroup = document.getElementById('salaryGroup');
const empSalaryInput = document.getElementById('empSalary');

// Other Button Actions
const loadDemoBtn = document.getElementById('loadDemoBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const printReportBtn = document.getElementById('printReportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Saved Templates Manager DOM Elements
const templateNameInput = document.getElementById('templateNameInput');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const templateSelect = document.getElementById('templateSelect');
const loadTemplateBtn = document.getElementById('loadTemplateBtn');
const deleteTemplateBtn = document.getElementById('deleteTemplateBtn');

// Route Editor Modal DOM Elements
const routeEditorModal = document.getElementById('routeEditorModal');
const openRouteEditorBtn = document.getElementById('openRouteEditorBtn');
const closeRouteEditorModalBtn = document.getElementById('closeRouteEditorModalBtn');
const closeRouteEditorBtn = document.getElementById('closeRouteEditorBtn');
const editRouteSelect = document.getElementById('editRouteSelect');
const routeDistDayInput = document.getElementById('routeDistDay');
const routeFuelDayInput = document.getElementById('routeFuelDay');
const routeDistMonthInput = document.getElementById('routeDistMonth');
const routeFuelMonthInput = document.getElementById('routeFuelMonth');
const routeHasCarSelect = document.getElementById('routeHasCar');
const saveSingleRouteBtn = document.getElementById('saveSingleRouteBtn');
const resetAllRoutesBtn = document.getElementById('resetAllRoutesBtn');
const routeEditorTableBody = document.getElementById('routeEditorTableBody');
const toggleSigEditBtn = document.getElementById('toggleSigEditBtn');

/* --- UI UTILITIES: TOAST & CONFIRM --- */

/**
 * showToast(message, type, duration)
 * type: 'success' | 'error' | 'warning' | 'info'
 */
function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span style="font-size:1.1rem;flex-shrink:0;">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

  const dismiss = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  toast.addEventListener('click', dismiss);
  container.appendChild(toast);
  setTimeout(dismiss, duration);
}

/**
 * showConfirm({ title, message, icon, okText, okClass, onConfirm })
 * Returns nothing – executes onConfirm() callback asynchronously when user clicks OK
 */
function showConfirm({ title = 'ยืนยัน', message = '', icon = '⚠️', okText = 'ยืนยัน', okClass = 'btn-danger', onConfirm }) {
  const modal        = document.getElementById('confirmModal');
  const titleEl      = document.getElementById('confirmModalTitle');
  const msgEl        = document.getElementById('confirmModalMsg');
  const iconEl       = document.getElementById('confirmModalIcon');
  const okBtn        = document.getElementById('confirmModalOk');
  const cancelBtn    = document.getElementById('confirmModalCancel');

  titleEl.textContent = title;
  msgEl.textContent   = message;
  iconEl.textContent  = icon;
  okBtn.textContent   = okText;
  okBtn.className     = `btn ${okClass}`;
  modal.classList.add('active');

  const cleanup = () => modal.classList.remove('active');

  const okHandler = () => { cleanup(); onConfirm && onConfirm(); };
  const cancelHandler = () => cleanup();

  // Remove old listeners before adding new ones
  okBtn.replaceWith(okBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  document.getElementById('confirmModalOk').addEventListener('click', okHandler, { once: true });
  document.getElementById('confirmModalCancel').addEventListener('click', cancelHandler, { once: true });
  modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); }, { once: true });
}

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
  // Populate Route Dropdowns
  Object.keys(ROUTE_DATA).forEach(route => {
    const opt1 = document.createElement('option');
    opt1.value = route;
    opt1.textContent = `ด้านจ่ายที่ ${route}${ROUTE_DATA[route].hasCar ? ' (รถยนต์)' : ''}`;
    deliveryRouteSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = route;
    opt2.textContent = `ด้านจ่ายที่ ${route}${ROUTE_DATA[route].hasCar ? ' (รถยนต์)' : ''}`;
    missionRouteSelect.appendChild(opt2);
  });

  // Load Saved Theme
  if (localStorage.getItem('tp_theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }

  // Bind Events
  themeToggleBtn.addEventListener('click', toggleTheme);
  modeFuelBtn.addEventListener('click', () => switchAppMode('fuel'));
  modeWaterBtn.addEventListener('click', () => switchAppMode('water'));
  deliveryRouteSelect.addEventListener('change', handleRouteSelect);
  empPositionSelect.addEventListener('change', handlePositionSelect);
  claimMethodSelect.addEventListener('change', handleClaimMethodSelect);
  employeeForm.addEventListener('submit', handleFormSubmit);
  resetBtn.addEventListener('click', cancelEdit);

  // Tab Events
  tabStandard.addEventListener('click', () => switchFormMode('standard'));
  tabSupervisor.addEventListener('click', () => switchFormMode('supervisor'));

  // Supervisor Mission Events
  addMissionBtn.addEventListener('click', addSupervisorMission);

  // Modal Events
  openAvgCalcBtn.addEventListener('click', () => {
    avgCalcModal.classList.add('active');
    renderPeriodTable();
  });
  closeAvgModalBtn.addEventListener('click', () => avgCalcModal.classList.remove('active'));
  cancelAvgBtn.addEventListener('click', () => avgCalcModal.classList.remove('active'));
  addPeriodBtn.addEventListener('click', addPricePeriod);
  applyAvgPriceBtn.addEventListener('click', applyAvgPriceToGlobal);

  // Table Batch Actions
  loadDemoBtn.addEventListener('click', loadDemoData);
  exportCsvBtn.addEventListener('click', exportToCsv);
  printReportBtn.addEventListener('click', printReport);
  clearAllBtn.addEventListener('click', clearAllData);

  // Saved Templates Events
  saveTemplateBtn.addEventListener('click', saveCurrentListAsTemplate);
  loadTemplateBtn.addEventListener('click', loadSelectedTemplate);
  deleteTemplateBtn.addEventListener('click', deleteSelectedTemplate);
  updateTemplateSelectDropdown();

  // Setup live changes
  globalFuelPriceInput.addEventListener('change', recalculateTableCosts);

  // Populate Route Editor Dropdown
  Object.keys(ROUTE_DATA).forEach(route => {
    const opt = document.createElement('option');
    opt.value = route;
    opt.textContent = `ด้านจ่ายที่ ${route}`;
    editRouteSelect.appendChild(opt);
  });

  // Bind Route Editor Events
  openRouteEditorBtn.addEventListener('click', openRouteEditor);
  closeRouteEditorModalBtn.addEventListener('click', () => routeEditorModal.classList.remove('active'));
  closeRouteEditorBtn.addEventListener('click', () => routeEditorModal.classList.remove('active'));
  editRouteSelect.addEventListener('change', loadSelectedRouteToEditorForm);
  saveSingleRouteBtn.addEventListener('click', saveSingleRouteSettings);
  resetAllRoutesBtn.addEventListener('click', resetRouteDataDefaults);
  
  // Bind Signatory editor events
  toggleSigEditBtn.addEventListener('click', toggleSignatoryInputsLock);
  
  // Bind Signatory Profile Modal Events
  const sigProfilesModal = document.getElementById('sigProfilesModal');
  const openSigProfilesBtn = document.getElementById('openSigProfilesBtn');
  const closeSigProfilesModalBtn = document.getElementById('closeSigProfilesModalBtn');
  const closeSigProfilesBtn = document.getElementById('closeSigProfilesBtn');
  const saveSigProfileBtn = document.getElementById('saveSigProfileBtn');

  openSigProfilesBtn.addEventListener('click', openSigProfiles);
  closeSigProfilesModalBtn.addEventListener('click', () => sigProfilesModal.classList.remove('active'));
  closeSigProfilesBtn.addEventListener('click', () => sigProfilesModal.classList.remove('active'));
  saveSigProfileBtn.addEventListener('click', handleSaveSigProfile);

  wireEditModal();

  // Render Table & Initial Cloud Sync
  renderEmployeeTable();
  initCloudSync();
});

/* --- CLOUD SYNC INITIALIZER --- */
async function initCloudSync() {
  const badge = document.getElementById('dbStatusBadge');
  if (!badge) return;

  try {
    if (isCloudConnected()) {
      badge.className = 'db-status-badge connected';
      badge.querySelector('.status-text').textContent = '🔥 เชื่อมต่อคลาวด์แล้ว';
      
      // Fetch cloud employees (initial load)
      const cloudEmployees = await fetchEmployees();
      if (cloudEmployees && cloudEmployees.length > 0) {
        employees = cloudEmployees;
      }
      
      // Fetch cloud water employees (initial load)
      const cloudWaterEmployees = await fetchWaterEmployees();
      if (cloudWaterEmployees && cloudWaterEmployees.length > 0) {
        waterEmployees = cloudWaterEmployees;
      }
      
      // Fetch cloud route data
      const cloudRouteData = await fetchRouteData();
      if (cloudRouteData) {
        ROUTE_DATA = cloudRouteData;
      }
      
      // Populate templates
      await fetchSavedTemplates();
      
      // Re-populate dropdowns and re-render with cloud data
      updateAllRouteDropdownTexts();
      renderEmployeeTable();
      updateTemplateSelectDropdown();

      // ===== REAL-TIME LISTENERS (cross-device sync) =====
      listenToEmployees((updatedList) => {
        employees = updatedList;
        if (activeMode === 'fuel') renderEmployeeTable();
      });

      listenToWaterEmployees((updatedList) => {
        waterEmployees = updatedList;
        if (activeMode === 'water') renderEmployeeTable();
      });

    } else {
      badge.className = 'db-status-badge offline';
      badge.querySelector('.status-text').textContent = '⚠️ โหมดออฟไลน์';
    }
  } catch (err) {
    console.error("Cloud connection/sync failed:", err);
    badge.className = 'db-status-badge offline';
    badge.querySelector('.status-text').textContent = '⚠️ โหมดออฟไลน์';
  }
}

/* --- THEME TOGGLE --- */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('tp_theme', 'light');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('tp_theme', 'dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

/* --- APP MODE SWITCHER (FUEL vs WATER) --- */
async function switchAppMode(mode) {
  activeMode = mode;
  document.documentElement.setAttribute('data-mode', mode);
  
  const headerBrandTitle = document.getElementById('headerBrandTitle');
  const headerBrandSubtitle = document.getElementById('headerBrandSubtitle');
  const welcomeHeadingH2 = document.querySelector('.welcome-heading h2');
  const welcomeHeadingP = document.querySelector('.welcome-heading p');
  const sumFuelCostLabel = document.querySelector('.metric-card.bg-orange-glow h3');
  const sumMaintCostLabel = document.querySelector('.metric-card.bg-blue-glow h3');
  const sumTotalCostLabel = document.querySelector('.metric-card.bg-emerald-glow h3');
  const tableTitle = document.querySelector('.table-header-flex h3');
  
  if (mode === 'fuel') {
    // Buttons styling
    modeFuelBtn.style.background = 'var(--post-orange)';
    modeFuelBtn.style.color = 'white';
    modeWaterBtn.style.background = 'transparent';
    modeWaterBtn.style.color = 'var(--text-secondary)';
    
    // Header texts
    if (headerBrandSubtitle) headerBrandSubtitle.textContent = 'Thailand Post Fuel Engine v2.5';
    if (welcomeHeadingH2) welcomeHeadingH2.textContent = 'ระบบคำนวณค่าน้ำมัน & ค่าบำรุงรักษาประจำที่ทำการ / ปณ.';
    if (welcomeHeadingP) welcomeHeadingP.textContent = 'คำนวณค่าน้ำมันพนักงาน นำจ่ายแทน และภารกิจตรวจการนำจ่ายของหัวหน้าโซน (ชนจ.) อัตโนมัติในระบบเดียว';
    
    // Form & Tab configs
    document.querySelector('.auth-tabs').style.display = 'flex';
    document.getElementById('positionRouteRow').classList.remove('hidden');
    document.getElementById('deliveryRouteGroup').classList.remove('hidden');
    document.getElementById('claimMethodGroup').classList.remove('hidden');
    document.getElementById('workDaysRow').classList.remove('hidden');
    document.getElementById('daysNotWorkedGroup').classList.remove('hidden');
    salaryGroup.classList.add('hidden');
    // Restore required on route select for fuel mode form validation
    deliveryRouteSelect.setAttribute('required', 'true');
    
    // Reset position dropdown to standard
    empPositionSelect.innerHTML = `
      <option value="พนักงาน">พนักงาน</option>
      <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>
      <option value="ลูกจ้างรายวัน">ลูกจ้างรายวัน</option>
      <option value="ลูกจ้าง">ลูกจ้าง</option>
      <option value="ลูกจ้างเหมา">ลูกจ้างเหมา</option>
    `;
    
    // Metric Card Texts
    if (sumFuelCostLabel) sumFuelCostLabel.textContent = 'ค่าน้ำมันเชื้อเพลิงรวม';
    if (sumMaintCostLabel) sumMaintCostLabel.textContent = 'ค่าบำรุงรักษารวม';
    if (sumTotalCostLabel) sumTotalCostLabel.textContent = 'ยอดเงินเบิกจ่ายรวมสุทธิ';
    
    // Table Configs
    if (tableTitle) tableTitle.textContent = 'รายการพนักงานเบิกจ่ายค่าน้ำมันค้างจ่ายประจำ ปณ.';
    document.querySelector('#employeeTable thead').innerHTML = `
      <tr>
        <th>ลำดับ</th>
        <th>ชื่อ - นามสกุล</th>
        <th>ตำแหน่ง/บทบาท</th>
        <th>รายละเอียด/ด้านจ่าย</th>
        <th>ปริมาณน้ำมัน (ลิตร)</th>
        <th>ค่าน้ำมัน (บาท)</th>
        <th>ค่าบำรุงรักษา (บาท)</th>
        <th>รวมเบิกจ่าย (บาท)</th>
        <th>ลงนามผู้รับ</th>
        <th class="actions-col">จัดการ</th>
      </tr>
    `;
    saveBtn.innerHTML = '📥 บันทึกข้อมูลพนักงาน';
  } else {
    // Water Mode
    modeWaterBtn.style.background = 'var(--post-orange)';
    modeWaterBtn.style.color = 'white';
    modeFuelBtn.style.background = 'transparent';
    modeFuelBtn.style.color = 'var(--text-secondary)';
    
    // Header texts
    if (headerBrandSubtitle) headerBrandSubtitle.textContent = 'Thailand Post Drinking Water Engine v1.0';
    if (welcomeHeadingH2) welcomeHeadingH2.textContent = 'ระบบคำนวณค่าน้ำดื่มเจ้าหน้าที่ปฏิบัติงานภายนอกที่ทำการ';
    if (welcomeHeadingP) welcomeHeadingP.textContent = 'คำนวณค่าน้ำดื่มพร้อมหักภาษี ณ ที่จ่ายตามเกณฑ์เงินเดือน 25,833 บาท ตามระเบียบใหม่ล่าสุด';
    
    // Form & Tab configs - Hide standard fuel inputs & show salary input
    document.querySelector('.auth-tabs').style.display = 'none';
    document.getElementById('positionRouteRow').classList.remove('hidden');
    document.getElementById('deliveryRouteGroup').classList.add('hidden');
    document.getElementById('claimMethodGroup').classList.add('hidden');
    document.getElementById('workDaysRow').classList.remove('hidden');
    document.getElementById('daysNotWorkedGroup').classList.add('hidden');
    supervisorMissionSection.classList.add('hidden');
    routeStatsPreview.classList.add('hidden');
    salaryGroup.classList.remove('hidden');
    // CRITICAL: Remove required from hidden route select so water form can submit
    deliveryRouteSelect.removeAttribute('required');
    
    // Populate position select with specific drinking water claimable roles (Image 2)
    empPositionSelect.innerHTML = `
      <option value="เจ้าหน้าที่นำจ่ายไปรษณีย์/EMS/ด้านจ่ายพิเศษ">เจ้าหน้าที่นำจ่ายไปรษณีย์/EMS/ด้านจ่ายพิเศษ</option>
      <option value="เจ้าหน้าที่ไขตู้ไปรษณีย์">เจ้าหน้าที่ไขตู้ไปรษณีย์</option>
      <option value="หัวหน้าโซนนำจ่าย">หัวหน้าโซนนำจ่าย</option>
      <option value="เจ้าหน้าที่รับฝากนอกที่ทำการ">เจ้าหน้าที่รับฝากนอกที่ทำการ</option>
      <option value="ปณอ.(รับ/จ่าย)/ผู้ช่วยนำจ่าย">ปณอ.(รับ/จ่าย)/ผู้ช่วยนำจ่าย</option>
    `;
    
    // Metric Card Texts
    if (sumFuelCostLabel) sumFuelCostLabel.textContent = 'ค่าน้ำดื่มก่อนหักภาษีรวม';
    if (sumMaintCostLabel) sumMaintCostLabel.textContent = 'ภาษีหัก ณ ที่จ่ายรวม';
    if (sumTotalCostLabel) sumTotalCostLabel.textContent = 'ยอดเงินเบิกจ่ายรวมสุทธิ';
    
    // Table Configs
    if (tableTitle) tableTitle.textContent = 'รายการพนักงานเบิกค่าน้ำดื่มประจำที่ทำการ ปณ.';
    document.querySelector('#employeeTable thead').innerHTML = `
      <tr>
        <th>ลำดับ</th>
        <th>ชื่อ - นามสกุล</th>
        <th>ปฏิบัติหน้าที่</th>
        <th>เงินเดือน (บาท)</th>
        <th>วันทำงาน (วัน)</th>
        <th>รวมค่าน้ำดื่ม (บาท)</th>
        <th>ภาษี (บาท)</th>
        <th>ยอดสุทธิคงเหลือ (บาท)</th>
        <th>ลงนามผู้รับ</th>
        <th class="actions-col">จัดการ</th>
      </tr>
    `;
    saveBtn.innerHTML = '📥 บันทึกข้อมูลค่าน้ำดื่ม';
  }
  
  // Clear any active edits
  cancelEdit();
  // Fetch from DB & render
  if (isCloudConnected()) {
    try {
      if (mode === 'fuel') {
        employees = await fetchEmployees();
      } else {
        waterEmployees = await fetchWaterEmployees();
      }
    } catch (err) {
      console.error("Error loading mode data:", err);
    }
  }
  renderEmployeeTable();
}

/* --- DRINKING WATER TAX CALC ENGINE --- */
function calculateWaterTax(salary, totalAllowance) {
  // @IFS(D5<=25833,0,AND(D5>=25834,D5<=38333),F5*0.05,AND(D5>=38334,D5<=55000),F5*0.1,AND(D5>=55001,D5<=75833),F5*0.15,AND(D5>=75834,D5<=96666),F5*0.2,D5>=96667,F5*0.25)
  if (salary <= 25833) {
    return 0;
  } else if (salary >= 25834 && salary <= 38333) {
    return totalAllowance * 0.05;
  } else if (salary >= 38334 && salary <= 55000) {
    return totalAllowance * 0.10;
  } else if (salary >= 55001 && salary <= 75833) {
    return totalAllowance * 0.15;
  } else if (salary >= 75834 && salary <= 96666) {
    return totalAllowance * 0.20;
  } else if (salary >= 96667) {
    return totalAllowance * 0.25;
  }
  return 0;
}


/* --- TAB / FORM MODE SWITCHING --- */
function switchFormMode(mode, keepEditState = false) {
  formModeInput.value = mode;
  if (!keepEditState) {
    cancelEdit(); // clear outputs
  }
  
  if (mode === 'standard') {
    tabStandard.classList.add('active');
    tabSupervisor.classList.remove('active');
    
    // Show standard employee inputs
    positionRouteRow.classList.remove('hidden');
    deliveryRouteGroup.classList.remove('hidden');
    claimMethodGroup.classList.remove('hidden');
    workDaysRow.classList.remove('hidden');
    
    // Hide supervisor mission builder
    supervisorMissionSection.classList.add('hidden');
    
    // Remove "required" from route select in supervisor mode
    deliveryRouteSelect.setAttribute('required', 'true');
  } else {
    tabStandard.classList.remove('active');
    tabSupervisor.classList.add('active');
    
    // Hide standard elements
    deliveryRouteGroup.classList.add('hidden');
    claimMethodGroup.classList.add('hidden');
    workDaysRow.classList.add('hidden');
    
    // Show supervisor mission builder
    supervisorMissionSection.classList.remove('hidden');
    
    // Adjust forms
    deliveryRouteSelect.removeAttribute('required');
    vehicleTypeSelect.value = 'รถจักรยานยนต์'; // Default for ชนจ. motorcycle checks
    tempMissions = [];
    renderMissionsTable();
  }
}

/* --- SUPERVISOR MISSION BUILDER --- */
function addSupervisorMission() {
  const type = missionTypeSelect.value;
  const route = missionRouteSelect.value;
  const days = parseInt(missionDaysInput.value) || 1;
  const dates = missionDatesInput.value.trim() || `${days} วัน`;

  if (!route) {
    showToast('กรุณาเลือกด้านจ่ายที่จะปฏิบัติภารกิจ!', 'warning');
    return;
  }

  const routeInfo = ROUTE_DATA[route];
  let distance = 0;
  let liters = 0;

  if (type === 'ตรวจสอบการนำจ่าย') {
    // 1/2 of standard daily distance
    distance = (routeInfo.workerDist / 2) * days;
    // Sum workerLiters over days and round up in all cases if there are decimals
    liters = Math.ceil(routeInfo.workerLiters * days);
  } else {
    // Substitute or Training gets full route daily rates
    distance = routeInfo.workerDist * days;
    liters = Number((routeInfo.workerLiters * days).toFixed(2));
  }

  tempMissions.push({
    type,
    route,
    days,
    dates,
    distance,
    liters
  });

  missionDatesInput.value = '';
  renderMissionsTable();
}

function renderMissionsTable() {
  if (tempMissions.length === 0) {
    missionTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data" style="padding: 1rem;">ยังไม่มีการบันทึกภารกิจ</td>
      </tr>
    `;
    return;
  }

  missionTableBody.innerHTML = '';
  tempMissions.forEach((m, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.type}</td>
      <td>ด้าน ${m.route}</td>
      <td>${m.dates} (${m.days} วัน)</td>
      <td>${m.distance.toFixed(1)} กม.</td>
      <td>${m.liters.toFixed(2)} ลิตร</td>
      <td><button type="button" class="row-action-btn delete-mission-btn" style="padding: 0.1rem 0.3rem;">❌</button></td>
    `;
    tr.querySelector('.delete-mission-btn').addEventListener('click', () => {
      tempMissions.splice(idx, 1);
      renderMissionsTable();
    });
    missionTableBody.appendChild(tr);
  });
}

/* --- PREVIEW AND FORM CONTROLS --- */
function handleRouteSelect() {
  const routeVal = deliveryRouteSelect.value;
  if (!routeVal) return;

  const routeInfo = ROUTE_DATA[routeVal];
  
  routeStatsPreview.classList.remove('hidden');
  prevDistDay.textContent = `${routeInfo.workerDist} กม.`;
  prevFuelDay.textContent = `${routeInfo.workerLiters} ลิตร`;
  prevDistMonth.textContent = `${routeInfo.staffDist.toLocaleString()} กม.`;
  prevFuelMonth.textContent = `${routeInfo.staffLiters.toLocaleString()} ลิตร`;

  // Auto-detect vehicle
  if (routeInfo.hasCar) {
    vehicleTypeSelect.value = 'รถยนต์';
  } else {
    vehicleTypeSelect.value = 'รถจักรยานยนต์';
  }
}

function handlePositionSelect() {
  const pos = empPositionSelect.value;
  if (pos === 'พนักงาน' || pos === 'ลูกจ้างประจำ') {
    claimMethodSelect.value = 'monthly';
    daysNotWorkedGroup.classList.remove('hidden');
    workDaysInput.value = 26;
  } else {
    claimMethodSelect.value = 'daily';
    daysNotWorkedGroup.classList.add('hidden');
    daysNotWorkedInput.value = 0;
    workDaysInput.value = 26;
  }
}

function handleClaimMethodSelect() {
  const method = claimMethodSelect.value;
  if (method === 'monthly') {
    daysNotWorkedGroup.classList.remove('hidden');
  } else {
    daysNotWorkedGroup.classList.add('hidden');
    daysNotWorkedInput.value = 0;
  }
}

/* --- MAIN MATH REGULATION ENGINE --- */

/**
 * Calculates Fuel Liters claimed
 */
function calculateClaimLiters(item) {
  if (item.formMode === 'supervisor') {
    let otherLiters = 0;
    let rawInspectionLiters = 0;
    
    item.missions.forEach(m => {
      const routeInfo = ROUTE_DATA[m.route];
      const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
      
      if (m.type === 'ตรวจสอบการนำจ่าย') {
        rawInspectionLiters += dailyLiters * m.days;
      } else {
        otherLiters += dailyLiters * m.days;
      }
    });
    
    const totalLiters = otherLiters + Math.ceil(rawInspectionLiters / 2);
    return Number(totalLiters.toFixed(2));
  }

  const route = ROUTE_DATA[item.route];
  if (!route) return 0;

  const isStaff = item.position === 'พนักงาน' || item.position === 'ลูกจ้างประจำ';
  
  if (item.method === 'monthly') {
    return isStaff ? route.staffLiters : (route.workerLiters * item.workDays);
  } else {
    if (isStaff) {
      return Number(((route.staffLiters / 26) * item.workDays).toFixed(2));
    } else {
      return Number((route.workerLiters * item.workDays).toFixed(2));
    }
  }
}

/**
 * Helper to calculate maintenance cost for a single supervisor mission
 */
function calculateSingleMissionMaint(item, m) {
  const route = ROUTE_DATA[m.route];
  if (!route) return 0;

  const dailyDist = m.type === 'ตรวจสอบการนำจ่าย' ? (route.workerDist / 2) : route.workerDist;
  
  let tier = '';
  if (dailyDist <= 40) tier = '1-40';
  else if (dailyDist <= 70) tier = '41-70';
  else if (dailyDist <= 100) tier = '71-100';
  else tier = '101+';

  if (item.vehicle === 'รถยนต์') {
    return m.distance * 2.25;
  } else if (item.vehicle === 'เรือยนต์') {
    return 48 * m.days;
  } else {
    const rates = {
      'รถจักรยานยนต์': { '1-40': 51, '41-70': 53, '71-100': 55, '101+': 57 },
      'รถจักรยานยนต์ไฟฟ้า': { '1-40': 84, '41-70': 97, '71-100': 110, '101+': 123 }
    };
    const dailyRate = rates[item.vehicle] ? rates[item.vehicle][tier] : 0;
    return dailyRate * m.days;
  }
}

/**
 * Calculates Maintenance Cost based on Post regulations
 */
function calculateMaintenanceCost(item) {
  const isStaff = item.position === 'พนักงาน' || item.position === 'ลูกจ้างประจำ';

  if (item.formMode === 'supervisor') {
    // Supervisor (ชนจ.) Maintenance Fee rules
    let totalMaint = 0;
    let accumulatedMotorcycleDays = 0;
    let maxDailyMotorcycleMaintRate = 51; // baseline standard motorcycle daily maint rate (1-40km tier)

    item.missions.forEach(m => {
      const route = ROUTE_DATA[m.route];
      if (!route) return;

      const dailyDist = m.type === 'ตรวจสอบการนำจ่าย' ? (route.workerDist / 2) : route.workerDist;
      
      // Tier classification for maintenance
      let tier = '';
      if (dailyDist <= 40) tier = '1-40';
      else if (dailyDist <= 70) tier = '41-70';
      else if (dailyDist <= 100) tier = '71-100';
      else tier = '101+';

      if (item.vehicle === 'รถยนต์') {
        // Car: 2.25 Baht/km
        totalMaint += m.distance * 2.25;
      } else if (item.vehicle === 'เรือยนต์') {
        // Boat: 48 Baht/day
        totalMaint += 48 * m.days;
      } else {
        // Motorcycle / Electric Motorcycle (daily rate base)
        const rates = {
          'รถจักรยานยนต์': { '1-40': 51, '41-70': 53, '71-100': 55, '101+': 57 },
          'รถจักรยานยนต์ไฟฟ้า': { '1-40': 84, '41-70': 97, '71-100': 110, '101+': 123 }
        };
        const dailyRate = rates[item.vehicle] ? rates[item.vehicle][tier] : 0;
        totalMaint += dailyRate * m.days;
      }
    });

    return Number(totalMaint.toFixed(2));
  }

  const route = ROUTE_DATA[item.route];
  if (!route) return 0;

  const dailyDist = route.workerDist;
  const monthlyDist = route.staffDist;

  if (item.vehicle === 'รถยนต์') {
    return isStaff ? (monthlyDist * 2.25) : (dailyDist * item.workDays * 2.25);
  }

  if (item.vehicle === 'เรือยนต์') {
    return isStaff ? Math.max(0, 1090 - (item.daysNotWorked * 36)) : (48 * item.workDays);
  }

  // Motorcycle / Electric Motorcycle
  let tier = '';
  if (dailyDist <= 40) tier = '1-40';
  else if (dailyDist <= 70) tier = '41-70';
  else if (dailyDist <= 100) tier = '71-100';
  else tier = '101+';

  if (isStaff) {
    const rates = {
      'รถจักรยานยนต์': { '1-40': { base: 1155, dec: 38 }, '41-70': { base: 1210, dec: 40 }, '71-100': { base: 1265, dec: 42 }, '101+': { base: 1320, dec: 44 } },
      'รถจักรยานยนต์ไฟฟ้า': { '1-40': { base: 2500, dec: 84 }, '41-70': { base: 2900, dec: 97 }, '71-100': { base: 3300, dec: 110 }, '101+': { base: 3700, dec: 123 } }
    };
    const rule = rates[item.vehicle] ? rates[item.vehicle][tier] : { base: 0, dec: 0 };
    return Math.max(0, rule.base - (item.daysNotWorked * rule.dec));
  } else {
    const rates = {
      'รถจักรยานยนต์': { '1-40': 51, '41-70': 53, '71-100': 55, '101+': 57 },
      'รถจักรยานยนต์ไฟฟ้า': { '1-40': 84, '41-70': 97, '71-100': 110, '101+': 123 }
    };
    const dailyRate = rates[item.vehicle] ? rates[item.vehicle][tier] : 0;
    return dailyRate * item.workDays;
  }
}

function openEditModal(isWaterMode, idx) {
  const modal = document.getElementById('editEmployeeModal');
  const modalTitle = modal.querySelector('h3');
  const modalEmpName = document.getElementById('modalEmpName');
  const modalEmpPosition = document.getElementById('modalEmpPosition');
  const modalWorkDays = document.getElementById('modalWorkDays');
  const modalRemarks = document.getElementById('modalRemarks');
  const modalSignature = document.getElementById('modalSignature');
  const modalEditIndex = document.getElementById('modalEditIndex');
  const modalFuelFields = document.getElementById('modalFuelFields');
  const modalWaterFields = document.getElementById('modalWaterFields');
  const modalDeliveryRoute = document.getElementById('modalDeliveryRoute');
  const modalVehicleType = document.getElementById('modalVehicleType');
  const modalClaimMethod = document.getElementById('modalClaimMethod');
  const modalDaysNotWorked = document.getElementById('modalDaysNotWorked');
  const modalDaysNotWorkedGroup = document.getElementById('modalDaysNotWorkedGroup');
  const modalEmpSalary = document.getElementById('modalEmpSalary');

  modalEditIndex.value = idx;
  modal.dataset.isWater = isWaterMode ? '1' : '0';

  // Populate position dropdown
  if (isWaterMode) {
    modalTitle.textContent = '✏️ แก้ไขข้อมูลค่าน้ำดื่ม';
    modalFuelFields.classList.add('hidden');
    modalWaterFields.classList.remove('hidden');
    modalEmpPosition.innerHTML = `
      <option value="เจ้าหน้าที่นำจ่ายไปรษณีย์/EMS/ด้านจ่ายพิเศษ">เจ้าหน้าที่นำจ่ายไปรษณีย์/EMS/ด้านจ่ายพิเศษ</option>
      <option value="เจ้าหน้าที่ไขตู้ไปรษณีย์">เจ้าหน้าที่ไขตู้ไปรษณีย์</option>
      <option value="หัวหน้าโซนนำจ่าย">หัวหน้าโซนนำจ่าย</option>
      <option value="เจ้าหน้าที่รับฝากนอกที่ทำการ">เจ้าหน้าที่รับฝากนอกที่ทำการ</option>
      <option value="ปณอ.(รับ/จ่าย)/ผู้ช่วยนำจ่าย">ปณอ.(รับ/จ่าย)/ผู้ช่วยนำจ่าย</option>
    `;
    const item = waterEmployees[idx];
    modalEmpName.value = item.name;
    modalEmpPosition.value = item.position;
    modalEmpSalary.value = item.salary;
    modalWorkDays.value = item.workDays;
    modalRemarks.value = item.remarks || '';
    modalSignature.value = item.signature || '';
  } else {
    modalTitle.textContent = '✏️ แก้ไขข้อมูลพนักงาน';
    modalFuelFields.classList.remove('hidden');
    modalWaterFields.classList.add('hidden');
    modalEmpPosition.innerHTML = `
      <option value="พนักงาน">พนักงาน</option>
      <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>
      <option value="ลูกจ้างรายวัน">ลูกจ้างรายวัน</option>
      <option value="ลูกจ้าง">ลูกจ้าง</option>
      <option value="ลูกจ้างเหมา">ลูกจ้างเหมา</option>
    `;

    // Populate route dropdown from current ROUTE_DATA
    modalDeliveryRoute.innerHTML = '<option value="" disabled>-- เลือกด้านจ่าย --</option>';
    Object.keys(ROUTE_DATA).forEach(route => {
      const opt = document.createElement('option');
      opt.value = route;
      opt.textContent = `ด้านจ่ายที่ ${route}${ROUTE_DATA[route].hasCar ? ' (รถยนต์)' : ''}`;
      modalDeliveryRoute.appendChild(opt);
    });

    const item = employees[idx];
    modalEmpName.value = item.name;
    modalEmpPosition.value = item.position;
    modalDeliveryRoute.value = item.route || '';
    modalVehicleType.value = item.vehicle || 'รถจักรยานยนต์';
    modalClaimMethod.value = item.method || 'monthly';
    modalDaysNotWorked.value = item.daysNotWorked || 0;
    if (item.method === 'monthly') {
      modalDaysNotWorkedGroup.classList.remove('hidden');
    } else {
      modalDaysNotWorkedGroup.classList.add('hidden');
    }
    modalWorkDays.value = item.workDays;
    modalRemarks.value = item.remarks || '';
    modalSignature.value = item.signature || '';
  }

  // Show modal
  modal.classList.add('active');
}

function wireEditModal() {
  const modal = document.getElementById('editEmployeeModal');
  const form = document.getElementById('editEmployeeForm');
  const closeBtn = document.getElementById('closeEditModalBtn');
  const cancelBtn = document.getElementById('cancelEditModalBtn');
  const modalClaimMethod = document.getElementById('modalClaimMethod');
  const modalDaysNotWorkedGroup = document.getElementById('modalDaysNotWorkedGroup');

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  modalClaimMethod.addEventListener('change', () => {
    if (modalClaimMethod.value === 'monthly') {
      modalDaysNotWorkedGroup.classList.remove('hidden');
    } else {
      modalDaysNotWorkedGroup.classList.add('hidden');
      document.getElementById('modalDaysNotWorked').value = 0;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isWater = modal.dataset.isWater === '1';
    // Snapshot the index at submit time (guard against real-time listener race condition)
    const idx = parseInt(document.getElementById('modalEditIndex').value);

    const name = document.getElementById('modalEmpName').value.trim();
    const position = document.getElementById('modalEmpPosition').value;
    const workDays = parseInt(document.getElementById('modalWorkDays').value) || 0;
    const remarks = document.getElementById('modalRemarks').value.trim();
    const signature = document.getElementById('modalSignature').value.trim() || name;

    if (isWater) {
      const salary = parseFloat(document.getElementById('modalEmpSalary').value) || 0;
      // Preserve id: read BEFORE overwriting object
      const existingId = waterEmployees[idx]?.id;
      const updatedItem = { name, position, salary, workDays, remarks, signature };
      if (existingId) updatedItem.id = existingId;
      waterEmployees[idx] = updatedItem;
      await saveWaterEmployees(waterEmployees);
    } else {
      const route = document.getElementById('modalDeliveryRoute').value;
      const vehicle = document.getElementById('modalVehicleType').value;
      const method = document.getElementById('modalClaimMethod').value;
      const daysNotWorked = parseInt(document.getElementById('modalDaysNotWorked').value) || 0;
      // Preserve id and existing fields (e.g. missions for supervisor)
      const existingId = employees[idx]?.id;
      employees[idx] = { ...employees[idx], name, position, route, vehicle, method, workDays, daysNotWorked, remarks, signature };
      if (existingId) employees[idx].id = existingId;
      await saveEmployees(employees);
    }

    modal.classList.remove('active');
    renderEmployeeTable();
  });
}

/* --- FORM SUBMISSION --- */
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('empName').value.trim();
  const formMode = formModeInput.value;
  const remarks = document.getElementById('remarks').value.trim();
  const signatureInput = document.getElementById('signature').value.trim();
  const signature = signatureInput || name;
  const editIndexVal = document.getElementById('editIndex').value;

  let item = {};

  if (activeMode === 'water') {
    const position = empPositionSelect.value;
    const salary = parseFloat(empSalaryInput.value) || 0;
    const workDays = parseInt(workDaysInput.value) || 0;

    item = {
      name,
      position,
      salary,
      workDays,
      remarks,
      signature
    };

    if (editIndexVal !== '') {
      // Preserve existing id before overwriting
      const existingId = waterEmployees[parseInt(editIndexVal)]?.id;
      if (existingId) item.id = existingId;
      waterEmployees[parseInt(editIndexVal)] = item;
      document.getElementById('editIndex').value = '';
      saveBtn.innerHTML = '📥 บันทึกข้อมูลค่าน้ำดื่ม';
      resetBtn.classList.add('hidden');
      const formTitle = document.getElementById('formTitle');
      if (formTitle) formTitle.textContent = 'กรอกข้อมูลผู้รับค่าน้ำดื่ม';
    } else {
      waterEmployees.push(item);
    }

    await saveWaterEmployees(waterEmployees);
    employeeForm.reset();
    renderEmployeeTable();
    showToast(
      editIndexVal !== '' ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มรายชื่อสำเร็จ!',
      'success'
    );
    return;
  }

  const vehicle = vehicleTypeSelect.value;

  if (formMode === 'supervisor') {
    if (tempMissions.length === 0) {
      showToast('กรุณากรอกและบันทึกภารกิจอย่างน้อย 1 ภารกิจสำหรับ ชนจ.!', 'warning');
      return;
    }
    // Calculate total days
    let totalDays = 0;
    tempMissions.forEach(m => totalDays += m.days);

    item = {
      formMode,
      name,
      position: 'หัวหน้าโซนนำจ่าย (ชนจ.)',
      vehicle,
      missions: [...tempMissions],
      workDays: totalDays,
      remarks,
      signature
    };
  } else {
    // Standard Mode
    const position = empPositionSelect.value;
    const route = deliveryRouteSelect.value;
    const method = claimMethodSelect.value;
    const workDays = parseInt(workDaysInput.value) || 0;
    const daysNotWorked = parseInt(daysNotWorkedInput.value) || 0;

    item = {
      formMode,
      name,
      position,
      route,
      vehicle,
      method,
      workDays,
      daysNotWorked,
      remarks,
      signature
    };
  }

  if (editIndexVal !== '') {
    employees[parseInt(editIndexVal)] = item;
    document.getElementById('editIndex').value = '';
    saveBtn.innerHTML = '📥 บันทึกข้อมูลพนักงาน';
    resetBtn.classList.add('hidden');
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'กรอกข้อมูลผู้รับเงินค่าน้ำมัน';
  } else {
    employees.push(item);
  }

  // Save state
  const isEdit = editIndexVal !== '';
  saveEmployees(employees);
  employeeForm.reset();
  routeStatsPreview.classList.add('hidden');
  tempMissions = [];
  
  if (formMode === 'supervisor') {
    renderMissionsTable();
  }
  
  renderEmployeeTable();
  showToast(isEdit ? 'อัปเดตข้อมูลสำเร็จ!' : 'บันทึกข้อมูลสำเร็จ!', 'success');
}

function editWaterEmployee(idx) {
  openEditModal(true, idx);
}

function deleteWaterEmployee(idx) {
  showConfirm({
    title: 'ยืนยันการลบ',
    message: 'คุณแน่ใจว่าต้องการลบรายชื่อนี้ใช่หรือไม่? ผลลัพธ์นี้ไม่สามารถย้อนคืนได้',
    icon: '🗑️',
    okText: 'ลบรายชื่อ',
    onConfirm: () => {
      waterEmployees.splice(idx, 1);
      saveWaterEmployees(waterEmployees);
      renderEmployeeTable();
      showToast('ลบรายชื่อเรียบร้อยแล้ว!', 'success');
    }
  });
}

function renderEmployeeTable() {
  const currentFuelPrice = parseFloat(globalFuelPriceInput.value) || 38.50;

  if (activeMode === 'water') {
    if (waterEmployees.length === 0) {
      employeeTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="no-data">ยังไม่มีข้อมูลในตาราง กรุณากรอกข้อมูลด้านซ้าย หรือคลิก "โหลดข้อมูลตัวอย่าง"</td>
        </tr>
      `;
      sumFuelCostSpan.textContent = '0.00';
      sumMaintenanceCostSpan.textContent = '0.00';
      sumTotalCostSpan.textContent = '0.00';
      return;
    }

    employeeTableBody.innerHTML = '';
    let totalAllowance = 0;
    let totalTaxVal = 0;
    let totalNetVal = 0;

    waterEmployees.forEach((item, parentIndex) => {
      const allowance = item.workDays * 30;
      const tax = calculateWaterTax(item.salary, allowance);
      const net = allowance - tax;

      totalAllowance += allowance;
      totalTaxVal += tax;
      totalNetVal += net;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${parentIndex + 1}</td>
        <td style="font-weight: 700; color: var(--text-primary);">${item.name}</td>
        <td><span style="background: rgba(14, 165, 233, 0.1); color: var(--post-orange); padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">${item.position}</span></td>
        <td>${item.salary.toLocaleString()} บาท</td>
        <td style="text-align: center;">${item.workDays} วัน</td>
        <td style="font-weight: 700;">${allowance.toFixed(2)} บาท</td>
        <td style="color: ${tax > 0 ? 'var(--post-red)' : 'var(--text-secondary)'}; font-weight: ${tax > 0 ? '700' : '400'};">${tax.toFixed(2)} บาท</td>
        <td style="font-weight: 800; color: var(--post-emerald);">${net.toFixed(2)} บาท</td>
        <td style="font-style: italic; color: var(--text-primary);">${item.signature}</td>
        <td class="actions-col">
          <button class="row-action-btn edit-btn" title="แก้ไข">✏️</button>
          <button class="row-action-btn delete-btn" title="ลบ">🗑️</button>
        </td>
      `;

      tr.querySelector('.edit-btn').addEventListener('click', () => editWaterEmployee(parentIndex));
      tr.querySelector('.delete-btn').addEventListener('click', () => deleteWaterEmployee(parentIndex));

      employeeTableBody.appendChild(tr);
    });

    sumFuelCostSpan.textContent = totalAllowance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    sumMaintenanceCostSpan.textContent = totalTaxVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    sumTotalCostSpan.textContent = totalNetVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return;
  }

  if (employees.length === 0) {
    employeeTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="no-data">ยังไม่มีข้อมูลในตาราง กรุณากรอกข้อมูลด้านซ้าย หรือคลิก "โหลดข้อมูลตัวอย่าง"</td>
      </tr>
    `;
    sumFuelCostSpan.textContent = '0.00';
    sumMaintenanceCostSpan.textContent = '0.00';
    sumTotalCostSpan.textContent = '0.00';
    return;
  }

  employeeTableBody.innerHTML = '';
  let totalFuelCost = 0;
  let totalMaintCost = 0;
  let grandTotal = 0;

  // Flatten the employees and their supervisor missions into separate rows
  let flatRows = [];
  employees.forEach((item, parentIndex) => {
    if (item.formMode !== 'supervisor') {
      const liters = calculateClaimLiters(item);
      const fuelCost = liters * currentFuelPrice;
      const maintCost = calculateMaintenanceCost(item);
      const sumTotal = fuelCost + maintCost;

      flatRows.push({
        parentIndex,
        item,
        name: item.name,
        position: item.position,
        routeDescHtml: `ด้านจ่ายที่ ${item.route}`,
        routeDescPlain: `ด้านจ่ายที่ ${item.route}`,
        workDays: item.workDays,
        liters: liters,
        fuelCost: fuelCost,
        maintCost: maintCost,
        sumTotal: sumTotal,
        signature: item.signature,
        remarks: item.remarks
      });
    } else {
      // 1. Group 'ตรวจสอบการนำจ่าย' into a single row
      const inspectMissions = item.missions.filter(m => m.type === 'ตรวจสอบการนำจ่าย');
      if (inspectMissions.length > 0) {
        let rawInspectionLiters = 0;
        let inspectDays = 0;
        let inspectMaint = 0;

        inspectMissions.forEach(m => {
          const routeInfo = ROUTE_DATA[m.route];
          const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
          rawInspectionLiters += dailyLiters * m.days;
          inspectDays += m.days;
          inspectMaint += calculateSingleMissionMaint(item, m);
        });

        const liters = Math.ceil(rawInspectionLiters / 2);
        const fuelCost = liters * currentFuelPrice;
        const sumTotal = fuelCost + inspectMaint;

        flatRows.push({
          parentIndex,
          item,
          name: item.name,
          position: item.position,
          routeDescHtml: `ตรวจสอบการนำจ่าย`,
          routeDescPlain: `ตรวจสอบการนำจ่าย`,
          workDays: inspectDays,
          liters: liters,
          fuelCost: fuelCost,
          maintCost: inspectMaint,
          sumTotal: sumTotal,
          signature: item.signature,
          remarks: item.remarks
        });
      }

      // 2. Individual other missions ('นำจ่ายแทน', 'ฝึกสอนงาน') get their own rows
      const otherMissions = item.missions.filter(m => m.type !== 'ตรวจสอบการนำจ่าย');
      otherMissions.forEach(m => {
        const routeInfo = ROUTE_DATA[m.route];
        const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
        const liters = dailyLiters * m.days;
        const fuelCost = liters * currentFuelPrice;
        const maint = calculateSingleMissionMaint(item, m);
        const sumTotal = fuelCost + maint;

        flatRows.push({
          parentIndex,
          item,
          name: item.name,
          position: item.position,
          routeDescHtml: `${m.type} (ด้าน ${m.route})`,
          routeDescPlain: `${m.type} (ด้าน ${m.route})`,
          workDays: m.days,
          liters: liters,
          fuelCost: fuelCost,
          maintCost: maint,
          sumTotal: sumTotal,
          signature: item.signature,
          remarks: item.remarks
        });
      });
    }
  });

  // Render the flattened rows
  flatRows.forEach((row, index) => {
    totalFuelCost += row.fuelCost;
    totalMaintCost += row.maintCost;
    grandTotal += row.sumTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${row.name}</strong></td>
      <td><span class="badge position-${row.position.replace(/[\s\(\)\.]/g, '')}">${row.position}</span></td>
      <td style="font-size: 0.85rem; max-width: 220px; white-space: normal; word-break: break-word; line-height: 1.3;" title="${row.routeDescPlain}">${row.routeDescHtml}</td>
      <td>${row.liters.toLocaleString(undefined, { minimumFractionDigits: 2 })} ลิตร</td>
      <td>${row.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
      <td>${row.maintCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</td>
      <td><strong style="color: var(--text-primary);">${row.sumTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿</strong></td>
      <td><span style="font-family: var(--font-title); font-size: 0.85rem; font-style: italic;">${row.signature}</span></td>
      <td class="actions-col" style="width: 240px; white-space: nowrap;">
        <button class="btn btn-secondary btn-small edit-row-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">✏️ แก้ไข</button>
        <button class="btn btn-secondary btn-small clone-row-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-left: 0.2rem;">📋 คัดลอก</button>
        <button class="btn btn-danger btn-small delete-row-btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-left: 0.2rem;">🗑️ ลบ</button>
      </td>
    `;

    tr.querySelector('.edit-row-btn').addEventListener('click', () => openEditModal(false, row.parentIndex));
    tr.querySelector('.clone-row-btn').addEventListener('click', () => cloneRow(row.parentIndex));
    tr.querySelector('.delete-row-btn').addEventListener('click', () => deleteRow(row.parentIndex));

    employeeTableBody.appendChild(tr);
  });

  sumFuelCostSpan.textContent = totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 });
  sumMaintenanceCostSpan.textContent = totalMaintCost.toLocaleString(undefined, { minimumFractionDigits: 2 });
  sumTotalCostSpan.textContent = grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function recalculateTableCosts() {
  renderEmployeeTable();
}

function loadRowToForm(index) {
  const item = employees[index];
  
  // Switch tab depending on mode without clearing index
  switchFormMode(item.formMode || 'standard', true);

  document.getElementById('empName').value = item.name;
  vehicleTypeSelect.value = item.vehicle;
  document.getElementById('remarks').value = item.remarks;
  document.getElementById('signature').value = item.signature;
  document.getElementById('editIndex').value = index;

  saveBtn.innerHTML = '✔️ อัปเดตข้อมูลพนักงาน';
  resetBtn.classList.remove('hidden');
  const formTitle = document.getElementById('formTitle');
  if (formTitle) formTitle.textContent = 'แก้ไขข้อมูลพนักงาน ลำดับที่ ' + (index + 1);

  if (item.formMode === 'supervisor') {
    tempMissions = [...item.missions];
    renderMissionsTable();
  } else {
    empPositionSelect.value = item.position;
    deliveryRouteSelect.value = item.route;
    claimMethodSelect.value = item.method;
    workDaysInput.value = item.workDays;
    daysNotWorkedInput.value = item.daysNotWorked;
    
    handleRouteSelect();
    handleClaimMethodSelect();
  }
}

function cloneRow(index) {
  const cloned = JSON.parse(JSON.stringify(employees[index]));
  cloned.name = cloned.name + ' (สำเนา)';
  employees.push(cloned);
  saveEmployees(employees);
  renderEmployeeTable();
}

function deleteRow(index) {
  showConfirm({
    title: 'ยืนยันการลบ',
    message: 'คุณต้องการลบรายชื่อพนักงานนี้ใช่หรือไม่? ผลลัพธ์นี้ไม่สามารถย้อนคืนได้',
    icon: '🗑️',
    okText: 'ลบพนักงาน',
    onConfirm: () => {
      employees.splice(index, 1);
      saveEmployees(employees);
      renderEmployeeTable();
      showToast('ลบรายชื่อเรียบร้อยแล้ว!', 'success');
    }
  });
}

function cancelEdit() {
  document.getElementById('editIndex').value = '';
  // Mode-aware button text
  if (activeMode === 'water') {
    saveBtn.innerHTML = '📥 บันทึกข้อมูลค่าน้ำดื่ม';
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'กรอกข้อมูลผู้รับค่าน้ำดื่ม';
  } else {
    saveBtn.innerHTML = '📥 บันทึกข้อมูลพนักงาน';
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'กรอกข้อมูลผู้รับเงินค่าน้ำมัน';
  }
  resetBtn.classList.add('hidden');
  employeeForm.reset();
  routeStatsPreview.classList.add('hidden');
  tempMissions = [];
  if (formModeInput.value === 'supervisor') {
    renderMissionsTable();
  }
}

function clearAllData() {
  if (activeMode === 'water') {
    showConfirm({
      title: 'ล้างข้อมูลค่าน้ำดื่มทั้งหมด',
      message: 'คุณต้องการลบข้อมูลการเบิกค่าน้ำดื่มทั้งหมดใช่หรือไม่? ผลลัพธ์นี้ไม่สามารถย้อนคืนได้',
      icon: '⚠️',
      okText: 'ล้างข้อมูล',
      onConfirm: () => {
        waterEmployees = [];
        saveWaterEmployees([]);
        cancelEdit();
        renderEmployeeTable();
        showToast('ล้างข้อมูลค่าน้ำดื่มเรียบร้อยแล้ว', 'success');
      }
    });
    return;
  }
  showConfirm({
    title: 'ล้างข้อมูลค่าน้ำมันทั้งหมด',
    message: 'คุณต้องการลบข้อมูลพนักงานทั้งหมดในตารางใช่หรือไม่? ผลลัพธ์นี้ไม่สามารถย้อนคืนได้',
    icon: '⚠️',
    okText: 'ล้างข้อมูล',
    onConfirm: () => {
      employees = [];
      saveEmployees([]);
      cancelEdit();
      renderEmployeeTable();
      showToast('ล้างข้อมูลเรียบร้อยแล้ว', 'success');
    }
  });
}

/* --- WEIGHTED AVERAGE CALCULATOR (MODAL LOGIC) --- */
function renderPeriodTable() {
  if (oilPricePeriods.length === 0) {
    periodTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="no-data">ยังไม่มีการเพิ่มช่วงราคา</td>
      </tr>
    `;
    avgCalcTotalDays.textContent = '0 วัน';
    avgCalcTotalSum.textContent = '0.00 บาท';
    avgCalcResultPrice.textContent = '0.00 บาท/ลิตร';
    applyAvgPriceBtn.disabled = true;
    return;
  }

  periodTableBody.innerHTML = '';
  let sumDays = 0;
  let sumWeightedProduct = 0;

  oilPricePeriods.forEach((period, idx) => {
    const product = period.price * period.days;
    sumDays += period.days;
    sumWeightedProduct += product;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${period.price.toFixed(2)} บาท</strong></td>
      <td>${period.days} วัน</td>
      <td>${product.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</td>
      <td><button type="button" class="row-action-btn delete-period-btn">❌</button></td>
    `;
    
    tr.querySelector('.delete-period-btn').addEventListener('click', () => {
      oilPricePeriods.splice(idx, 1);
      renderPeriodTable();
    });

    periodTableBody.appendChild(tr);
  });

  const avgPrice = sumWeightedProduct / sumDays;

  avgCalcTotalDays.textContent = `${sumDays} วัน`;
  avgCalcTotalSum.textContent = `${sumWeightedProduct.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท`;
  avgCalcResultPrice.textContent = `${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท/ลิตร`;
  applyAvgPriceBtn.disabled = sumDays === 0;
}

function addPricePeriod() {
  const price = parseFloat(priceInput.value);
  const days = parseInt(daysInput.value);

  if (isNaN(price) || isNaN(days) || price <= 0 || days <= 0) {
    showToast('กรุณากรอกราคาน้ำมันและจำนวนวันให้ถูกต้อง!', 'warning');
    return;
  }

  oilPricePeriods.push({ price, days });
  priceInput.value = '';
  daysInput.value = '';
  renderPeriodTable();
}

function applyAvgPriceToGlobal() {
  let sumDays = 0;
  let sumWeightedProduct = 0;

  oilPricePeriods.forEach(p => {
    sumDays += p.days;
    sumWeightedProduct += p.price * p.days;
  });

  if (sumDays > 0) {
    const finalAvg = sumWeightedProduct / sumDays;
    globalFuelPriceInput.value = finalAvg.toFixed(2);
    recalculateTableCosts();
    avgCalcModal.classList.remove('active');
  }
}

/* --- DEMO DATA LOADER --- */
/* --- DEMO DATA LOADER --- */
function loadDemoData() {
  if (activeMode === 'water') {
    const waterDemoList = [
      { name: "นายนิพล ทรัพย์หมื่นแสน", position: "เจ้าหน้าที่นำจ่ายไปรษณีย์/EMS/ด้านจ่ายพิเศษ", salary: 24500, workDays: 26, remarks: "นำจ่ายพัสดุ", signature: "นิพล ทรัพย์หมื่นแสน" },
      { name: "นางสาวสมหญิง สุจริต", position: "เจ้าหน้าที่ไขตู้ไปรษณีย์", salary: 28500, workDays: 26, remarks: "ไขตู้นอกพื้นที่", signature: "สมหญิง สุจริต" },
      { name: "นายปรีชา คุมงาน", position: "หัวหน้าโซนนำจ่าย", salary: 42000, workDays: 26, remarks: "หัวหน้าโซน 2", signature: "ปรีชา คุมงาน" },
      { name: "นายรุ่งโรจน์ สัญจร", position: "เจ้าหน้าที่รับฝากนอกที่ทำการ", salary: 58000, workDays: 24, remarks: "ฝากเคาน์เตอร์เคลื่อนที่", signature: "รุ่งโรจน์ สัญจร" }
    ];
    waterEmployees = waterDemoList;
    saveWaterEmployees(waterEmployees);
    renderEmployeeTable();
    return;
  }

  const demoList = [
    {
      formMode: "standard",
      name: "นายนิพล ทรัพย์หมื่นแสน",
      position: "พนักงาน",
      route: "20",
      vehicle: "รถจักรยานยนต์",
      method: "monthly",
      workDays: 26,
      daysNotWorked: 0,
      remarks: "หัวหน้าทำการ",
      signature: "นิพล ทรัพย์หมื่นแสน"
    },
    {
      formMode: "standard",
      name: "นางสาวสมหญิง สุจริต",
      position: "ลูกจ้างประจำ",
      route: "21",
      vehicle: "รถจักรยานยนต์ไฟฟ้า",
      method: "monthly",
      workDays: 26,
      daysNotWorked: 2,
      remarks: "Yamaha E-moto",
      signature: "สมหญิง สุจริต"
    },
    {
      formMode: "supervisor",
      name: "นายปรีชา คุมงาน",
      position: "หัวหน้าโซนนำจ่าย (ชนจ.)",
      vehicle: "รถจักรยานยนต์",
      missions: [
        {
          type: "ตรวจสอบการนำจ่าย",
          route: "20",
          days: 5,
          dates: "1, 8, 17, 23, 29",
          distance: 170.0, // 34km * 5
          liters: 8.5 // 170 / 20
        },
        {
          type: "นำจ่ายแทน",
          route: "21",
          days: 2,
          dates: "12, 19",
          distance: 136.0, // 68km * 2
          liters: 5.44 // 2.72 * 2
        }
      ],
      workDays: 7,
      remarks: "ตรวจโซน 1",
      signature: "ปรีชา คุมงาน"
    },
    {
      formMode: "standard",
      name: "นายรุ่งโรจน์ สัญจร",
      position: "ลูกจ้างรายวัน",
      route: "22",
      vehicle: "รถยนต์",
      method: "daily",
      workDays: 24,
      remarks: "เก๋ง โตโยต้า",
      signature: "รุ่งโรจน์ สัญจร"
    }
  ];

  employees = demoList;
  saveEmployees(employees);

  oilPricePeriods = [
    { price: 30.18, days: 9 },
    { price: 30.68, days: 8 },
    { price: 31.68, days: 3 },
    { price: 32.68, days: 3 },
    { price: 34.68, days: 2 },
    { price: 40.68, days: 5 }
  ];

  applyAvgPriceToGlobal();
}

/* --- EXPORT CSV (EXCEL FRIENDLY) --- */
function exportToCsv() {
  if (activeMode === 'water') {
    if (waterEmployees.length === 0) {
      showToast('ไม่มีข้อมูลที่จะส่งออก!', 'warning');
      return;
    }
    let csvContent = "\uFEFF";
    csvContent += "ลำดับ,ชื่อ-นามสกุล,ปฏิบัติหน้าที่,เงินเดือน (บาท),จำนวนวันทำงาน,รวมค่าน้ำดื่ม (บาท),ภาษีหัก ณ ที่จ่าย (บาท),ยอดเงินจ่ายสุทธิ (บาท),ลายมือชื่อผู้รับเงิน,หมายเหตุ\n";
    
    waterEmployees.forEach((item, index) => {
      const allowance = item.workDays * 30;
      const tax = calculateWaterTax(item.salary, allowance);
      const net = allowance - tax;
      csvContent += `${index + 1},"${item.name}","${item.position}",${item.salary},${item.workDays},${allowance.toFixed(2)},${tax.toFixed(2)},${net.toFixed(2)},"${item.signature}","${item.remarks}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const m = globalMonthSelect.options[globalMonthSelect.selectedIndex].text;
    const y = globalYearSelect.value;
    link.setAttribute("download", `เบิกค่าน้ำดื่ม_${m}_${y}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  if (employees.length === 0) {
    showToast('ไม่มีข้อมูลที่จะส่งออก!', 'warning');
    return;
  }

  const currentFuelPrice = parseFloat(globalFuelPriceInput.value) || 38.50;
  let csvContent = "\uFEFF";
  
  csvContent += "ลำดับ,ชื่อ-นามสกุล,ตำแหน่ง/บทบาท,รายละเอียดด้านจ่าย/ภารกิจ,วันทำงาน,ปริมาณน้ำมัน (ลิตร),ค่าน้ำมัน (บาท),ค่าบำรุงรักษา (บาท),รวมเบิกจ่าย (บาท),ลายมือชื่อผู้รับเงิน,หมายเหตุ\n";
  
  let flatRows = [];
  employees.forEach((item, parentIndex) => {
    if (item.formMode !== 'supervisor') {
      const liters = calculateClaimLiters(item);
      const fuelCost = liters * currentFuelPrice;
      const maintCost = calculateMaintenanceCost(item);
      const sumTotal = fuelCost + maintCost;

      flatRows.push({
        name: item.name,
        position: item.position,
        routeDesc: `ด้านจ่ายที่ ${item.route}`,
        workDays: item.workDays,
        liters: liters,
        fuelCost: fuelCost,
        maintCost: maintCost,
        sumTotal: sumTotal,
        signature: item.signature,
        remarks: item.remarks
      });
    } else {
      // 1. Group 'ตรวจสอบการนำจ่าย'
      const inspectMissions = item.missions.filter(m => m.type === 'ตรวจสอบการนำจ่าย');
      if (inspectMissions.length > 0) {
        let rawInspectionLiters = 0;
        let inspectDays = 0;
        let inspectMaint = 0;

        inspectMissions.forEach(m => {
          const routeInfo = ROUTE_DATA[m.route];
          const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
          rawInspectionLiters += dailyLiters * m.days;
          inspectDays += m.days;
          inspectMaint += calculateSingleMissionMaint(item, m);
        });

        const liters = Math.ceil(rawInspectionLiters / 2);
        const fuelCost = liters * currentFuelPrice;
        const sumTotal = fuelCost + inspectMaint;

        flatRows.push({
          name: item.name,
          position: item.position,
          routeDesc: `ตรวจสอบการนำจ่าย`,
          workDays: inspectDays,
          liters: liters,
          fuelCost: fuelCost,
          maintCost: inspectMaint,
          sumTotal: sumTotal,
          signature: item.signature,
          remarks: item.remarks
        });
      }

      // 2. Individual other missions ('นำจ่ายแทน', 'ฝึกสอนงาน') get their own rows
      const otherMissions = item.missions.filter(m => m.type !== 'ตรวจสอบการนำจ่าย');
      otherMissions.forEach(m => {
        const routeInfo = ROUTE_DATA[m.route];
        const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
        const liters = dailyLiters * m.days;
        const fuelCost = liters * currentFuelPrice;
        const maint = calculateSingleMissionMaint(item, m);
        const sumTotal = fuelCost + maint;

        flatRows.push({
          name: item.name,
          position: item.position,
          routeDesc: `${m.type} (ด้าน ${m.route})`,
          workDays: m.days,
          liters: liters,
          fuelCost: fuelCost,
          maintCost: maint,
          sumTotal: sumTotal,
          signature: item.signature,
          remarks: item.remarks
        });
      });
    }
  });

  flatRows.forEach((row, index) => {
    csvContent += `${index + 1},"${row.name}","${row.position}","${row.routeDesc}",${row.workDays},${row.liters.toFixed(2)},${row.fuelCost.toFixed(2)},${row.maintCost.toFixed(2)},${row.sumTotal.toFixed(2)},"${row.signature}","${row.remarks}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  
  const m = globalMonthSelect.options[globalMonthSelect.selectedIndex].text;
  const y = globalYearSelect.value;
  link.setAttribute("download", `เบิกค่าน้ำมัน_${m}_${y}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* --- PRINT PDF / A4 LAYOUT REPORT --- */
function printReport() {
  if (activeMode === 'water') {
    if (waterEmployees.length === 0) {
      showToast('ไม่มีข้อมูลที่จะพิมพ์!', 'warning');
      return;
    }
    
    document.getElementById('printWaterMonthText').textContent = globalMonthSelect.options[globalMonthSelect.selectedIndex].text;
    document.getElementById('printWaterYearText').textContent = globalYearSelect.value;
    
    const printWaterTableBody = document.getElementById('printWaterTableBody');
    printWaterTableBody.innerHTML = '';
    
    let totalAllowanceVal = 0;
    let totalTaxVal = 0;
    let totalNetVal = 0;
    
    waterEmployees.forEach((item, index) => {
      const allowance = item.workDays * 30;
      const tax = calculateWaterTax(item.salary, allowance);
      const net = allowance - tax;
      
      totalAllowanceVal += allowance;
      totalTaxVal += tax;
      totalNetVal += net;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${item.name}</strong></td>
        <td>${item.position}</td>
        <td>${item.salary.toLocaleString()}</td>
        <td>${item.workDays} วัน</td>
        <td>${allowance.toFixed(2)}</td>
        <td>${tax.toFixed(2)}</td>
        <td><strong>${net.toFixed(2)}</strong></td>
        <td><span style="font-family: var(--font-title); font-style: italic; font-size: 9pt; color: #444;">${item.signature}</span></td>
        <td><span style="font-size: 8pt; color: #444;">${item.remarks}</span></td>
      `;
      printWaterTableBody.appendChild(tr);
    });
    
    document.getElementById('printWaterTotalCount').textContent = waterEmployees.length.toString();
    document.getElementById('printWaterTotalCost').textContent = totalAllowanceVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('printWaterTotalTax').textContent = totalTaxVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('printWaterGrandTotal').textContent = totalNetVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    
    // Signatures mapping for water print
    const sigMakerTitleVal = document.getElementById('sigMakerTitle').value.trim() || 'ผู้จัดทำ';
    const sigMakerNameVal = document.getElementById('sigMakerName').value.trim() || '..........................................................';
    const sigMakerPosVal = document.getElementById('sigMakerPos').value.trim() || '..........................................................';
    
    const sigCheckerTitleVal = document.getElementById('sigCheckerTitle').value.trim() || 'ผู้ตรวจสอบ';
    const sigCheckerNameVal = document.getElementById('sigCheckerName').value.trim() || '..........................................................';
    const sigCheckerPosVal = document.getElementById('sigCheckerPos').value.trim() || '..........................................................';
    
    const sigApproverTitleVal = document.getElementById('sigApproverTitle').value.trim() || 'ผู้อนุมัติ';
    const sigApproverNameVal = document.getElementById('sigApproverName').value.trim() || '..........................................................';
    const sigApproverPosVal = document.getElementById('sigApproverPos').value.trim() || '..........................................................';
    
    document.getElementById('printSigMakerTitleValWater').textContent = sigMakerTitleVal;
    document.getElementById('printSigMakerNameValWater').textContent = sigMakerNameVal;
    document.getElementById('printSigMakerPosValWater').textContent = sigMakerPosVal;
    
    document.getElementById('printSigCheckerTitleValWater').textContent = sigCheckerTitleVal;
    document.getElementById('printSigCheckerNameValWater').textContent = sigCheckerNameVal;
    document.getElementById('printSigCheckerPosValWater').textContent = sigCheckerPosVal;
    
    document.getElementById('printSigApproverTitleValWater').textContent = sigApproverTitleVal;
    document.getElementById('printSigApproverNameValWater').textContent = sigApproverNameVal;
    document.getElementById('printSigApproverPosValWater').textContent = sigApproverPosVal;
    
    // Give browser 300ms to render print layout before opening dialog
    setTimeout(() => window.print(), 300);
    return;
  }

  if (employees.length === 0) {
    showToast('ไม่มีข้อมูลที่จะพิมพ์!', 'warning');
    return;
  }

  const currentFuelPrice = parseFloat(globalFuelPriceInput.value) || 38.50;
  
  // Get signatory values onto print preview
  const sigMakerTitleVal = document.getElementById('sigMakerTitle').value.trim() || 'ผู้จัดทำ';
  const sigMakerNameVal = document.getElementById('sigMakerName').value.trim() || '..........................................................';
  const sigMakerPosVal = document.getElementById('sigMakerPos').value.trim() || '..........................................................';
  
  const sigCheckerTitleVal = document.getElementById('sigCheckerTitle').value.trim() || 'ผู้ตรวจสอบ';
  const sigCheckerNameVal = document.getElementById('sigCheckerName').value.trim() || '..........................................................';
  const sigCheckerPosVal = document.getElementById('sigCheckerPos').value.trim() || '..........................................................';
  
  const sigApproverTitleVal = document.getElementById('sigApproverTitle').value.trim() || 'ผู้อนุมัติ';
  const sigApproverNameVal = document.getElementById('sigApproverName').value.trim() || '..........................................................';
  const sigApproverPosVal = document.getElementById('sigApproverPos').value.trim() || '..........................................................';

  const monthText = globalMonthSelect.options[globalMonthSelect.selectedIndex].text;
  const yearText = globalYearSelect.value;

  // 1. Process and aggregate employees to flatRows
  let flatRows = [];
  employees.forEach((item) => {
    if (item.formMode !== 'supervisor') {
      const liters = calculateClaimLiters(item);
      const fuelCost = liters * currentFuelPrice;
      const maintCost = calculateMaintenanceCost(item);
      const sumTotal = fuelCost + maintCost;

      flatRows.push({
        name: item.name,
        position: item.position,
        routeDesc: `ด้านจ่ายที่ ${item.route}`,
        workDays: item.workDays,
        liters: liters,
        fuelCost: fuelCost,
        maintCost: maintCost,
        sumTotal: sumTotal,
        signature: item.signature,
        remarks: item.remarks
      });
    } else {
      // It's a supervisor (ชนจ.)
      // We aggregate ALL their missions into ONE row per supervisor
      let totalLiters = 0;
      let totalMaint = 0;
      let totalDays = 0;
      let missionRouteStrings = [];

      // 1. Group 'ตรวจสอบการนำจ่าย'
      const inspectMissions = item.missions.filter(m => m.type === 'ตรวจสอบการนำจ่าย');
      if (inspectMissions.length > 0) {
        let rawInspectionLiters = 0;
        let inspectDays = 0;
        let inspectMaint = 0;
        let routesUsed = [];

        inspectMissions.forEach(m => {
          const routeInfo = ROUTE_DATA[m.route];
          const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
          rawInspectionLiters += dailyLiters * m.days;
          inspectDays += m.days;
          inspectMaint += calculateSingleMissionMaint(item, m);
          routesUsed.push(m.route);
        });

        const liters = Math.ceil(rawInspectionLiters / 2);
        totalLiters += liters;
        totalMaint += inspectMaint;
        totalDays += inspectDays;
        missionRouteStrings.push(`ตรวจสอบการนำจ่าย (ด้าน ${routesUsed.join(', ')})`);
      }

      // 2. Individual other missions ('นำจ่ายแทน', 'ฝึกสอนงาน')
      const otherMissions = item.missions.filter(m => m.type !== 'ตรวจสอบการนำจ่าย');
      otherMissions.forEach(m => {
        const routeInfo = ROUTE_DATA[m.route];
        const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
        const liters = dailyLiters * m.days;
        const maint = calculateSingleMissionMaint(item, m);

        totalLiters += liters;
        totalMaint += maint;
        totalDays += m.days;
        missionRouteStrings.push(`${m.type} (ด้าน ${m.route}) ${m.days} วัน`);
      });

      const fuelCost = totalLiters * currentFuelPrice;
      const sumTotal = fuelCost + totalMaint;

      flatRows.push({
        name: item.name,
        position: item.position || 'หัวหน้าโซนนำจ่าย (ชนจ.)',
        routeDesc: missionRouteStrings.join('<br>'),
        workDays: totalDays,
        liters: totalLiters,
        fuelCost: fuelCost,
        maintCost: totalMaint,
        sumTotal: sumTotal,
        signature: item.signature,
        remarks: item.remarks
      });
    }
  });

  // 2. Classify rows into 3 groups
  // Group A: พนักงาน + ลูกจ้างประจำ
  // Group B: ลูกจ้างชั่วคราว + ลูกจ้างรายวัน + หัวหน้าโซนนำจ่าย (ชนจ.) (ถ้าไม่ได้กำหนดเป็นอื่นๆ)
  // Group C: ลูกจ้างเหมา (รวมถึง คำว่า "เหมา")
  
  const isGroupA = (pos) => {
    const p = (pos || '').toLowerCase();
    return p.includes('พนักงาน') || p.includes('ลูกจ้างประจำ');
  };

  const isGroupC = (pos) => {
    const p = (pos || '').toLowerCase();
    return p.includes('เหมา');
  };

  let groupA = [];
  let groupB = [];
  let groupC = [];

  flatRows.forEach(row => {
    if (isGroupA(row.position)) {
      groupA.push(row);
    } else if (isGroupC(row.position)) {
      groupC.push(row);
    } else {
      groupB.push(row);
    }
  });

  const categories = [
    { title: 'พนักงาน และ ลูกจ้างประจำ', list: groupA },
    { title: 'ลูกจ้างชั่วคราว/รายวัน และ ชนจ.', list: groupB },
    { title: 'ลูกจ้างเหมาบริการ/เหมาจ่าย', list: groupC }
  ].filter(cat => cat.list.length > 0);

  // Render Page 1, Page 2, Page 3 sequentially
  const hasSupervisors = supervisors.length > 0;
  
  renderStandardPage('พนักงาน และ ลูกจ้างประจำ', listStaffAndRegular, listDailyAndTemp.length === 0 && listContractors.length === 0 && !hasSupervisors);
  renderStandardPage('ลูกจ้างรายวัน และ ลูกจ้าง', listDailyAndTemp, listContractors.length === 0 && !hasSupervisors);
  renderStandardPage('ลูกจ้างเหมา', listContractors, !hasSupervisors);

  // Render Page 4+ for individual Supervisors (ชนจ.)
  supervisors.forEach((sv, svIdx) => {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'print-page-section';
    
    const isLastSv = svIdx === supervisors.length - 1;
    if (!isLastSv) {
      pageDiv.style.pageBreakAfter = 'always';
    }
    pageDiv.style.marginBottom = '2cm';

    let totalLiters = 0;
    let totalMaint = 0;
    let totalFuel = 0;
    let totalDays = 0;
    let sumTotal = 0;

    let subRowsHtml = [];
    let rowIdx = 1;

    // 1. Render Grouped 'ตรวจสอบการนำจ่าย' missions
    const inspectMissions = sv.missions.filter(m => m.type === 'ตรวจสอบการนำจ่าย');
    if (inspectMissions.length > 0) {
      let rawInspectionLiters = 0;
      let inspectDays = 0;
      let inspectMaint = 0;
      let routesUsed = [];

      inspectMissions.forEach(m => {
        const routeInfo = ROUTE_DATA[m.route];
        const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
        rawInspectionLiters += dailyLiters * m.days;
        inspectDays += m.days;
        inspectMaint += calculateSingleMissionMaint(sv, m);
        routesUsed.push(m.route);
      });

      const liters = Math.ceil(rawInspectionLiters / 2);
      const fuelCost = liters * currentFuelPrice;
      const rowSum = fuelCost + inspectMaint;

      totalLiters += liters;
      totalMaint += inspectMaint;
      totalFuel += fuelCost;
      totalDays += inspectDays;
      sumTotal += rowSum;

      subRowsHtml.push(`
        <tr>
          <td>${rowIdx++}</td>
          <td><strong>${sv.name}</strong></td>
          <td>${sv.position || 'หัวหน้าโซนนำจ่าย (ชนจ.)'}</td>
          <td style="text-align: left !important; font-size: 7.5pt;">ตรวจสอบการนำจ่าย (ด้าน ${routesUsed.join(', ')})</td>
          <td>${inspectDays} วัน</td>
          <td>${liters.toFixed(2)}</td>
          <td>${fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td>${inspectMaint.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td><strong>${rowSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
          <td><span style="font-family: var(--font-title); font-style: italic; font-size: 8.5pt; color: #444;">${sv.signature}</span></td>
          <td><span style="font-size: 7.5pt; color: #444;">${sv.remarks || ''}</span></td>
        </tr>
      `);
    }

    // 2. Render other individual missions ('นำจ่ายแทน', 'ฝึกสอนงาน')
    const otherMissions = sv.missions.filter(m => m.type !== 'ตรวจสอบการนำจ่าย');
    otherMissions.forEach(m => {
      const routeInfo = ROUTE_DATA[m.route];
      const dailyLiters = routeInfo ? routeInfo.workerLiters : 0;
      const liters = dailyLiters * m.days;
      const fuelCost = liters * currentFuelPrice;
      const maint = calculateSingleMissionMaint(sv, m);
      const rowSum = fuelCost + maint;

      totalLiters += liters;
      totalMaint += maint;
      totalFuel += fuelCost;
      totalDays += m.days;
      sumTotal += rowSum;

      subRowsHtml.push(`
        <tr>
          <td>${rowIdx++}</td>
          <td><strong>${sv.name}</strong></td>
          <td>${sv.position || 'หัวหน้าโซนนำจ่าย (ชนจ.)'}</td>
          <td style="text-align: left !important; font-size: 7.5pt;">${m.type} (ด้าน ${m.route})</td>
          <td>${m.days} วัน</td>
          <td>${liters.toFixed(2)}</td>
          <td>${fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td>${maint.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td><strong>${rowSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
          <td><span style="font-family: var(--font-title); font-style: italic; font-size: 8.5pt; color: #444;">${sv.signature}</span></td>
          <td><span style="font-size: 7.5pt; color: #444;">${sv.remarks || ''}</span></td>
        </tr>
      `);
    });

    // 3. Append the Total Bold Sum row at the bottom of the table
    subRowsHtml.push(`
      <tr style="background: rgba(0,0,0,0.03); font-weight: bold;">
        <td colspan="4" style="text-align: right !important;">รวมยอดทั้งหมดของ ${sv.name}:</td>
        <td>${totalDays} วัน</td>
        <td>${totalLiters.toFixed(2)}</td>
        <td>${totalFuel.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        <td>${totalMaint.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        <td style="border-bottom: 4px double #000 !important; font-size: 8.5pt;"><strong>${sumTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
        <td colspan="2"></td>
      </tr>
    `);

    pageDiv.innerHTML = `
      <div class="print-header">
        <div class="print-title-container">
          <h2>ใบหลักฐานการเบิกจ่ายเงินค่าน้ำมันเชื้อเพลิงและค่าบำรุงรักษายานพาหนะ</h2>
          <h3>บริษัท ไปรษณีย์ไทย จำกัด (หัวหน้าโซนนำจ่าย - ชนจ. รายบุคคล)</h3>
          <p>ประจำเดือน ${monthText} พ.ศ. ${yearText}</p>
        </div>
        <div class="print-meta-info">
          <p>ราคาน้ำมันถัวเฉลี่ยอ้างอิง: <strong>${currentFuelPrice.toFixed(2)} บาท/ลิตร</strong></p>
        </div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 5%">ลำดับ</th>
            <th style="width: 20%">ชื่อ - นามสกุลผู้รับเงิน</th>
            <th style="width: 12%">ตำแหน่ง / บทบาท</th>
            <th style="width: 15%">รายละเอียดภารกิจ / ด้านจ่าย</th>
            <th style="width: 8%">วันทำงาน</th>
            <th style="width: 8%">น้ำมัน (ลิตร)</th>
            <th style="width: 8%">ค่าน้ำมัน (บาท)</th>
            <th style="width: 8%">ค่าบำรุงรักษา (บาท)</th>
            <th style="width: 8%">รวมเงิน (บาท)</th>
            <th style="width: 10%">ลายมือชื่อผู้รับเงิน</th>
            <th style="width: 10%">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          ${subRowsHtml.join('')}
        </tbody>
      </table>

      <div class="print-summary-section">
        <div class="summary-block">
          <p>จำนวนงานภารกิจย่อย: <strong>${rowIdx - 1}</strong> รายการ</p>
          <p>รวมค่าน้ำมันของบุคคลนี้: <strong>${totalFuel.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> บาท</p>
          <p>รวมค่าบำรุงรักษาของบุคคลนี้: <strong>${totalMaint.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> บาท</p>
          <p class="final-sum">ยอดรวมสุทธิบุคคลนี้: <strong>${sumTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> บาท</p>
        </div>
      </div>

      <div class="print-signatures">
        <div class="sig-box">
          <p>ลงชื่อ..........................................................${sigMakerTitleVal}</p>
          <p style="margin-top: 0.5rem;">(${sigMakerNameVal})</p>
          <p>ตำแหน่ง ${sigMakerPosVal}</p>
        </div>
        <div class="sig-box">
          <p>ลงชื่อ..........................................................${sigCheckerTitleVal}</p>
          <p style="margin-top: 0.5rem;">(${sigCheckerNameVal})</p>
          <p>ตำแหน่ง ${sigCheckerPosVal}</p>
        </div>
        <div class="sig-box">
          <p>ลงชื่อ..........................................................${sigApproverTitleVal}</p>
          <p style="margin-top: 0.5rem;">(${sigApproverNameVal})</p>
          <p>ตำแหน่ง ${sigApproverPosVal}</p>
        </div>
      </div>
    `;

    printReportArea.appendChild(pageDiv);
  });

  // Give browser 300ms to render print layout before opening dialog
  setTimeout(() => window.print(), 300);
}

/* --- SAVED TEMPLATES / BATCH MANAGER LOGIC --- */
function updateTemplateSelectDropdown() {
  const savedTemplates = JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  templateSelect.innerHTML = '<option value="" disabled selected>-- เลือกรายชื่อที่บันทึกไว้ --</option>';
  
  Object.keys(savedTemplates).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    templateSelect.appendChild(opt);
  });
}

async function saveCurrentListAsTemplate() {
  const name = templateNameInput.value.trim();
  if (!name) {
    showToast('กรุณากรอกชื่อสำหรับบันทึกชุดรายชื่อ!', 'warning');
    return;
  }

  if (employees.length === 0) {
    showToast('ไม่มีรายชื่อพนักงานในตารางเพื่อบันทึก!', 'warning');
    return;
  }

  await saveTemplate(name, employees);
  templateNameInput.value = '';
  
  updateTemplateSelectDropdown();
  showToast(`บันทึกชุดรายชื่อ "${name}" เรียบร้อยแล้ว!`, 'success');
}

async function loadSelectedTemplate() {
  const selectedName = templateSelect.value;
  if (!selectedName) {
    showToast('กรุณาเลือกชุดรายชื่อที่ต้องการโหลด!', 'warning');
    return;
  }

  const savedTemplates = JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  const list = savedTemplates[selectedName];
  
  if (list) {
    showConfirm({
      title: 'โหลดชุดรายชื่อ',
      message: `คุณต้องการโหลดชุดรายชื่อ "${selectedName}" มาเขียนทับตารางปัจจุบันใช่หรือไม่?`,
      icon: '📂',
      okText: 'โหลดใช้งาน',
      okClass: 'btn-primary',
      onConfirm: async () => {
        employees = JSON.parse(JSON.stringify(list));
        await saveEmployees(employees);
        cancelEdit();
        renderEmployeeTable();
        showToast(`โหลดชุดรายชื่อ "${selectedName}" สำเร็จ!`, 'success');
      }
    });
  }
}

async function deleteSelectedTemplate() {
  const selectedName = templateSelect.value;
  if (!selectedName) {
    showToast('กรุณาเลือกชุดรายชื่อที่ต้องการลบ!', 'warning');
    return;
  }

  showConfirm({
    title: 'ลบชุดรายชื่อ',
    message: `คุณต้องการลบชุดรายชื่อ "${selectedName}" ใช่หรือไม่?`,
    icon: '🗑️',
    okText: 'ลบชุดนี้',
    onConfirm: async () => {
      await deleteTemplate(selectedName);
      updateTemplateSelectDropdown();
      showToast(`ลบชุดรายชื่อ "${selectedName}" เรียบร้อยแล้ว!`, 'success');
    }
  });
}

/* --- REFERENCE ROUTE DATA EDITOR MODAL FUNCTIONS --- */
function openRouteEditor() {
  routeEditorModal.classList.add('active');
  renderRouteEditorTable();
  loadSelectedRouteToEditorForm();
}

function loadSelectedRouteToEditorForm() {
  const route = editRouteSelect.value;
  if (!route) return;

  const routeInfo = ROUTE_DATA[route];
  routeDistDayInput.value = routeInfo.workerDist;
  routeFuelDayInput.value = routeInfo.workerLiters;
  routeDistMonthInput.value = routeInfo.staffDist;
  routeFuelMonthInput.value = routeInfo.staffLiters;
  routeHasCarSelect.value = routeInfo.hasCar.toString();
}

async function saveSingleRouteSettings() {
  const route = editRouteSelect.value;
  if (!route) return;

  const workerDist = parseFloat(routeDistDayInput.value) || 0;
  const workerLiters = parseFloat(routeFuelDayInput.value) || 0;
  const staffDist = parseFloat(routeDistMonthInput.value) || 0;
  const staffLiters = parseFloat(routeFuelMonthInput.value) || 0;
  const hasCar = routeHasCarSelect.value === 'true';

  ROUTE_DATA[route] = {
    hasCar,
    workerDist,
    workerLiters,
    staffDist,
    staffLiters
  };

  await saveRouteData(ROUTE_DATA);
  
  // Re-render table and dropdown descriptions
  updateAllRouteDropdownTexts();
  renderRouteEditorTable();
  renderEmployeeTable();
  
  showToast(`อัปเดตข้อมูลด้านจ่ายที่ ${route} สำเร็จ!`, 'success');
}

function updateAllRouteDropdownTexts() {
  const currentVal1 = deliveryRouteSelect.value;
  const currentVal2 = missionRouteSelect.value;

  deliveryRouteSelect.innerHTML = '<option value="" disabled selected>-- เลือกด้านจ่าย --</option>';
  missionRouteSelect.innerHTML = '<option value="" disabled selected>-- เลือกด้านจ่าย --</option>';

  Object.keys(ROUTE_DATA).forEach(route => {
    const text = `ด้านจ่ายที่ ${route}${ROUTE_DATA[route].hasCar ? ' (รถยนต์)' : ''}`;
    
    const opt1 = document.createElement('option');
    opt1.value = route;
    opt1.textContent = text;
    deliveryRouteSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = route;
    opt2.textContent = text;
    missionRouteSelect.appendChild(opt2);
  });

  deliveryRouteSelect.value = currentVal1;
  missionRouteSelect.value = currentVal2;
}

function renderRouteEditorTable() {
  routeEditorTableBody.innerHTML = '';
  Object.keys(ROUTE_DATA).forEach(route => {
    const info = ROUTE_DATA[route];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${route}</strong></td>
      <td><span class="badge ${info.hasCar ? 'position-พนักงาน' : 'position-ลูกจ้าง'}">${info.hasCar ? '🚗 รถยนต์' : '🏍️ จักรยานยนต์'}</span></td>
      <td>${info.workerDist.toFixed(1)} กม.</td>
      <td>${info.workerLiters.toFixed(2)} ลิตร</td>
      <td>${info.staffDist.toLocaleString()} กม.</td>
      <td>${info.staffLiters.toLocaleString()} ลิตร</td>
      <td><button type="button" class="btn btn-secondary btn-small select-route-btn" style="padding: 0.15rem 0.35rem; font-size: 0.75rem;">แก้ไข</button></td>
    `;

    tr.querySelector('.select-route-btn').addEventListener('click', () => {
      editRouteSelect.value = route;
      loadSelectedRouteToEditorForm();
    });

    routeEditorTableBody.appendChild(tr);
  });
}

async function resetRouteDataDefaults() {
  showConfirm({
    title: 'รีเซ็ตข้อมูลด้านจ่าย',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสถิติด้านจ่ายอ้างอิงทั้งหมดกลับไปเป็นค่าเริ่มต้นจากโรงงาน? ผลลัพธ์นี้ไม่สามารถย้อนคืนได้',
    icon: '⚠️',
    okText: 'รีเซ็ตทั้งหมด',
    onConfirm: async () => {
      await resetCloudRouteData();
      ROUTE_DATA = initRouteData();
      await saveRouteData(ROUTE_DATA);
      updateAllRouteDropdownTexts();
      renderRouteEditorTable();
      loadSelectedRouteToEditorForm();
      renderEmployeeTable();
      showToast('รีเซ็ตข้อมูลด้านจ่ายทั้งหมดเรียบร้อยแล้ว!', 'success');
    }
  });
}

/* --- SIGNATORY INPUTS LOCK/UNLOCK TOGGLE --- */
function toggleSignatoryInputsLock() {
  const inputs = [
    document.getElementById('sigMakerTitle'),
    document.getElementById('sigMakerName'),
    document.getElementById('sigMakerPos'),
    document.getElementById('sigCheckerTitle'),
    document.getElementById('sigCheckerName'),
    document.getElementById('sigCheckerPos'),
    document.getElementById('sigApproverTitle'),
    document.getElementById('sigApproverName'),
    document.getElementById('sigApproverPos')
  ];

  const isCurrentlyLocked = inputs[0].disabled;

  if (isCurrentlyLocked) {
    // Unlock all inputs
    inputs.forEach(input => input.disabled = false);
    toggleSigEditBtn.innerHTML = '🔒 ล็อกผู้ลงนาม';
    toggleSigEditBtn.style.background = 'var(--post-orange)';
    toggleSigEditBtn.style.color = '#fff';
    inputs[1].focus(); // Focus on the maker's name field
  } else {
    // Lock all inputs
    inputs.forEach(input => input.disabled = true);
    toggleSigEditBtn.innerHTML = '✏️ แก้ไขผู้ลงนาม';
    toggleSigEditBtn.style.background = 'transparent';
    toggleSigEditBtn.style.color = 'var(--post-orange)';
  }
}

/* --- SIGNATORY PROFILE MANAGER LOGIC --- */
async function openSigProfiles() {
  const sigProfilesModal = document.getElementById('sigProfilesModal');
  sigProfilesModal.classList.add('active');
  await renderSigProfilesTable();
}

async function renderSigProfilesTable() {
  const sigProfilesTableBody = document.getElementById('sigProfilesTableBody');
  sigProfilesTableBody.innerHTML = '<tr><td colspan="3" class="no-data">กำลังโหลดข้อมูล...</td></tr>';
  
  const profiles = await fetchSignatoryProfiles();
  sigProfilesTableBody.innerHTML = '';
  
  const keys = Object.keys(profiles);
  if (keys.length === 0) {
    sigProfilesTableBody.innerHTML = '<tr><td colspan="3" class="no-data">ยังไม่มีเทมเพลตผู้ลงนาม</td></tr>';
    return;
  }
  
  keys.forEach(name => {
    const p = profiles[name];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${name}</strong></td>
      <td style="font-size: 0.8rem; text-align: left !important; line-height: 1.4; color: var(--text-primary);">
        <div><strong>${p.makerTitle || 'ผู้จัดทำ'}:</strong> ${p.makerName} (${p.makerPos})</div>
        <div><strong>${p.checkerTitle || 'ผู้ตรวจสอบ'}:</strong> ${p.checkerName || '-'} (${p.checkerPos || '-'})</div>
        <div><strong>${p.approverTitle || 'ผู้อนุมัติ'}:</strong> ${p.approverName || '-'} (${p.approverPos || '-'})</div>
      </td>
      <td>
        <div style="display: flex; gap: 0.25rem; justify-content: center;">
          <button type="button" class="btn btn-primary btn-small load-profile-btn" style="padding: 0.15rem 0.35rem; font-size: 0.75rem;">โหลด</button>
          <button type="button" class="btn btn-danger btn-small delete-profile-btn" style="padding: 0.15rem 0.35rem; font-size: 0.75rem;">ลบ</button>
        </div>
      </td>
    `;
    
    tr.querySelector('.load-profile-btn').addEventListener('click', () => {
      document.getElementById('sigMakerTitle').value = p.makerTitle || 'ผู้จัดทำ';
      document.getElementById('sigMakerName').value = p.makerName || '';
      document.getElementById('sigMakerPos').value = p.makerPos || '';
      
      document.getElementById('sigCheckerTitle').value = p.checkerTitle || 'ผู้ตรวจสอบ';
      document.getElementById('sigCheckerName').value = p.checkerName || '';
      document.getElementById('sigCheckerPos').value = p.checkerPos || '';
      
      document.getElementById('sigApproverTitle').value = p.approverTitle || 'ผู้อนุมัติ';
      document.getElementById('sigApproverName').value = p.approverName || '';
      document.getElementById('sigApproverPos').value = p.approverPos || '';
      
      const sigProfilesModal = document.getElementById('sigProfilesModal');
      sigProfilesModal.classList.remove('active');
      showToast(`โหลดชุดผู้ลงนาม "${name}" สำเร็จ!`, 'success');
    });
    
    tr.querySelector('.delete-profile-btn').addEventListener('click', async () => {
      showConfirm({
        title: 'ลบเทมเพลตผู้ลงนาม',
        message: `คุณต้องการลบเทมเพลตผู้ลงนาม "${name}" ใช่หรือไม่?`,
        icon: '🗑️',
        okText: 'ลบเทมเพลตนี้',
        onConfirm: async () => {
          await deleteSignatoryProfile(name);
          await renderSigProfilesTable();
          showToast(`ลบเทมเพลต "${name}" สำเร็จ!`, 'success');
        }
      });
    });
    
    sigProfilesTableBody.appendChild(tr);
  });
}

async function handleSaveSigProfile() {
  const profileName = document.getElementById('sigProfileNameInput').value.trim();
  if (!profileName) {
    showToast('กรุณากรอกชื่อโปรไฟล์เทมเพลต!', 'warning');
    return;
  }
  
  const profileData = {
    makerTitle: document.getElementById('modalSigMakerTitle').value.trim() || 'ผู้จัดทำ',
    makerName: document.getElementById('modalSigMakerName').value.trim(),
    makerPos: document.getElementById('modalSigMakerPos').value.trim(),
    
    checkerTitle: document.getElementById('modalSigCheckerTitle').value.trim() || 'ผู้ตรวจสอบ',
    checkerName: document.getElementById('modalSigCheckerName').value.trim(),
    checkerPos: document.getElementById('modalSigCheckerPos').value.trim(),
    
    approverTitle: document.getElementById('modalSigApproverTitle').value.trim() || 'ผู้อนุมัติ',
    approverName: document.getElementById('modalSigApproverName').value.trim(),
    approverPos: document.getElementById('modalSigApproverPos').value.trim()
  };
  
  if (!profileData.makerName) {
    showToast('กรุณากรอกชื่อผู้จัดทำเป็นอย่างน้อย!', 'warning');
    return;
  }
  
  await saveSignatoryProfile(profileName, profileData);
  document.getElementById('sigProfileNameInput').value = '';
  document.getElementById('modalSigMakerName').value = '';
  document.getElementById('modalSigMakerPos').value = '';
  document.getElementById('modalSigCheckerName').value = '';
  document.getElementById('modalSigCheckerPos').value = '';
  document.getElementById('modalSigApproverName').value = '';
  document.getElementById('modalSigApproverPos').value = '';
  
  await renderSigProfilesTable();
  showToast(`บันทึกโปรไฟล์ "${profileName}" สำเร็จ!`, 'success');
}

