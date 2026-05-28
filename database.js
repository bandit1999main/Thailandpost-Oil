import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnR7tGFh4oKCn0ikjbWmtku-EyC1sohxI",
  authDomain: "thailandpost-oil.firebaseapp.com",
  projectId: "thailandpost-oil",
  storageBucket: "thailandpost-oil.firebasestorage.app",
  messagingSenderId: "962360442157",
  appId: "1:962360442157:web:c0039bedac937fb41467a4",
  measurementId: "G-45JK3HG71J"
};

let db = null;
let useFirebase = false;

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  useFirebase = true;
  console.log("🔥 Firebase initialized successfully! Connected to Thailand Post Oil Cloud Firestore.");
} catch (error) {
  console.error("⚠️ Failed to initialize Firebase. Falling back to local storage.", error);
  useFirebase = false;
}

export function isCloudConnected() {
  return useFirebase && db !== null;
}

/**
 * --- EMPLOYEES CRUD ---
 */

// Fetch all employees from Firestore
export async function fetchEmployees() {
  if (!isCloudConnected()) {
    return JSON.parse(localStorage.getItem('tp_employees')) || [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, "employees"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    // Store locally as fallback cache
    localStorage.setItem('tp_employees', JSON.stringify(list));
    return list;
  } catch (error) {
    console.error("❌ Firestore fetchEmployees failed. Falling back to local storage.", error);
    return JSON.parse(localStorage.getItem('tp_employees')) || [];
  }
}

// Save all employees to Firestore in batch
export async function saveEmployees(employeesList) {
  // Ensure every item has a stable unique ID
  const now = Date.now();
  employeesList.forEach((emp, i) => {
    if (!emp.id) emp.id = `emp_${now}_${i}`;
  });

  // Always update local storage first
  localStorage.setItem('tp_employees', JSON.stringify(employeesList));

  if (!isCloudConnected()) return false;

  try {
    const batch = writeBatch(db);
    
    // First, get all existing docs to clean up deleted ones
    const querySnapshot = await getDocs(collection(db, "employees"));
    querySnapshot.forEach((d) => {
      if (!employeesList.some(emp => String(emp.id) === d.id)) {
        batch.delete(doc(db, "employees", d.id));
      }
    });

    // Add or update existing ones
    employeesList.forEach((emp) => {
      const docRef = doc(db, "employees", String(emp.id));
      batch.set(docRef, emp);
    });

    await batch.commit();
    console.log("✅ Employees successfully synced to Cloud Firestore.");
    return true;
  } catch (error) {
    console.error("❌ Firestore saveEmployees failed.", error);
    return false;
  }
}

/**
 * --- WATER EMPLOYEES CRUD ---
 */

// Fetch all water employees from Firestore
export async function fetchWaterEmployees() {
  if (!isCloudConnected()) {
    return JSON.parse(localStorage.getItem('tp_water_employees')) || [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, "water_employees"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    localStorage.setItem('tp_water_employees', JSON.stringify(list));
    return list;
  } catch (error) {
    console.error("❌ Firestore fetchWaterEmployees failed. Falling back to local storage.", error);
    return JSON.parse(localStorage.getItem('tp_water_employees')) || [];
  }
}

// Save all water employees to Firestore in batch
export async function saveWaterEmployees(employeesList) {
  // Ensure every item has a stable unique ID
  const now = Date.now();
  employeesList.forEach((emp, i) => {
    if (!emp.id) emp.id = `water_${now}_${i}`;
  });

  localStorage.setItem('tp_water_employees', JSON.stringify(employeesList));

  if (!isCloudConnected()) return false;

  try {
    const batch = writeBatch(db);
    
    const querySnapshot = await getDocs(collection(db, "water_employees"));
    querySnapshot.forEach((d) => {
      if (!employeesList.some(emp => String(emp.id) === d.id)) {
        batch.delete(doc(db, "water_employees", d.id));
      }
    });

    employeesList.forEach((emp) => {
      const docRef = doc(db, "water_employees", String(emp.id));
      batch.set(docRef, emp);
    });

    await batch.commit();
    console.log("✅ Water employees successfully synced to Cloud Firestore.");
    return true;
  } catch (error) {
    console.error("❌ Firestore saveWaterEmployees failed.", error);
    return false;
  }
}


/**
 * --- ROUTE DATA ACTIONS ---
 */

// Fetch customized route data
export async function fetchRouteData() {
  if (!isCloudConnected()) {
    return JSON.parse(localStorage.getItem('tp_route_data'));
  }
  try {
    const querySnapshot = await getDocs(collection(db, "route_data"));
    if (querySnapshot.empty) {
      return null; // Let caller initialize standard route data
    }
    const routeData = {};
    querySnapshot.forEach((doc) => {
      routeData[doc.id] = doc.data();
    });
    // Cache locally
    localStorage.setItem('tp_route_data', JSON.stringify(routeData));
    return routeData;
  } catch (error) {
    console.error("❌ Firestore fetchRouteData failed.", error);
    return JSON.parse(localStorage.getItem('tp_route_data'));
  }
}

// Save all route data
export async function saveRouteData(routeData) {
  localStorage.setItem('tp_route_data', JSON.stringify(routeData));

  if (!isCloudConnected()) return false;

  try {
    const batch = writeBatch(db);
    Object.keys(routeData).forEach((routeKey) => {
      const docRef = doc(db, "route_data", String(routeKey));
      batch.set(docRef, routeData[routeKey]);
    });
    await batch.commit();
    console.log("✅ Route data successfully synced to Cloud Firestore.");
    return true;
  } catch (error) {
    console.error("❌ Firestore saveRouteData failed.", error);
    return false;
  }
}

// Reset route data in cloud
export async function resetCloudRouteData() {
  if (!isCloudConnected()) return false;
  try {
    const querySnapshot = await getDocs(collection(db, "route_data"));
    const batch = writeBatch(db);
    querySnapshot.forEach((d) => {
      batch.delete(doc(db, "route_data", d.id));
    });
    await batch.commit();
    console.log("🗑️ Cloud route data cleared successfully.");
    return true;
  } catch (error) {
    console.error("❌ Firestore resetCloudRouteData failed.", error);
    return false;
  }
}

/**
 * --- SAVED TEMPLATES ACTIONS ---
 */

// Fetch saved templates
export async function fetchSavedTemplates() {
  if (!isCloudConnected()) {
    return JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  }
  try {
    const querySnapshot = await getDocs(collection(db, "templates"));
    const templates = {};
    querySnapshot.forEach((doc) => {
      templates[doc.id] = doc.data().employees || [];
    });
    localStorage.setItem('tp_saved_templates', JSON.stringify(templates));
    return templates;
  } catch (error) {
    console.error("❌ Firestore fetchSavedTemplates failed.", error);
    return JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  }
}

// Save template
export async function saveTemplate(templateName, employeesList) {
  const templates = JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  templates[templateName] = employeesList;
  localStorage.setItem('tp_saved_templates', JSON.stringify(templates));

  if (!isCloudConnected()) return false;

  try {
    const docRef = doc(db, "templates", templateName);
    await setDoc(docRef, { employees: employeesList, updatedAt: Date.now() });
    console.log(`✅ Template "${templateName}" successfully saved to Cloud Firestore.`);
    return true;
  } catch (error) {
    console.error("❌ Firestore saveTemplate failed.", error);
    return false;
  }
}

// Delete template
export async function deleteTemplate(templateName) {
  const templates = JSON.parse(localStorage.getItem('tp_saved_templates')) || {};
  delete templates[templateName];
  localStorage.setItem('tp_saved_templates', JSON.stringify(templates));

  if (!isCloudConnected()) return false;

  try {
    await deleteDoc(doc(db, "templates", templateName));
    console.log(`🗑️ Template "${templateName}" deleted from Cloud Firestore.`);
    return true;
  } catch (error) {
    console.error("❌ Firestore deleteTemplate failed.", error);
    return false;
  }
}

/**
 * --- SIGNATORY PROFILES ACTIONS ---
 */

// Fetch saved signatory profiles
export async function fetchSignatoryProfiles() {
  if (!isCloudConnected()) {
    return JSON.parse(localStorage.getItem('tp_sig_profiles')) || {};
  }
  try {
    const querySnapshot = await getDocs(collection(db, "signatory_profiles"));
    const profiles = {};
    querySnapshot.forEach((doc) => {
      profiles[doc.id] = doc.data();
    });
    localStorage.setItem('tp_sig_profiles', JSON.stringify(profiles));
    return profiles;
  } catch (error) {
    console.error("❌ Firestore fetchSignatoryProfiles failed.", error);
    return JSON.parse(localStorage.getItem('tp_sig_profiles')) || {};
  }
}

// Save signatory profile
export async function saveSignatoryProfile(profileName, profileData) {
  const profiles = JSON.parse(localStorage.getItem('tp_sig_profiles')) || {};
  profiles[profileName] = profileData;
  localStorage.setItem('tp_sig_profiles', JSON.stringify(profiles));

  if (!isCloudConnected()) return false;

  try {
    const docRef = doc(db, "signatory_profiles", profileName);
    await setDoc(docRef, { ...profileData, updatedAt: Date.now() });
    console.log(`✅ Signatory profile "${profileName}" successfully saved to Cloud Firestore.`);
    return true;
  } catch (error) {
    console.error("❌ Firestore saveSignatoryProfile failed.", error);
    return false;
  }
}

// Delete signatory profile
export async function deleteSignatoryProfile(profileName) {
  const profiles = JSON.parse(localStorage.getItem('tp_sig_profiles')) || {};
  delete profiles[profileName];
  localStorage.setItem('tp_sig_profiles', JSON.stringify(profiles));

  if (!isCloudConnected()) return false;

  try {
    await deleteDoc(doc(db, "signatory_profiles", profileName));
    console.log(`🗑️ Signatory profile "${profileName}" deleted from Cloud Firestore.`);
    return true;
  } catch (error) {
    console.error("❌ Firestore deleteSignatoryProfile failed.", error);
    return false;
  }
}

/**
 * --- REAL-TIME AUTOSYNC listeners ---
 */
export function listenToEmployees(callback) {
  if (!isCloudConnected()) return null;
  return onSnapshot(collection(db, "employees"), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    localStorage.setItem('tp_employees', JSON.stringify(list));
    callback(list);
  }, (error) => {
    console.error("Firestore listenToEmployees failed:", error);
  });
}

export function listenToWaterEmployees(callback) {
  if (!isCloudConnected()) return null;
  return onSnapshot(collection(db, "water_employees"), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    localStorage.setItem('tp_water_employees', JSON.stringify(list));
    callback(list);
  }, (error) => {
    console.error("Firestore listenToWaterEmployees failed:", error);
  });
}


