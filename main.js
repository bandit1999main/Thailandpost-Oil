import {
  fetchProjects,
  addProject,
  updateProject,
  deleteProject,
  loginAdmin,
  getAdminUser,
  onAuthChanged,
  logoutAdmin
} from './database.js';

let projectsList = [];

// --- CONFIG & CONSTANTS ---
const TYPING_ROLES = ["Full-Stack Developer", "Creative UI Engineer", "Software Artisan", "Problem Solver"];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;
let erasingDelay = 50;
let newRoleDelay = 2000;

// SVGs for dynamic injection in project cards and modals
const PROJECT_SVGs = {
  1: `<svg class="project-graphic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
  2: `<svg class="project-graphic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  3: `<svg class="project-graphic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="6.34" y1="17.66" x2="4.93" y2="19.07"></line><line x1="19.07" y1="4.93" x2="17.66" y2="6.34"></line></svg>`
};

// --- DOM ELEMENTS ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section');
const cursorGlow = document.getElementById('cursorGlow');
const typingText = document.getElementById('typingText');
const projectsGrid = document.getElementById('projectsGrid');
const projectModal = document.getElementById('projectModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const contactForm = document.getElementById('contactForm');
const successToast = document.getElementById('successToast');

// --- 1. ROUTING & NAVIGATION ---
function showSection(sectionId) {
  const targetId = sectionId.replace('#', '') || 'home';
  let found = false;

  sections.forEach(section => {
    if (section.id === targetId) {
      section.classList.add('active');
      found = true;
    } else {
      section.classList.remove('active');
    }
  });

  if (!found) {
    document.getElementById('home').classList.add('active');
  }

  navLinks.forEach(link => {
    if (link.getAttribute('data-section') === targetId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  window.scrollTo(0, 0);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.getAttribute('data-section');
    window.location.hash = section;
  });
});

document.getElementById('logoLink').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.hash = 'home';
});

window.addEventListener('hashchange', () => {
  showSection(window.location.hash);
  if (window.location.hash === '#admin') {
    checkAdminAuthState();
  }
});

const initialHash = window.location.hash || '#home';
showSection(initialHash);
if (initialHash === '#admin') {
  checkAdminAuthState();
}

// --- 2. INTERACTIVE CURSOR GLOW ---
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
  cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

// --- 3. DYNAMIC TYPING EFFECT ---
function typeEffect() {
  const currentRole = TYPING_ROLES[roleIndex];
  
  if (isDeleting) {
    typingText.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
    typingDelay = erasingDelay;
  } else {
    typingText.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
    typingDelay = 100;
  }

  if (!isDeleting && charIndex === currentRole.length) {
    isDeleting = true;
    typingDelay = newRoleDelay;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % TYPING_ROLES.length;
    typingDelay = 500;
  }

  setTimeout(typeEffect, typingDelay);
}

if (typingText) {
  setTimeout(typeEffect, 1000);
}

// --- 4. RENDER PROJECTS ---
const DEFAULT_PROJECT_SVG = `<svg class="project-graphic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;

function getProjectSVG(id) {
  return PROJECT_SVGs[id] || DEFAULT_PROJECT_SVG;
}

function renderProjects() {
  if (!projectsGrid) return;
  
  projectsGrid.innerHTML = '';
  
  projectsList.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card glass-panel';
    card.setAttribute('data-id', project.id);
    
    const svgIcon = getProjectSVG(project.id);
    
    card.innerHTML = `
      <div class="project-image-wrapper ${project.imageClass}">
        <span class="project-badge">${project.category}</span>
        ${svgIcon}
      </div>
      <div class="project-info">
        <h3>${project.title}</h3>
        <p>${project.shortDescription}</p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => openProjectModal(project));
    projectsGrid.appendChild(card);
  });
}

// --- 5. MODAL LOGIC ---
function openProjectModal(project) {
  const modalHero = document.getElementById('modalHero');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalTags = document.getElementById('modalTags');
  const modalGithubLink = document.getElementById('modalGithubLink');
  const modalDemoLink = document.getElementById('modalDemoLink');

  modalHero.className = `modal-hero ${project.imageClass}`;
  modalHero.innerHTML = getProjectSVG(project.id);
  
  modalCategory.textContent = project.category;
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  
  modalTags.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
  
  modalGithubLink.href = project.githubUrl;
  modalDemoLink.href = project.demoUrl;
  
  projectModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  projectModal.classList.remove('active');
  document.body.style.overflow = '';
}

modalCloseBtn.addEventListener('click', closeProjectModal);
projectModal.addEventListener('click', (e) => {
  if (e.target === projectModal) {
    closeProjectModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
  }
});

// --- 6. CONTACT FORM SUBMISSION ---
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('btnSubmitContact');
    const originalBtnHTML = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="rotate-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: rotate 1.5s linear infinite;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      Sending...
    `;
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      contactForm.reset();
      
      successToast.classList.add('active');
      
      setTimeout(() => {
        successToast.classList.remove('active');
      }, 4000);
    }, 1500);
  });
}

// --- ADMIN DASHBOARD CONTROLLER & VIEWS ---
const adminLoginContainer = document.getElementById('adminLoginContainer');
const adminDashboardContainer = document.getElementById('adminDashboardContainer');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginError = document.getElementById('adminLoginError');
const adminEmailBadge = document.getElementById('adminEmailBadge');
const btnAdminLogout = document.getElementById('btnAdminLogout');

const projectFormPanel = document.getElementById('projectFormPanel');
const btnOpenAddForm = document.getElementById('btnOpenAddForm');
const btnCancelForm = document.getElementById('btnCancelForm');
const projectEditorForm = document.getElementById('projectEditorForm');
const formPanelTitle = document.getElementById('formPanelTitle');

const editProjectId = document.getElementById('editProjectId');
const editProjectDocId = document.getElementById('editProjectDocId');
const projectTitleInput = document.getElementById('projectTitle');
const projectCategoryInput = document.getElementById('projectCategory');
const projectDemoInput = document.getElementById('projectDemo');
const projectGithubInput = document.getElementById('projectGithub');
const projectTagsInput = document.getElementById('projectTags');
const projectImageClassSelect = document.getElementById('projectImageClass');
const projectShortDescInput = document.getElementById('projectShortDesc');
const projectDescInput = document.getElementById('projectDesc');

const adminProjectListContainer = document.getElementById('adminProjectListContainer');

async function loadAndRenderProjects() {
  projectsList = await fetchProjects();
  renderProjects();
  if (getAdminUser()) {
    renderAdminProjects();
  }
}

function showProjectForm(isEdit = false) {
  if (projectFormPanel) {
    projectFormPanel.style.display = 'block';
    formPanelTitle.textContent = isEdit ? 'Edit Project' : 'Add New Project';
    
    // Smooth scroll to the form panel so the admin sees it
    const rect = projectFormPanel.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    window.scrollTo({
      top: rect.top + scrollTop - 80,
      behavior: 'smooth'
    });
  }
}

function hideProjectForm() {
  if (projectFormPanel) {
    projectFormPanel.style.display = 'none';
    if (projectEditorForm) projectEditorForm.reset();
    if (editProjectId) editProjectId.value = '';
    if (editProjectDocId) editProjectDocId.value = '';
  }
}

function openEditProjectForm(project) {
  hideProjectForm();
  showProjectForm(true);

  if (editProjectId) editProjectId.value = project.id;
  if (editProjectDocId) editProjectDocId.value = project.docId || '';
  if (projectTitleInput) projectTitleInput.value = project.title;
  if (projectCategoryInput) projectCategoryInput.value = project.category;
  if (projectDemoInput) projectDemoInput.value = project.demoUrl === '#' ? '' : project.demoUrl;
  if (projectGithubInput) projectGithubInput.value = project.githubUrl === '#' ? '' : project.githubUrl;
  if (projectTagsInput) projectTagsInput.value = project.tags.join(', ');
  if (projectImageClassSelect) projectImageClassSelect.value = project.imageClass;
  if (projectShortDescInput) projectShortDescInput.value = project.shortDescription;
  if (projectDescInput) projectDescInput.value = project.description;
}

function renderAdminProjects() {
  if (!adminProjectListContainer) return;
  adminProjectListContainer.innerHTML = '';

  if (projectsList.length === 0) {
    adminProjectListContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        No projects found. Add your first project!
      </div>
    `;
    return;
  }

  projectsList.forEach(project => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    const initial = project.title.substring(0, 2).toUpperCase();

    row.innerHTML = `
      <div class="admin-row-info">
        <div class="admin-row-graphic ${project.imageClass}">${initial}</div>
        <div class="admin-row-title">
          <h4>${project.title}</h4>
          <p>${project.category} &bull; ${project.tags.join(', ')}</p>
        </div>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-secondary btn-edit" data-id="${project.id}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
          Edit
        </button>
        <button class="btn btn-danger btn-delete" data-id="${project.id}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
          Delete
        </button>
      </div>
    `;

    row.querySelector('.btn-edit').addEventListener('click', () => {
      openEditProjectForm(project);
    });

    row.querySelector('.btn-delete').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
        const btnDelete = row.querySelector('.btn-delete');
        btnDelete.disabled = true;
        btnDelete.textContent = 'Deleting...';
        
        await deleteProject(project.id, project.docId);
        await loadAndRenderProjects();
      }
    });

    adminProjectListContainer.appendChild(row);
  });
}

export function checkAdminAuthState() {
  const user = getAdminUser();
  if (user) {
    if (adminLoginContainer) adminLoginContainer.style.display = 'none';
    if (adminDashboardContainer) adminDashboardContainer.style.display = 'block';
    if (adminEmailBadge) adminEmailBadge.textContent = user.email || 'bandit1999main@gmail.com';
    renderAdminProjects();
  } else {
    if (adminLoginContainer) adminLoginContainer.style.display = 'block';
    if (adminDashboardContainer) adminDashboardContainer.style.display = 'none';
    hideProjectForm();
  }
}

// Hook up Auth Listener
onAuthChanged((user) => {
  checkAdminAuthState();
});

// Setup events
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (adminLoginError) adminLoginError.style.display = 'none';
    
    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value;

    const btnLogin = document.getElementById('btnAdminLogin');
    const originalText = btnLogin ? btnLogin.innerHTML : 'Log In';
    if (btnLogin) {
      btnLogin.disabled = true;
      btnLogin.innerHTML = 'Logging in...';
    }

    const result = await loginAdmin(email, password);
    
    if (btnLogin) {
      btnLogin.disabled = false;
      btnLogin.innerHTML = originalText;
    }

    if (result.success) {
      adminLoginForm.reset();
      checkAdminAuthState();
    } else {
      if (adminLoginError) {
        adminLoginError.textContent = result.error || 'Invalid credentials.';
        adminLoginError.style.display = 'block';
      }
    }
  });
}

if (btnAdminLogout) {
  btnAdminLogout.addEventListener('click', async () => {
    await logoutAdmin();
    checkAdminAuthState();
  });
}

if (btnOpenAddForm) {
  btnOpenAddForm.addEventListener('click', () => {
    hideProjectForm();
    showProjectForm(false);
  });
}

if (btnCancelForm) {
  btnCancelForm.addEventListener('click', () => {
    hideProjectForm();
  });
}

if (projectEditorForm) {
  projectEditorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = projectTitleInput.value.trim();
    const category = projectCategoryInput.value.trim();
    const demoUrl = projectDemoInput.value.trim() || '#';
    const githubUrl = projectGithubInput.value.trim() || '#';
    const tags = projectTagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const imageClass = projectImageClassSelect.value;
    const shortDescription = projectShortDescInput.value.trim();
    const description = projectDescInput.value.trim();

    const btnSave = document.getElementById('btnSaveProject');
    const originalText = btnSave ? btnSave.textContent : 'Save Project';
    if (btnSave) {
      btnSave.disabled = true;
      btnSave.textContent = 'Saving...';
    }

    const projectData = {
      title,
      category,
      demoUrl,
      githubUrl,
      tags,
      imageClass,
      shortDescription,
      description
    };

    const isEdit = editProjectId && editProjectId.value !== '';
    if (isEdit) {
      projectData.docId = editProjectDocId.value;
      await updateProject(editProjectId.value, projectData);
    } else {
      await addProject(projectData);
    }

    if (btnSave) {
      btnSave.disabled = false;
      btnSave.textContent = originalText;
    }

    hideProjectForm();
    await loadAndRenderProjects();
  });
}

// Initial projects loading
loadAndRenderProjects();


// ============================================
// --- 7. 2.5D ISOMETRIC GAME CANVAS ENGINE ---
// ============================================
const canvas = document.getElementById('gameCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const instructions = document.getElementById('gameInstructions');

  // Game coordinates and scaling
  let dpiWidth = 0;
  let dpiHeight = 0;
  let centerScreenX = 0;
  let centerScreenY = 0;
  
  // Game states
  const keys = {};
  let moved = false;
  let isWarping = false;
  let warpFactor = 1.0;
  let activePortal = null;
  let gameTime = 0;
  
  // 2.5D Isometric Coordinate mapping
  // scaleX: horizontal spread, scaleY: vertical compression (ratio 2:1 for standard isometric)
  const scaleX = 1.1;
  const scaleY = 0.55;

  function toScreen(isoX, isoY) {
    return {
      x: centerScreenX + (isoX - isoY) * scaleX,
      y: centerScreenY + (isoX + isoY) * scaleY
    };
  }

  function toIso(scrX, scrY) {
    const dx = (scrX - centerScreenX) / scaleX;
    const dy = (scrY - centerScreenY) / scaleY;
    return {
      x: (dx + dy) / 2,
      y: (dy - dx) / 2
    };
  }

  // Player state in Isometric Space
  const player = {
    isoX: 0,
    isoY: 0,
    radius: 14,
    speed: 3.8,
    vx: 0,
    vy: 0,
    friction: 0.83,
    tIsoX: null, // target Isometric X for clicks
    tIsoY: null, // target Isometric Y for clicks
    facing: 'right', // 'left' or 'right'
    walkCycle: 0
  };

  // Portals defined in Isometric Coordinates
  const portals = [
    {
      name: "ABOUT",
      hash: "about",
      isoX: -90,
      isoY: 90,
      radius: 28,
      color: '#6366f1',
      pulse: 0
    },
    {
      name: "PROJECTS",
      hash: "projects",
      isoX: 90,
      isoY: -90,
      radius: 28,
      color: '#14b8a6',
      pulse: 0
    },
    {
      name: "CONTACT",
      hash: "contact",
      isoX: 90,
      isoY: 90,
      radius: 28,
      color: '#a855f7',
      pulse: 0
    }
  ];

  // Ambient stars
  const stars = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: Math.random() * 2000,
      y: Math.random() * 600,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.1 + 0.05
    });
  }

  // --- RESIZE CONFIG (DPI & ISOMETRIC CENTER) ---
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    dpiWidth = rect.width;
    dpiHeight = rect.height;
    
    // Set screen projection center
    centerScreenX = dpiWidth / 2;
    centerScreenY = dpiHeight / 2 - 15; // slightly offset up
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // --- CONTROLS LISTENERS ---
  window.addEventListener('keydown', (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " "].includes(e.key)) {
      if (document.getElementById('home').classList.contains('active')) {
        e.preventDefault();
      }
    }
    keys[e.key.toLowerCase()] = true;
    triggerMovement();
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('mousedown', handlePointerMove);
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      handlePointerMove(e.touches[0]);
    }
  });

  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert click coordinates to Isometric space
    const clickIso = toIso(clickX, clickY);
    player.tIsoX = clickIso.x;
    player.tIsoY = clickIso.y;
    
    // Reset key velocities
    player.vx = 0;
    player.vy = 0;
    
    triggerMovement();
  }

  function triggerMovement() {
    if (!moved) {
      moved = true;
      if (instructions) {
        instructions.classList.add('fade-out');
      }
    }
  }

  // --- GAME ANIMATION LOOP ---
  function gameLoop() {
    gameTime += 0.05;
    
    // Clear screen
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, dpiWidth, dpiHeight);

    // 1. Draw Ambient Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    stars.forEach(star => {
      star.y += star.speed;
      if (star.y > dpiHeight) {
        star.y = 0;
        star.x = Math.random() * dpiWidth;
      }
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // 2. Draw Tilted 2.5D Isometric Grid Mesh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const bounds = 150;
    const step = 25;

    // Draw lines along isometric directions
    for (let i = -bounds; i <= bounds; i += step) {
      // Lines parallel to X-axis
      const p1Start = toScreen(-bounds, i);
      const p1End = toScreen(bounds, i);
      ctx.beginPath();
      ctx.moveTo(p1Start.x, p1Start.y);
      ctx.lineTo(p1End.x, p1End.y);
      ctx.stroke();

      // Lines parallel to Y-axis
      const p2Start = toScreen(i, -bounds);
      const p2End = toScreen(i, bounds);
      ctx.beginPath();
      ctx.moveTo(p2Start.x, p2Start.y);
      ctx.lineTo(p2End.x, p2End.y);
      ctx.stroke();
    }

    // 3. Render flat 2.5D Isometric Portals
    portals.forEach(portal => {
      portal.pulse += 0.045;
      const screenPos = toScreen(portal.isoX, portal.isoY);
      
      const pulseWidth = portal.radius + Math.sin(portal.pulse) * 3;
      const pulseHeight = pulseWidth * 0.5; // match 2:1 isometric ratio

      // Dynamic glowing aura
      const glowGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, pulseWidth + 16);
      glowGrad.addColorStop(0, portal.color + '40');
      glowGrad.addColorStop(0.6, portal.color + '15');
      glowGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, pulseWidth + 20, pulseHeight + 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flat Ellipse Portal Border
      ctx.strokeStyle = portal.color + 'cc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, pulseWidth, pulseHeight, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Core Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, portal.radius - 8, (portal.radius - 8) * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Text label centered above portal
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(portal.name, screenPos.x, screenPos.y - 12);
    });

    // 4. Update Physics
    if (!isWarping) {
      let dx = 0;
      let dy = 0;

      // Keyboard Controls (WASD / Arrows mapped to Isometric axes)
      // W/Up goes Up-Left (-Y direction), S/Down goes Down-Right (+Y direction)
      // A/Left goes Up-Right (-X direction), D/Right goes Down-Right (+X direction)
      if (keys['w'] || keys['arrowup']) { dx -= 1; dy -= 1; }
      if (keys['s'] || keys['arrowdown']) { dx += 1; dy += 1; }
      if (keys['a'] || keys['arrowleft']) { dx -= 1; dy += 1; }
      if (keys['d'] || keys['arrowright']) { dx += 1; dy -= 1; }

      if (dx !== 0 || dy !== 0) {
        player.tIsoX = null;
        player.tIsoY = null;
        
        const len = Math.sqrt(dx * dx + dy * dy);
        player.vx = (dx / len) * player.speed;
        player.vy = (dy / len) * player.speed;
        
        // Track orientation
        if (dx > 0) player.facing = 'right';
        if (dx < 0) player.facing = 'left';
        
        player.walkCycle += 0.22;
      } else {
        player.walkCycle *= 0.8; // smooth legs return to rest
      }

      // Mouse Seek Physics
      if (player.tIsoX !== null && player.tIsoY !== null) {
        const toX = player.tIsoX - player.isoX;
        const toY = player.tIsoY - player.isoY;
        const dist = Math.sqrt(toX * toX + toY * toY);

        if (dist > 3) {
          player.vx = (toX / dist) * player.speed;
          player.vy = (toY / dist) * player.speed;
          
          if (toX > 0) player.facing = 'right';
          if (toX < 0) player.facing = 'left';
          
          player.walkCycle += 0.22;
        } else {
          player.vx = 0;
          player.vy = 0;
          player.tIsoX = null;
          player.tIsoY = null;
        }
      }

      // Apply Friction & Update Coordinates
      player.isoX += player.vx;
      player.isoY += player.vy;
      player.vx *= player.friction;
      player.vy *= player.friction;

      // Isometric boundary check (keep inside diamond boundaries)
      const isoLimit = 130;
      if (player.isoX < -isoLimit) player.isoX = -isoLimit;
      if (player.isoX > isoLimit) player.isoX = isoLimit;
      if (player.isoY < -isoLimit) player.isoY = -isoLimit;
      if (player.isoY > isoLimit) player.isoY = isoLimit;

      // 5. Check portal collisions in isometric space
      portals.forEach(portal => {
        const distToPortal = Math.sqrt(Math.pow(player.isoX - portal.isoX, 2) + Math.pow(player.isoY - portal.isoY, 2));
        if (distToPortal < portal.radius - 8) {
          isWarping = true;
          activePortal = portal;
          warpFactor = 1.0;
        }
      });
    } else {
      // Warp Sequence: pull coordinates straight to portal center and shrink
      const toPortalX = activePortal.isoX - player.isoX;
      const toPortalY = activePortal.isoY - player.isoY;
      
      player.isoX += toPortalX * 0.15;
      player.isoY += toPortalY * 0.15;
      
      warpFactor -= 0.07;
      
      if (warpFactor <= 0) {
        // Warp complete! Reset player coordinates and redirect hash
        isWarping = false;
        player.isoX = 0;
        player.isoY = 0;
        player.vx = 0;
        player.vy = 0;
        player.tIsoX = null;
        player.tIsoY = null;
        
        window.location.hash = activePortal.hash;
        activePortal = null;
      }
    }

    // --- 6. RENDER 2.5D PROCEDURAL CHARACTER SPRITE ---
    const playerScreen = toScreen(player.isoX, player.isoY);
    
    // Draw elements
    const isMoving = Math.abs(player.vx) + Math.abs(player.vy) > 0.3;
    const idleBob = !isMoving ? Math.sin(gameTime * 2.5) * 0.8 : 0;
    const scale = isWarping ? Math.max(0, warpFactor) : 1.0;

    ctx.save();
    ctx.translate(playerScreen.x, playerScreen.y);
    ctx.scale(scale, scale);

    // A. Cast Flat Shadow (Isometric compressed)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bobbing offset for Torso/Head
    const yOffset = -5 + idleBob;
    const facingMultiplier = player.facing === 'left' ? -1 : 1;

    // B. Left and Right Legs (Alternating swing)
    const legSwing = isMoving ? Math.sin(player.walkCycle) * 6 : 0;
    
    ctx.strokeStyle = '#64748b'; // gray-blue pants
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    
    // Left Leg
    ctx.beginPath();
    ctx.moveTo(-3, -6);
    ctx.lineTo(-3 + legSwing, 0);
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    ctx.moveTo(3, -6);
    ctx.lineTo(3 - legSwing, 0);
    ctx.stroke();

    // C. Torso (Hoodie)
    const torsoGrad = ctx.createLinearGradient(-6, -18, 6, -6);
    torsoGrad.addColorStop(0, '#0f172a');
    torsoGrad.addColorStop(1, '#1e1b4b');
    
    ctx.fillStyle = torsoGrad;
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.5)'; // glowing teal trim
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-6, -20 + yOffset, 12, 14, 4);
    ctx.fill();
    ctx.stroke();

    // Cute Hoodie drawstrings / logo dot
    ctx.fillStyle = '#14b8a6';
    ctx.beginPath();
    ctx.arc(-2 * facingMultiplier, -13 + yOffset, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // D. Head (Visor helmet)
    ctx.fillStyle = '#0d1222';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(0, -26 + yOffset, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // E. Glowing Visor (Faces direction of movement)
    ctx.fillStyle = '#14b8a6';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#14b8a6';
    
    ctx.beginPath();
    if (player.facing === 'right') {
      ctx.roundRect(1, -28 + yOffset, 5, 3, 1.5);
    } else {
      ctx.roundRect(-6, -28 + yOffset, 5, 3, 1.5);
    }
    ctx.fill();
    
    ctx.restore();
    ctx.shadowBlur = 0; // reset glow

    requestAnimationFrame(gameLoop);
  }

  // Start game engine loop
  requestAnimationFrame(gameLoop);
}
