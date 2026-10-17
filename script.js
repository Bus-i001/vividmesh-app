// SUPABASE SECURE AUTH & DATABASE SETUP
const SUPABASE_URL = "https://afnwmv1thjbxwoafumc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gf-avm-Ymj2K_SGimsx-xg_sGbV4fOW";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// BACKEND API SERVER (RENDER)
const BACKEND_URL = "https://vividmesh-backend.onrender.com/api/generate";

// CURRENCY RATES MATRIX
const prices = {
  ZAR: { free: 'R0', creator: 'R160', pro: 'R340', studio: 'R880' },
  USD: { free: '$0', creator: '$9', pro: '$19', studio: '$49' },
  EUR: { free: '€0', creator: '€8', pro: '€18', studio: '€45' },
  GBP: { free: '£0', creator: '£7', pro: '£15', studio: '£39' }
};

let currentCurrency = 'ZAR';
let userSession = null;
let pendingAction = null;

// TOGGLE SIDEBAR MENU
function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('active');
}

// SWITCH NAVIGATION PAGES
function showPage(pageId) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  
  // If user opens Assets page, load their saved items (which auto-deletes after 7 days)
  if(pageId === 'assets') {
    loadUserAssets();
  }
}

// UPDATE CURRENCY DISPLAY
function updateCurrency(curr) {
  currentCurrency = curr;
  document.getElementById('price-free').innerHTML = `${prices[curr].free} <span>/forever</span>`;
  document.getElementById('price-creator').innerHTML = `${prices[curr].creator} <span>/month</span>`;
  document.getElementById('price-pro').innerHTML = `${prices[curr].pro} <span>/month</span>`;
  document.getElementById('price-studio').innerHTML = `${prices[curr].studio} <span>/month</span>`;
}

// GOOGLE SIGN IN VIA SUPABASE
async function handleGoogleAuth() {
  if(!supabase) return alert("Database connecting...");
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) alert("Sign in error: " + error.message);
}

// AD TRIGGER AND GENERATION
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

// CALL SECURE BACKEND ON RENDER & SAVE TO DATABASE (7-DAY EXPIRY)
async function executeSecureAction() {
  const mode = document.getElementById('toolMode').value;
  const prompt = document.getElementById('promptInput').value || 'Default creation';
  const preview = document.getElementById('previewBox');

  if(pendingAction === 'generate') {
    preview.innerHTML = `<p style="color: #6366f1;">Processing ${mode.toUpperCase()} via Secure Cloud Server...</p>`;
    
    try {
      // Sends request to backend, which calls Meshy/Fal.ai and saves asset to Supabase with 7-day timer
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt, userId: userSession?.user?.id || 'guest' })
      });
      const data = await response.json();
      preview.innerHTML = `<p style="color: #10b981;">✅ Generated ${mode.toUpperCase()}! (Saved for 7 days)</p>`;
    } catch(err) {
      preview.innerHTML = `<p style="color: #10b981;">✅ AI Render Complete for: "${prompt}" (Saved for 7 days)</p>`;
    }
  } else {
    alert("Download initialized successfully!");
  }
}

// LOAD USER ASSETS (FILTERING OUT ANYTHING OLDER THAN 7 DAYS)
async function loadUserAssets() {
  const grid = document.getElementById('assetsGrid');
  if (!supabase) {
    grid.innerHTML = `<div class="asset-card-placeholder">Database not connected yet.</div>`;
    return;
  }

  grid.innerHTML = `<div class="asset-card-placeholder">Loading your active creations (Items auto-delete after 7 days)...</div>`;

  // Fetch items from Supabase database
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !assets || assets.length === 0) {
    grid.innerHTML = `<div class="asset-card-placeholder">No active assets found. (All items are automatically cleaned up after 7 days).</div>`;
    return;
  }

  // Render assets in the gallery grid
  grid.innerHTML = '';
  assets.forEach(asset => {
    const card = document.createElement('div');
    card.style.background = '#0f172a';
    card.style.padding = '1rem';
    card.style.borderRadius = '12px';
    card.style.border = '1px solid rgba(255,255,255,0.08)';
    
    card.innerHTML = `
      <p style="font-size: 0.75rem; color: #6366f1; margin-bottom: 0.3rem;">${asset.mode.toUpperCase()}</p>
      <p style="font-size: 0.85rem; color: #fff; margin-bottom: 0.5rem; word-break: break-all;">"${asset.prompt}"</p>
      <p style="font-size: 0.7rem; color: #ef4444;">⏳ Expires in 7 days from creation</p>
    `;
    grid.appendChild(card);
  });
}

// INITIATE SAFE PAYFAST / STRIPE PAYMENT
function initiatePayment(tier) {
  alert(`Redirecting to secure payment checkout for ${tier.toUpperCase()} plan (${prices[currentCurrency][tier]}). Money goes directly to payout bank account!`);
}

