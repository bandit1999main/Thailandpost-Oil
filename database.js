import { projects as staticProjects } from './projects.js';

// --- environment keys ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have standard Firebase configurations in .env
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let db = null;
let auth = null;
let useFirebase = false;

// Attempt Firebase initialization
if (isFirebaseConfigured) {
  try {
    // Dynamic imports to prevent issues if Firebase isn't needed
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    useFirebase = true;
    console.log("🔥 Firebase initialized successfully! Connected to Cloud Firestore.");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Firebase. Falling back to local storage database manager.", error);
    useFirebase = false;
  }
} else {
  console.log("ℹ️ Firebase credentials not provided in .env. Running on premium Local Storage Database Manager.");
}

// --- LOCAL STORAGE DATABASE MANAGER ---
const LOCAL_STORAGE_KEY = 'bandit_portfolio_projects';
const LOCAL_AUTH_KEY = 'bandit_admin_token';
const DEFAULT_ADMIN_EMAIL = 'bandit1999main@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin'; // default password

function getLocalProjects() {
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!localData) {
    // Seed with static projects
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(staticProjects));
    return staticProjects;
  }
  return JSON.parse(localData);
}

function setLocalProjects(projects) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

// --- EXPORTED DATABASE ACTIONS ---

// Get active projects
export async function fetchProjects() {
  if (useFirebase) {
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const q = query(collection(db, "projects"), orderBy("id", "asc"));
      const querySnapshot = await getDocs(q);
      
      const firestoreProjects = [];
      querySnapshot.forEach((doc) => {
        firestoreProjects.push({ ...doc.data(), docId: doc.id });
      });

      if (firestoreProjects.length === 0) {
        console.log("🌱 Firestore collection is empty. Seeding with default portfolio projects...");
        const seeded = await seedFirestore(staticProjects);
        return seeded;
      }
      return firestoreProjects;
    } catch (error) {
      console.error("❌ Firestore fetch failed. Falling back to Local Storage.", error);
      return getLocalProjects();
    }
  } else {
    return getLocalProjects();
  }
}

// Seed helper
async function seedFirestore(projectsList) {
  const { collection, addDoc } = await import('firebase/firestore');
  const seededList = [];
  try {
    for (const project of projectsList) {
      const docRef = await addDoc(collection(db, "projects"), project);
      seededList.push({ ...project, docId: docRef.id });
    }
    console.log("✅ Firestore seeded successfully with", seededList.length, "projects.");
    return seededList;
  } catch (error) {
    console.error("❌ Seeding Firestore failed:", error);
    return getLocalProjects();
  }
}

// Add a project
export async function addProject(projectData) {
  const newId = Date.now(); // unique numeric ID
  const newProject = {
    id: newId,
    title: projectData.title,
    category: projectData.category,
    shortDescription: projectData.shortDescription,
    description: projectData.description,
    tags: projectData.tags,
    imageClass: projectData.imageClass || "nova-bg",
    demoUrl: projectData.demoUrl || "#",
    githubUrl: projectData.githubUrl || "#"
  };

  if (useFirebase) {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const docRef = await addDoc(collection(db, "projects"), newProject);
      return { ...newProject, docId: docRef.id };
    } catch (error) {
      console.error("❌ Firebase add project failed. Saving to Local Storage.", error);
      return addLocalProject(newProject);
    }
  } else {
    return addLocalProject(newProject);
  }
}

function addLocalProject(newProject) {
  const list = getLocalProjects();
  list.push(newProject);
  setLocalProjects(list);
  return newProject;
}

// Update a project
export async function updateProject(projectId, projectData) {
  if (useFirebase) {
    try {
      const { doc, updateDoc, collection, getDocs, query, where } = await import('firebase/firestore');
      // If we don't have the docId, find it by numeric ID
      let targetDocId = projectData.docId;
      if (!targetDocId) {
        const q = query(collection(db, "projects"), where("id", "==", Number(projectId)));
        const snap = await getDocs(q);
        snap.forEach(d => {
          targetDocId = d.id;
        });
      }
      
      if (targetDocId) {
        const docRef = doc(db, "projects", targetDocId);
        const updatedFields = {
          title: projectData.title,
          category: projectData.category,
          shortDescription: projectData.shortDescription,
          description: projectData.description,
          tags: projectData.tags,
          imageClass: projectData.imageClass,
          demoUrl: projectData.demoUrl,
          githubUrl: projectData.githubUrl
        };
        await updateDoc(docRef, updatedFields);
        return { ...updatedFields, id: Number(projectId), docId: targetDocId };
      }
      throw new Error("Document ID not found");
    } catch (error) {
      console.error("❌ Firebase update failed. Updating in Local Storage.", error);
      return updateLocalProject(projectId, projectData);
    }
  } else {
    return updateLocalProject(projectId, projectData);
  }
}

function updateLocalProject(projectId, projectData) {
  const list = getLocalProjects();
  const index = list.findIndex(p => p.id === Number(projectId));
  if (index !== -1) {
    list[index] = {
      ...list[index],
      title: projectData.title,
      category: projectData.category,
      shortDescription: projectData.shortDescription,
      description: projectData.description,
      tags: projectData.tags,
      imageClass: projectData.imageClass,
      demoUrl: projectData.demoUrl,
      githubUrl: projectData.githubUrl
    };
    setLocalProjects(list);
    return list[index];
  }
  return null;
}

// Delete a project
export async function deleteProject(projectId, docId) {
  if (useFirebase) {
    try {
      const { doc, deleteDoc, collection, getDocs, query, where } = await import('firebase/firestore');
      let targetDocId = docId;
      if (!targetDocId) {
        const q = query(collection(db, "projects"), where("id", "==", Number(projectId)));
        const snap = await getDocs(q);
        snap.forEach(d => {
          targetDocId = d.id;
        });
      }

      if (targetDocId) {
        const docRef = doc(db, "projects", targetDocId);
        await deleteDoc(docRef);
        return true;
      }
      throw new Error("Document ID not found for deletion");
    } catch (error) {
      console.error("❌ Firebase delete failed. Deleting from Local Storage.", error);
      return deleteLocalProject(projectId);
    }
  } else {
    return deleteLocalProject(projectId);
  }
}

function deleteLocalProject(projectId) {
  const list = getLocalProjects();
  const filtered = list.filter(p => p.id !== Number(projectId));
  setLocalProjects(filtered);
  return true;
}

// --- AUTHENTICATION ACTIONS ---

// Login admin
export async function loginAdmin(email, password) {
  if (useFirebase) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("❌ Firebase Auth login failed:", error);
      return { success: false, error: error.message };
    }
  } else {
    // Fallback Local Auth
    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const mockToken = `mock-session-${Date.now()}`;
      localStorage.setItem(LOCAL_AUTH_KEY, mockToken);
      return { success: true, user: { email: DEFAULT_ADMIN_EMAIL } };
    } else {
      return { success: false, error: "Incorrect email or password." };
    }
  }
}

// Check auth state
export function getAdminUser() {
  if (useFirebase) {
    return auth.currentUser;
  } else {
    const token = localStorage.getItem(LOCAL_AUTH_KEY);
    return token ? { email: DEFAULT_ADMIN_EMAIL } : null;
  }
}

// Register Auth state listener
export function onAuthChanged(callback) {
  if (useFirebase) {
    const { onAuthStateChanged } = auth;
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  } else {
    // Check locally every time auth shifts
    const checkLocal = () => {
      const user = getAdminUser();
      callback(user);
    };
    checkLocal();
    // Return a dummy unsubscribe function
    return () => {};
  }
}

// Logout admin
export async function logoutAdmin() {
  if (useFirebase) {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("❌ Firebase Auth logout failed:", error);
      return false;
    }
  } else {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    return true;
  }
}
