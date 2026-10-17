// SUPABASE & BACKEND CONFIG
const SUPABASE_URL = "https://afnmwv1thjbxwoafumc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gf-avm-Ymj2K_S6imsx-xg_sGbV4fOW";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const BACKEND_URL = "https://vividmesh-backend.onrender.com";

let currentMode = 'video';
let currentCurrency = 'USD';
let userSession = null;
let pendingAction = null;

// PRICES MATRIX
const prices = {
  ZAR: { free: 'R0', creator: 'R160', pro: 'R340' },
  USD: { free: '$0', creator: '$9', pro: '$19' },
  EUR: { free: '€0', creator: '€8', pro: '€18' },
  GBP: { free: '£0', creator: '£7', pro: '£15' }
};

// TOGGLE SIDEBAR MENU
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

// SWITCH PAGE (Create, Assets, Subscriptions)
function showPage(pageId) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  toggleMenu();
}

// SWITCH CREATION MODE (Video, Image, 3D)
function switchCreateMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${mode}`).classList.add('active');

  document.querySelectorAll('.mode-opts').forEach(opt => opt.classList.add('hidden'));
  document.getElementById(`opts-${mode}`).classList.remove('hidden');
}

// OPTION BUTTON SELECTOR (e.g., 8s, 1080p, 16:9)
function selectOpt(groupId, el) {
  const container = document.getElementById(groupId);
  container.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// UPDATE CURRENCY DISPLAY ON SUBSCRIPTION PAGE
function updateCurrency(curr) {
  currentCurrency = curr;
  document.getElementById('price-free').innerHTML = `${prices[curr].free} <span>/forever</span>`;
  document.getElementById('price-creator').innerHTML = `${prices[curr].creator} <span>/month</span>`;
  document.getElementById('price-pro').innerHTML = `${prices[curr].pro} <span>/month</span>`;
}

// GOOGLE SIGN IN
async function handleGoogleAuth() {
  if (!supabase) return alert("Database connecting...");
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) alert("Sign in error: " + error.message);
}

// AD TRIGGER BEFORE ACTION
function triggerAdAndGenerate() {
  pendingAction = 'generate';
  showAdModal();
}

function triggerAdAndDownload() {
  pendingAction = 'download';
  showAdModal();
}

function showAdModal() {
  const modal = document.getElementById('adModal');
  const timerElem = document.getElementById('timerCount');
  let timeLeft = 5;

  modal.style.display = 'flex';
  timerElem.innerText = timeLeft;

  const interval = setInterval(() => {
    timeLeft--;
    timerElem.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      modal.style.display = 'none';
      executeSecureAction();
    }
  }, 1000);
}

// CALL BACKEND PROXY
async function executeSecureAction() {
  const preview = document.getElementById('outputPreview');
  const prompt = document.getElementById('promptInput').value || 'Default generation';

  if (pendingAction === 'generate') {
    preview.innerHTML = `<p style="color: #60a5fa;">Processing ${currentMode.toUpperCase()} request via Secure Server...</p>`;
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: currentMode, prompt, userId: userSession?.user?.id || 'guest' })
      });
      const data = await response.json();
      preview.innerHTML = `<p style="color: #10b981;">Generated ${currentMode.toUpperCase()} Output Ready!</p>`;
    } catch (err) {
      preview.innerHTML = `<p style="color: #f87171;">Demo Output generated for: "${prompt}"</p>`;
    }
  } else {
    alert("Download started!");
  }
}

function initiatePayment(plan) {
  alert(`Redirecting to secure checkout for ${plan.toUpperCase()} plan (${prices[currentCurrency][plan]})...`);
    }
    
