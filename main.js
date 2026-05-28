import { 
  isCloudConnected,
  fetchEmployees,
  saveEmployees,
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

const BASE_ROUTE_DATA = {
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
  const data = {};
  for (let i = 1; i <= 19; i++) {
    const dailyDist = 48 + i;
    const staffDist = dailyDist * 26;
    data[i.toString()] = {
      hasCar: false,
      staffDist: staffDist,
      staffLiters: Math.ceil(staffDist / 25),
      workerDist: dailyDist,
      workerLiters: Number((dailyDist / 25).toFixed(2))
    };
  }
  Object.assign(data, BASE_ROUTE_DATA);
  return data;
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
      
      // Fetch cloud employees
      const cloudEmployees = await fetchEmployees();
      if (cloudEmployees && cloudEmployees.length > 0) {
        employees = cloudEmployees;
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
    alert('กรุณาเลือกด้านจ่ายที่จะปฏิบัติภารกิจ!');
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

/* --- FORM SUBMISSION --- */
function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('empName').value.trim();
  const formMode = formModeInput.value;
  const vehicle = vehicleTypeSelect.value;
  const remarks = document.getElementById('remarks').value.trim();
  const signatureInput = document.getElementById('signature').value.trim();
  const signature = signatureInput || name;
  const editIndexVal = document.getElementById('editIndex').value;

  let item = {};

  if (formMode === 'supervisor') {
    if (tempMissions.length === 0) {
      alert('กรุณากรอกและบันทึกภารกิจอย่างน้อย 1 ภารกิจสำหรับ ชนจ.!');
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
  saveEmployees(employees);
  employeeForm.reset();
  routeStatsPreview.classList.add('hidden');
  tempMissions = [];
  
  if (formMode === 'supervisor') {
    renderMissionsTable();
  }
  
  renderEmployeeTable();
}

function renderEmployeeTable() {
  const currentFuelPrice = parseFloat(globalFuelPriceInput.value) || 38.50;

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

    tr.querySelector('.edit-row-btn').addEventListener('click', () => loadRowToForm(row.parentIndex));
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
  if (confirm('คุณต้องการลบรายชื่อพนักงานนี้ใช่หรือไม่?')) {
    employees.splice(index, 1);
    saveEmployees(employees);
    renderEmployeeTable();
  }
}

function cancelEdit() {
  document.getElementById('editIndex').value = '';
  saveBtn.innerHTML = '📥 บันทึกข้อมูลพนักงาน';
  resetBtn.classList.add('hidden');
  const formTitle = document.getElementById('formTitle');
  if (formTitle) formTitle.textContent = 'กรอกข้อมูลผู้รับเงินค่าน้ำมัน';
  employeeForm.reset();
  routeStatsPreview.classList.add('hidden');
  tempMissions = [];
  if (formModeInput.value === 'supervisor') {
    renderMissionsTable();
  }
}

function clearAllData() {
  if (confirm('คุณต้องการลบข้อมูลพนักงานทั้งหมดในตารางใช่หรือไม่?')) {
    employees = [];
    saveEmployees([]);
    cancelEdit();
    renderEmployeeTable();
  }
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
    alert('กรุณากรอกราคาน้ำมันและจำนวนวันให้ถูกต้อง!');
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
function loadDemoData() {
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
  if (employees.length === 0) {
    alert('ไม่มีข้อมูลที่จะส่งออก!');
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
  if (employees.length === 0) {
    alert('ไม่มีข้อมูลที่จะพิมพ์!');
    return;
  }

  const currentFuelPrice = parseFloat(globalFuelPriceInput.value) || 38.50;
  
  document.getElementById('printMonthText').textContent = globalMonthSelect.options[globalMonthSelect.selectedIndex].text;
  document.getElementById('printYearText').textContent = globalYearSelect.value;
  document.getElementById('printRefPriceText').textContent = currentFuelPrice.toFixed(2);

  const printTableBody = document.getElementById('printTableBody');
  printTableBody.innerHTML = '';

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
    totalFuelCost += row.fuelCost;
    totalMaintCost += row.maintCost;
    grandTotal += row.sumTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${row.name}</strong></td>
      <td>${row.position}</td>
      <td style="text-align: left !important; font-size: 8pt; line-height: 1.3;">${row.routeDesc}</td>
      <td>${row.workDays} วัน</td>
      <td>${row.liters.toFixed(2)}</td>
      <td>${row.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td>${row.maintCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      <td><strong>${row.sumTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
      <td><span style="font-family: var(--font-title); font-style: italic; font-size: 9pt; color: #e5e5e5 !important;">${row.signature}</span></td>
      <td><span style="font-size: 8pt; color: #444;">${row.remarks}</span></td>
    `;
    printTableBody.appendChild(tr);
  });

  document.getElementById('printTotalCount').textContent = flatRows.length.toString();
  document.getElementById('printTotalFuel').textContent = totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 });
  document.getElementById('printTotalMaintenance').textContent = totalMaintCost.toLocaleString(undefined, { minimumFractionDigits: 2 });
  document.getElementById('printGrandTotal').textContent = grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });

  // Map signatory values onto print preview
  const sigMakerTitleVal = document.getElementById('sigMakerTitle').value.trim() || 'ผู้จัดทำ';
  const sigMakerNameVal = document.getElementById('sigMakerName').value.trim() || '..........................................................';
  const sigMakerPosVal = document.getElementById('sigMakerPos').value.trim() || '..........................................................';
  
  const sigCheckerTitleVal = document.getElementById('sigCheckerTitle').value.trim() || 'ผู้ตรวจสอบ';
  const sigCheckerNameVal = document.getElementById('sigCheckerName').value.trim() || '..........................................................';
  const sigCheckerPosVal = document.getElementById('sigCheckerPos').value.trim() || '..........................................................';
  
  const sigApproverTitleVal = document.getElementById('sigApproverTitle').value.trim() || 'ผู้อนุมัติ';
  const sigApproverNameVal = document.getElementById('sigApproverName').value.trim() || '..........................................................';
  const sigApproverPosVal = document.getElementById('sigApproverPos').value.trim() || '..........................................................';

  document.getElementById('printSigMakerTitleVal').textContent = sigMakerTitleVal;
  document.getElementById('printSigMakerNameVal').textContent = sigMakerNameVal;
  document.getElementById('printSigMakerPosVal').textContent = sigMakerPosVal;
  
  document.getElementById('printSigCheckerTitleVal').textContent = sigCheckerTitleVal;
  document.getElementById('printSigCheckerNameVal').textContent = sigCheckerNameVal;
  document.getElementById('printSigCheckerPosVal').textContent = sigCheckerPosVal;
  
  document.getElementById('printSigApproverTitleVal').textContent = sigApproverTitleVal;
  document.getElementById('printSigApproverNameVal').textContent = sigApproverNameVal;
  document.getElementById('printSigApproverPosVal').textContent = sigApproverPosVal;

  window.print();
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
    alert('กรุณากรอกชื่อสำหรับบันทึกชุดรายชื่อ!');
    return;
  }

  if (employees.length === 0) {
    alert('ไม่มีรายชื่อพนักงานในตารางเพื่อบันทึก!');
    return;
  }

  await saveTemplate(name, employees);
  templateNameInput.value = '';
  
  updateTemplateSelectDropdown();
  alert(`บันทึกชุดรายชื่อ "${name}" เรียบร้อยแล้ว!`);
}

async function loadSelectedTemplate() {
  const selectedName = templateSelect.value;
  if (!selectedName) {
    alert('กรุณาเลือกชุดรายชื่อที่ต้องการโหลด!');
    return;
  }

  const savedTemplates = JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  const list = savedTemplates[selectedName];
  
  if (list) {
    if (confirm(`คุณต้องการโหลดชุดรายชื่อ "${selectedName}" มาเขียนทับตารางปัจจุบันใช่หรือไม่?`)) {
      employees = JSON.parse(JSON.stringify(list));
      await saveEmployees(employees);
      cancelEdit();
      renderEmployeeTable();
      alert(`โหลดชุดรายชื่อ "${selectedName}" สำเร็จ!`);
    }
  }
}

async function deleteSelectedTemplate() {
  const selectedName = templateSelect.value;
  if (!selectedName) {
    alert('กรุณาเลือกชุดรายชื่อที่ต้องการลบ!');
    return;
  }

  if (confirm(`คุณต้องการลบชุดรายชื่อ "${selectedName}" ใช่หรือไม่?`)) {
    await deleteTemplate(selectedName);
    updateTemplateSelectDropdown();
    alert(`ลบชุดรายชื่อ "${selectedName}" เรียบร้อยแล้ว!`);
  }
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
  
  alert(`อัปเดตข้อมูลด้านจ่ายที่ ${route} สำเร็จ!`);
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
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสถิติด้านจ่ายอ้างอิงทั้งหมดกลับไปเป็นค่าเริ่มต้นจากโรงงาน?')) {
    await resetCloudRouteData();
    ROUTE_DATA = initRouteData();
    await saveRouteData(ROUTE_DATA);
    updateAllRouteDropdownTexts();
    renderRouteEditorTable();
    loadSelectedRouteToEditorForm();
    renderEmployeeTable();
    alert('รีเซ็ตข้อมูลด้านจ่ายทั้งหมดเรียบร้อยแล้ว!');
  }
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
      alert(`โหลดชุดผู้ลงนาม "${name}" สำเร็จ!`);
    });
    
    tr.querySelector('.delete-profile-btn').addEventListener('click', async () => {
      if (confirm(`คุณต้องการลบเทมเพลตผู้ลงนาม "${name}" ใช่หรือไม่?`)) {
        await deleteSignatoryProfile(name);
        await renderSigProfilesTable();
        alert(`ลบเทมเพลต "${name}" สำเร็จ!`);
      }
    });
    
    sigProfilesTableBody.appendChild(tr);
  });
}

async function handleSaveSigProfile() {
  const profileName = document.getElementById('sigProfileNameInput').value.trim();
  if (!profileName) {
    alert('กรุณากรอกชื่อโปรไฟล์เทมเพลต!');
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
    alert('กรุณากรอกชื่อผู้จัดทำเป็นอย่างน้อย!');
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
  alert(`บันทึกโปรไฟล์ "${profileName}" สำเร็จ!`);
}

