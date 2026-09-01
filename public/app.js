/**
 * YouTube Taste Blend - Client Application Engine & i18n
 */

const MAX_SELECTABLE_CHANNELS = 100;
const CHANNELS_PER_PAGE = 40;

const RANDOM_NICKNAMES = {
  'zh-TW': [
    '深夜探險家', '冷門寶藏獵人', '演算法叛徒', '迷因品味家', '知識狂熱者', 
    '星際拓荒者', '微縮時空旅人', '終極推坑王', '數位遊俠', '復古品味家',
    '深海潛航者', '鍵盤探險家', '超時空觀察員'
  ],
  'en-US': [
    'Midnight Explorer', 'Hidden Gem Hunter', 'Algorithm Rebel', 'Meme Connoisseur', 'Science Junkie',
    'Cosmic Nomad', 'Indie Taste Scout', 'Ultimate Curator', 'Cyber Voyager', 'Retro Soul',
    'Deep Sea Diver', 'Keyboard Nomad', 'Spacetime Watcher'
  ]
};

const I18N = {
  'zh-TW': {
    brand_title: 'YouTube Taste Blend',
    brand_subtitle: 'YouTube 品味雷達 · 零存儲隱私比對',
    zero_storage_badge: '100% 零伺服器存儲',
    nav_create_challenge: '我要發起挑戰',
    nav_duel_friend: '我想跟朋友比對',
    lang_name: 'English',
    step1_badge: 'Step 1: 建立你的專屬品味包',
    hero_title_1: '看看你跟好友的 ',
    hero_title_highlight: 'YouTube 品味契合度',
    hero_title_2: ' 有多高？',
    hero_desc: '授權或載入你的訂閱清單，勾選想公開的頻道。系統會透過 16-byte 二進位壓縮編碼進網址，後端完全不保存任何隱私紀錄。',
    manage_subs: '管理公開訂閱清單',
    manage_subs_desc: '可搜尋與取消勾選不想讓好友知道的私人/敏感頻道',
    btn_google_login: '登入 Google 同步',
    btn_mock_data: '一鍵示範資料',
    label_nickname: '你的暱稱：',
    label_search: '快速搜尋頻道：',
    label_category_filter: '分類篩選：',
    search_placeholder: '輸入關鍵字篩選...',
    filter_all: '全部',
    filter_indie: '✨ 僅小眾寶藏',
    selected_text: '已選擇',
    max_limit_text: '(上限 100 個)',
    select_all: '選取上限',
    deselect_all: '全取消',
    quick_presets: '快速預選：',
    preset_recent_50: '⚡ 最新活躍前 50 個',
    preset_recent_100: '⚡ 最新活躍前 100 個',
    preset_indie_only: '✨ 僅小眾寶藏',
    btn_generate_url: '生成專屬品味邀請連結 (#u1)',
    receiver_badge: '收到品味挑戰！',
    receiver_title_suffix: ' 邀請你進行 YouTube 品味大對決！',
    receiver_desc: '匯入你的 YouTube 訂閱，看看你們的常看頻道重疊率有多高，誰才是彼此的終極推坑王！',
    receiver_config_title: '設定你的比對清單',
    receiver_config_desc: '已成功載入好友的加密品味數據',
    btn_start_blend: '開始比對！揭曉契合度報告',
    stat_common: '共同訂閱',
    stat_a_only: 'A 獨有推坑',
    stat_b_only: 'B 獨有推坑',
    stat_indie: '小眾寶藏',
    btn_download_card: '下載 IG Story / Threads 比對圖卡',
    btn_share_as_b: '換我發起挑戰 (打包我的邀請網址)',
    channel_list_title: '頻道清單與推坑清冊',
    tab_common: '共同喜愛',
    tab_a_only: 'A 推薦',
    tab_b_only: 'B 推薦',
    tab_indie: '✨ 小眾寶藏',
    btn_visit_channel: '前往頻道',
    indie_tag: '✨ 寶藏',
    subs_count: '訂閱',
    updated_today: '🔥 今天更新',
    updated_yesterday: '🔥 昨天更新',
    updated_days_ago: '🔥 {n}天前更新',
    updated_this_week: '本週更新',
    active_channel: '持續活躍',
    btn_random_name: '隨機匿名',
    btn_test_as_receiver: '🚀 立即以好友視角測試比對',
    page_prev: '◀ 上一頁',
    page_next: '下一頁 ▶',
    page_info: '第 {current} / {total} 頁 (共 {count} 個頻道)',
    modal_share_title: '專屬品味邀請網址已產生！',
    modal_share_desc: '複製網址發送給好友，或讓好友直接掃描 QR Code 即可進行比對。',
    modal_share_label: '專屬分享網址 (含 16-Byte Brotli Hash)：',
    btn_copy: '複製',
    copied_toast: '已複製連結至剪貼簿！',
    toast_generating: '專屬品味邀請連結已生成！',
    toast_loaded: '成功載入頻道！已自動預選最新活躍頻道。',
    toast_real_loaded: '🎉 成功從 Google 同步您的真實 YouTube 訂閱頻道！',
    toast_blending: '正在比對你們的品味雷達...',
    toast_card_success: '圖卡已成功下載！',
    toast_preset_50: '已為您快速預選最新活躍前 {n} 個頻道！',
    toast_preset_indie: '已為您選取 {n} 個小眾寶藏頻道！',
    limit_reached_toast: '⚠️ 已達到單次分享上限 (最多 100 個頻道)！如需新增請先取消勾選其他項目。',
    oauth_modal_title: 'Google OAuth 設定說明',
    oauth_modal_desc: '如欲使用真正的 Google 帳號授權同步訂閱，請完成以下 3 個簡單步驟：',
    oauth_step1: '1. 至 Google Cloud Console 啟用 YouTube Data API v3。',
    oauth_step2: '2. 建立 OAuth 2.0 憑證，並將重新導向 URI 設定為：',
    oauth_step3: '3. 將 Client ID 與 Secret 填入專案的 .env 檔案並重啟。',
    oauth_tip: '💡 提示：在尚未設定金鑰前，您可以點擊【一鍵示範資料】直接進行全功能體驗！'
  },
  'en-US': {
    brand_title: 'YouTube Taste Blend',
    brand_subtitle: 'YouTube Taste Radar · Zero-Storage Privacy Blend',
    zero_storage_badge: '100% Zero-Storage',
    nav_create_challenge: 'Create Challenge',
    nav_duel_friend: 'Duel with Friend',
    lang_name: '繁體中文',
    step1_badge: 'Step 1: Create Your Taste Pack',
    hero_title_1: 'Discover Your ',
    hero_title_highlight: 'YouTube Taste Blend',
    hero_title_2: ' With Friends!',
    hero_desc: 'Import your subscriptions and select public channels. Packed using 16-byte binary Brotli compression directly in the URL fragment with 0 server storage.',
    manage_subs: 'Manage Public Subscriptions',
    manage_subs_desc: 'Search and uncheck any private channels you prefer not to reveal',
    btn_google_login: 'Google Sync',
    btn_mock_data: 'Load Sample Data',
    label_nickname: 'Your Nickname:',
    label_search: 'Search Channels:',
    label_category_filter: 'Categories:',
    search_placeholder: 'Filter by keywords...',
    filter_all: 'All',
    filter_indie: '✨ Indie Gems Only',
    selected_text: 'Selected',
    max_limit_text: '(Max 100)',
    select_all: 'Select to Max',
    deselect_all: 'Deselect All',
    quick_presets: 'Quick Presets:',
    preset_recent_50: '⚡ Top 50 Active',
    preset_recent_100: '⚡ Top 100 Active',
    preset_indie_only: '✨ Indie Only',
    btn_generate_url: 'Generate Taste Invite Link (#u1)',
    receiver_badge: 'Taste Duel Challenge!',
    receiver_title_suffix: ' invited you to a Taste Blend Duel!',
    receiver_desc: 'Import your YouTube subscriptions to compare taste overlap and find out who has the best recommendations!',
    receiver_config_title: 'Configure Your Match List',
    receiver_config_desc: "Successfully loaded your friend's encrypted taste data",
    btn_start_blend: 'Start Blend! Reveal Taste Report',
    stat_common: 'Common Subs',
    stat_a_only: "A's Unique",
    stat_b_only: "B's Unique",
    stat_indie: 'Indie Gems',
    btn_download_card: 'Download IG Story / Threads Card',
    btn_share_as_b: 'My Turn to Challenge (Share My Link)',
    channel_list_title: 'Channel Recommendations & Details',
    tab_common: 'Common',
    tab_a_only: 'A Recommends',
    tab_b_only: 'B Recommends',
    tab_indie: '✨ Indie Gems',
    btn_visit_channel: 'Visit Channel',
    indie_tag: '✨ Gem',
    subs_count: 'subs',
    updated_today: '🔥 Updated today',
    updated_yesterday: '🔥 Updated yesterday',
    updated_days_ago: '🔥 {n}d ago',
    updated_this_week: 'Updated this week',
    active_channel: 'Active channel',
    btn_random_name: 'Random Anon',
    btn_test_as_receiver: '🚀 Test as Receiver Instantly',
    page_prev: '◀ Prev',
    page_next: 'Next ▶',
    page_info: 'Page {current} / {total} ({count} channels)',
    modal_share_title: 'Your Taste Invite Link is Ready!',
    modal_share_desc: 'Copy the link to your friend or let them scan the QR code to duel.',
    modal_share_label: 'Custom Share Link (with 16-Byte Brotli Hash):',
    btn_copy: 'Copy',
    copied_toast: 'Link copied to clipboard!',
    toast_generating: 'Taste invite link generated!',
    toast_loaded: 'Channels loaded! Auto pre-selected recent active channels.',
    toast_real_loaded: '🎉 Successfully synced real YouTube subscriptions from Google!',
    toast_blending: 'Analyzing your taste blend...',
    toast_card_success: 'Story card downloaded successfully!',
    toast_preset_50: 'Pre-selected top {n} active channels!',
    toast_preset_indie: 'Selected {n} indie gem channels!',
    limit_reached_toast: '⚠️ Maximum limit reached (100 channels)! Please uncheck others to add more.',
    oauth_modal_title: 'Google OAuth Setup Guide',
    oauth_modal_desc: 'To sync real YouTube subscriptions with Google, follow these 3 simple steps:',
    oauth_step1: '1. Enable YouTube Data API v3 in Google Cloud Console.',
    oauth_step2: '2. Create OAuth 2.0 Credentials with Redirect URI set to:',
    oauth_step3: '3. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env and restart.',
    oauth_tip: '💡 Tip: You can click [Load Sample Data] to experience all features right now without setting up keys!'
  }
};

const CATEGORY_TRANSLATIONS = {
  '科技': { zh: '科技', en: 'Tech' },
  '程式開發': { zh: '程式開發', en: 'Dev' },
  '科普': { zh: '科普', en: 'Science' },
  '知識': { zh: '知識', en: 'Knowledge' },
  '時事社會': { zh: '時事社會', en: 'Society' },
  '時事政經': { zh: '時事政經', en: 'Politics' },
  '商業理財': { zh: '商業理財', en: 'Finance' },
  '遊戲': { zh: '遊戲', en: 'Gaming' },
  '娛樂': { zh: '娛樂', en: 'Entertainment' },
  '影視娛樂': { zh: '影視娛樂', en: 'Film/TV' },
  '音樂': { zh: '音樂', en: 'Music' },
  '生活風格': { zh: '生活風格', en: 'Lifestyle' },
  '美食料理': { zh: '美食料理', en: 'Food' },
  '運動健身': { zh: '運動健身', en: 'Sports' },
  '手作興趣': { zh: '手作興趣', en: 'Hobby' },
  '動漫': { zh: '動漫', en: 'Anime' },
  '汽機車': { zh: '汽機車', en: 'Auto' },
  '綜合': { zh: '綜合', en: 'General' }
};

const AppState = {
  lang: localStorage.getItem('taste_lang') || 'zh-TW',
  mode: 'creator', // 'creator' | 'receiver' | 'result'
  isAuthenticated: false,
  pageA: 1,
  pageB: 1,
  userA: {
    name: 'Alice',
    channels: [],
    selectedIds: new Set(),
    payload: ''
  },
  userB: {
    name: 'Bob',
    channels: [],
    selectedIds: new Set(),
    payload: ''
  },
  blendResult: null,
  activeFilterA: 'all',
  searchQueryA: '',
  activeFilterB: 'all',
  searchQueryB: '',
  activeResultTab: 'common'
};

function t(key, vars = {}) {
  const dict = I18N[AppState.lang] || I18N['zh-TW'];
  let text = dict[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

function getCategoryDisplayName(catKey) {
  const isEn = AppState.lang === 'en-US';
  if (CATEGORY_TRANSLATIONS[catKey]) {
    return isEn ? CATEGORY_TRANSLATIONS[catKey].en : CATEGORY_TRANSLATIONS[catKey].zh;
  }
  return catKey;
}

function formatLastActive(daysAgo) {
  if (daysAgo === 0) return t('updated_today');
  if (daysAgo === 1) return t('updated_yesterday');
  if (daysAgo >= 2 && daysAgo <= 6) return t('updated_days_ago', { n: daysAgo });
  if (daysAgo >= 7 && daysAgo <= 13) return t('updated_this_week');
  return t('active_channel');
}

function generateRandomNickname(target = 'A') {
  const pool = RANDOM_NICKNAMES[AppState.lang] || RANDOM_NICKNAMES['zh-TW'];
  const randomName = pool[Math.floor(Math.random() * pool.length)];
  const inputEl = document.getElementById(target === 'A' ? 'inputUserAName' : 'inputUserBName');
  if (inputEl) {
    inputEl.value = randomName;
    if (target === 'A') AppState.userA.name = randomName;
    else AppState.userB.name = randomName;
  }
}

function toggleLanguage() {
  AppState.lang = AppState.lang === 'zh-TW' ? 'en-US' : 'zh-TW';
  localStorage.setItem('taste_lang', AppState.lang);
  applyTranslations();
  renderCategoryTabs('A');
  renderCategoryTabs('B');
  renderChannelSelection('A');
  renderChannelSelection('B');
  if (AppState.blendResult) {
    renderBlendResultsView();
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerText = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  document.getElementById('langToggleBtn').innerText = t('lang_name');
}

function openOAuthModal() {
  document.getElementById('modalOAuthGuide').classList.remove('hidden');
}

function closeOAuthModal() {
  document.getElementById('modalOAuthGuide').classList.add('hidden');
}

function startGoogleAuth(target = 'A') {
  const currentHash = window.location.hash || '';
  const returnTo = `/?target=${target}&logged_in=1${currentHash}`;
  window.location.href = `/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
}

// Toast helper
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const bgColors = {
    info: 'bg-slate-800 text-slate-100 border-slate-700',
    success: 'bg-emerald-950 text-emerald-200 border-emerald-800',
    warning: 'bg-amber-950 text-amber-200 border-amber-800',
    error: 'bg-rose-950 text-rose-200 border-rose-800'
  };

  toast.className = `px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald-400' : type === 'warning' ? 'fa-triangle-exclamation text-amber-400' : type === 'error' ? 'fa-circle-xmark text-rose-400' : 'fa-circle-info text-indigo-400'}"></i> <span>${message}</span>`;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function setAppMode(mode) {
  AppState.mode = mode;
  document.getElementById('viewCreator').classList.add('hidden');
  document.getElementById('viewReceiver').classList.add('hidden');
  document.getElementById('viewResult').classList.add('hidden');

  const navCreator = document.getElementById('navBtnCreator');
  const navReceiver = document.getElementById('navBtnReceiver');

  if (mode === 'creator') {
    document.getElementById('viewCreator').classList.remove('hidden');
    navCreator.className = 'px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 bg-rose-600 text-white shadow-md';
    navReceiver.className = 'px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-slate-200';
  } else if (mode === 'receiver') {
    document.getElementById('viewReceiver').classList.remove('hidden');
    navCreator.className = 'px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-slate-200';
    navReceiver.className = 'px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 bg-purple-600 text-white shadow-md';
    document.getElementById('receiverInviterName').innerText = AppState.userA.name;
    document.getElementById('receiverInviterBadge').innerText = AppState.userA.name;
  } else if (mode === 'result') {
    document.getElementById('viewResult').classList.remove('hidden');
    document.getElementById('viewResult').scrollIntoView({ behavior: 'smooth' });
  }
}

// Check auth status and auto-fetch real subscriptions if logged in
async function initAuthAndSubscriptions() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetParam = urlParams.get('target');
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  const u1Payload = hashParams.get('u1');
  const u1Name = hashParams.get('name');

  if (urlParams.get('oauth_help')) {
    openOAuthModal();
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }

  if (urlParams.get('auth_error')) {
    showToast('Google OAuth 授權失敗: ' + urlParams.get('auth_error'), 'error');
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }

  // Handle incoming invite link
  if (u1Payload) {
    AppState.userA.payload = u1Payload;
    AppState.userA.name = u1Name || 'Friend';
    setAppMode('receiver');
  } else {
    setAppMode('creator');
  }

  try {
    const statusRes = await fetch('/auth/status');
    const statusData = await statusRes.json();
    AppState.isAuthenticated = statusData.authenticated;

    if (AppState.isAuthenticated) {
      const activeTarget = (targetParam === 'B' || AppState.mode === 'receiver') ? 'B' : 'A';
      
      const subRes = await fetch('/api/subscriptions');
      const subData = await subRes.json();

      if (subData.channels && subData.channels.length > 0) {
        const user = activeTarget === 'A' ? AppState.userA : AppState.userB;
        user.channels = subData.channels;
        
        if (statusData.profileName) {
          user.name = statusData.profileName;
          const nameInput = document.getElementById(activeTarget === 'A' ? 'inputUserAName' : 'inputUserBName');
          if (nameInput) nameInput.value = statusData.profileName;
        }

        const initialSelected = subData.channels.slice(0, Math.min(50, MAX_SELECTABLE_CHANNELS));
        user.selectedIds = new Set(initialSelected.map(c => c.id));
        
        renderCategoryTabs(activeTarget);
        renderChannelSelection(activeTarget);

        // Preload the other user's sample data so duel is instantly runnable
        if (activeTarget === 'A') {
          await loadSubscriptions('B', 'B', false);
        } else {
          if (AppState.userA.channels.length === 0 && !AppState.userA.payload) {
            await loadSubscriptions('A', 'A', false);
          }
          setAppMode('receiver');
        }

        showToast(t('toast_real_loaded'), 'success');
        return;
      }
    }
  } catch (e) {
    console.error('Error checking auth', e);
  }

  // Fallback to sample data for both sides
  await loadSubscriptions('A', 'A', false);
  await loadSubscriptions('B', 'B', false);
}

// Load Subscriptions (Explicit Mock or fallback)
async function loadSubscriptions(target = 'A', profile = 'A', showNotice = true) {
  try {
    const res = await fetch(`/api/mock/subscriptions?profile=${profile}`);
    const data = await res.json();
    
    const user = target === 'A' ? AppState.userA : AppState.userB;
    user.channels = data.channels;
    
    const initialSelected = data.channels.slice(0, Math.min(50, MAX_SELECTABLE_CHANNELS));
    user.selectedIds = new Set(initialSelected.map(c => c.id));
    
    if (target === 'A') AppState.pageA = 1;
    else AppState.pageB = 1;

    renderCategoryTabs(target);
    renderChannelSelection(target);
    if (showNotice) {
      showToast(t('toast_loaded'), 'success');
    }
  } catch (err) {
    if (showNotice) showToast('Failed to load: ' + err.message, 'error');
  }
}

// Dynamically Render Category Filter Tabs based on currently loaded channels
function renderCategoryTabs(target = 'A') {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  const tabsContainer = document.getElementById(target === 'A' ? 'categoryTabsA' : 'categoryTabsB');
  const activeFilter = target === 'A' ? AppState.activeFilterA : AppState.activeFilterB;

  if (!tabsContainer) return;

  const categoryCounts = {};
  let indieCount = 0;

  user.channels.forEach(c => {
    const cat = c.category || '綜合';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (c.isIndie) indieCount++;
  });

  const categories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

  let html = `
    <button onclick="setCategoryFilter('${target}', 'all')" class="px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeFilter === 'all' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}">
      <span>${t('filter_all')}</span>
      <span class="text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'all' ? 'bg-rose-950 text-rose-200' : 'bg-slate-800 text-slate-400'}">${user.channels.length}</span>
    </button>
  `;

  if (indieCount > 0) {
    html += `
      <button onclick="setCategoryFilter('${target}', 'indie')" class="px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeFilter === 'indie' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800'}">
        <span>${t('filter_indie')}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'indie' ? 'bg-amber-950 text-amber-200' : 'bg-slate-800 text-amber-400'}">${indieCount}</span>
      </button>
    `;
  }

  categories.forEach(cat => {
    const count = categoryCounts[cat];
    const isSelected = activeFilter === cat;
    const displayName = getCategoryDisplayName(cat);

    html += `
      <button onclick="setCategoryFilter('${target}', '${cat}')" class="px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${isSelected ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}">
        <span>${displayName}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-rose-950 text-rose-200' : 'bg-slate-800 text-slate-400'}">${count}</span>
      </button>
    `;
  });

  tabsContainer.innerHTML = html;
}

function setCategoryFilter(target, catKey) {
  if (target === 'A') {
    AppState.activeFilterA = catKey;
    AppState.pageA = 1;
  } else {
    AppState.activeFilterB = catKey;
    AppState.pageB = 1;
  }
  renderCategoryTabs(target);
  renderChannelSelection(target);
}

function changePage(target, pageDelta) {
  if (target === 'A') {
    AppState.pageA += pageDelta;
  } else {
    AppState.pageB += pageDelta;
  }
  renderChannelSelection(target);
}

function goToPage(target, pageNum) {
  if (target === 'A') {
    AppState.pageA = pageNum;
  } else {
    AppState.pageB = pageNum;
  }
  renderChannelSelection(target);
}

// Render Channel Selection List with High-Performance Pagination
function renderChannelSelection(target = 'A') {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  const listEl = document.getElementById(target === 'A' ? 'channelsListA' : 'channelsListB');
  const countEl = document.getElementById(target === 'A' ? 'selectedCountA' : 'selectedCountB');
  const totalEl = document.getElementById(target === 'A' ? 'totalCountA' : 'totalCountB');
  const paginationEl = document.getElementById(target === 'A' ? 'paginationA' : 'paginationB');
  const query = target === 'A' ? AppState.searchQueryA.toLowerCase() : AppState.searchQueryB.toLowerCase();
  const filterCat = target === 'A' ? AppState.activeFilterA : AppState.activeFilterB;

  if (!listEl) return;

  const filtered = user.channels.filter(c => {
    const cat = c.category || '綜合';
    const matchesQuery = c.title.toLowerCase().includes(query) || cat.toLowerCase().includes(query);
    const matchesCat = filterCat === 'all' || (filterCat === 'indie' && c.isIndie) || cat === filterCat;
    return matchesQuery && matchesCat;
  });

  const selectedCount = user.selectedIds.size;
  countEl.innerText = selectedCount;
  totalEl.innerText = user.channels.length;

  if (selectedCount >= MAX_SELECTABLE_CHANNELS) {
    countEl.classList.add('text-amber-400');
  } else {
    countEl.classList.remove('text-amber-400');
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-xs"><i class="fa-solid fa-filter-circle-xmark text-lg mb-2 block"></i>無符合篩選條件的頻道 (No channels match filter)</div>`;
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / CHANNELS_PER_PAGE) || 1;
  let currentPage = target === 'A' ? AppState.pageA : AppState.pageB;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  if (target === 'A') AppState.pageA = currentPage;
  else AppState.pageB = currentPage;

  const startIndex = (currentPage - 1) * CHANNELS_PER_PAGE;
  const endIndex = Math.min(startIndex + CHANNELS_PER_PAGE, filtered.length);
  const pagedItems = filtered.slice(startIndex, endIndex);

  // Render items (ultra fast)
  listEl.innerHTML = pagedItems.map(c => {
    const isChecked = user.selectedIds.has(c.id);
    const activeText = formatLastActive(c.lastActiveDaysAgo ?? 14);
    const cat = c.category || '綜合';
    const displayCategory = getCategoryDisplayName(cat);

    return `
      <div class="flex items-center justify-between p-3 rounded-xl ${isChecked ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-900/40 border-slate-800/60 opacity-60'} border hover:border-slate-600 transition cursor-pointer" onclick="toggleChannelSelect('${target}', '${c.id}')">
        <div class="flex items-center gap-3 truncate mr-2">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleChannelSelect('${target}', '${c.id}')" class="w-4 h-4 rounded text-rose-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
          <div class="truncate">
            <p class="font-bold text-xs text-slate-200 truncate">${c.title}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] text-emerald-400 font-medium">${activeText}</span>
              ${c.subscriberCount ? `<span class="text-[10px] text-slate-400">${formatSubscriberCount(c.subscriberCount)} ${t('subs_count')}</span>` : ''}
              ${c.isIndie ? `<span class="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 text-[10px] border border-amber-800/80">${t('indie_tag')}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">${displayCategory}</span>
        </div>
      </div>
    `;
  }).join('');

  // Render pagination controls
  if (paginationEl) {
    if (totalPages <= 1) {
      paginationEl.innerHTML = `<span class="text-[11px] text-slate-500">${t('page_info', { current: 1, total: 1, count: filtered.length })}</span>`;
    } else {
      const isFirst = currentPage === 1;
      const isLast = currentPage === totalPages;

      paginationEl.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="changePage('${target}', -1)" ${isFirst ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold border ${isFirst ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} transition">
            ${t('page_prev')}
          </button>
          <button onclick="changePage('${target}', 1)" ${isLast ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold border ${isLast ? 'bg-slate-900/40 text-slate-600 border-slate-800/40 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} transition">
            ${t('page_next')}
          </button>
        </div>
        <div class="text-[11px] text-slate-400 font-medium">
          ${t('page_info', { current: currentPage, total: totalPages, count: filtered.length })}
        </div>
      `;
    }
  }
}

// Toggle Channel Selection with MAX limit checking
function toggleChannelSelect(target, id) {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  if (user.selectedIds.has(id)) {
    user.selectedIds.delete(id);
  } else {
    if (user.selectedIds.size >= MAX_SELECTABLE_CHANNELS) {
      showToast(t('limit_reached_toast'), 'warning');
      return;
    }
    user.selectedIds.add(id);
  }
  renderChannelSelection(target);
}

// Quick pre-select top N active channels across all items
function selectTopActive(target, count = 50) {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  user.selectedIds.clear();
  const limit = Math.min(count, MAX_SELECTABLE_CHANNELS, user.channels.length);
  for (let i = 0; i < limit; i++) {
    user.selectedIds.add(user.channels[i].id);
  }
  renderChannelSelection(target);
  showToast(t('toast_preset_50', { n: user.selectedIds.size }), 'info');
}

// Select only Indie gems across all items
function selectIndieOnly(target) {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  user.selectedIds.clear();
  const indieList = user.channels.filter(c => c.isIndie).slice(0, MAX_SELECTABLE_CHANNELS);
  indieList.forEach(c => user.selectedIds.add(c.id));
  renderChannelSelection(target);
  showToast(t('toast_preset_indie', { n: user.selectedIds.size }), 'info');
}

function selectAllChannels(target, selectAll = true) {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  if (selectAll) {
    user.selectedIds.clear();
    const limit = Math.min(MAX_SELECTABLE_CHANNELS, user.channels.length);
    for (let i = 0; i < limit; i++) {
      user.selectedIds.add(user.channels[i].id);
    }
    if (user.channels.length > MAX_SELECTABLE_CHANNELS) {
      showToast(t('limit_reached_toast'), 'info');
    }
  } else {
    user.selectedIds.clear();
  }
  renderChannelSelection(target);
}

function formatSubscriberCount(count) {
  if (AppState.lang === 'zh-TW') {
    if (count >= 10000000) return (count / 10000000).toFixed(1) + ' 千萬';
    if (count >= 10000) return (count / 10000).toFixed(1) + ' 萬';
    return count.toLocaleString();
  } else {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toLocaleString();
  }
}

// Generate Share URL (User A)
async function generateShareUrl() {
  const name = document.getElementById('inputUserAName').value.trim() || 'Alice';
  AppState.userA.name = name;

  const selectedChannels = AppState.userA.channels.filter(c => AppState.userA.selectedIds.has(c.id));
  if (selectedChannels.length === 0) {
    showToast('Please select at least 1 channel!', 'warning');
    return;
  }

  try {
    const channelIds = selectedChannels.map(c => c.id);
    const res = await fetch('/api/pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelIds })
    });
    const data = await res.json();

    if (data.success) {
      AppState.userA.payload = data.payload;
      const shareUrl = `${window.location.origin}/#u1=${data.payload}&name=${encodeURIComponent(name)}`;
      
      document.getElementById('outputShareUrl').value = shareUrl;
      document.getElementById('modalShareLink').classList.remove('hidden');

      const qrContainer = document.getElementById('qrcodeContainer');
      qrContainer.innerHTML = '';
      if (window.QRCode) {
        new QRCode(qrContainer, {
          text: shareUrl,
          width: 140,
          height: 140,
          colorDark: '#0f172a',
          colorLight: '#ffffff'
        });
      }

      showToast(t('toast_generating'), 'success');
    }
  } catch (err) {
    showToast('Generation failed: ' + err.message, 'error');
  }
}

function testAsReceiverFromModal() {
  document.getElementById('modalShareLink').classList.add('hidden');
  setAppMode('receiver');
  window.history.pushState({}, document.title, `/#u1=${AppState.userA.payload}&name=${encodeURIComponent(AppState.userA.name)}`);
}

function copyToClipboard(elementId) {
  const input = document.getElementById(elementId);
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast(t('copied_toast'), 'success');
}

// User B starts Blend with User A
async function runBlendWithUserA() {
  const nameB = document.getElementById('inputUserBName').value.trim() || 'Bob';
  AppState.userB.name = nameB;

  const selectedChannelsB = AppState.userB.channels.filter(c => AppState.userB.selectedIds.has(c.id));
  if (selectedChannelsB.length === 0) {
    showToast('Please select at least 1 channel!', 'warning');
    return;
  }

  showToast(t('toast_blending'), 'info');

  try {
    const selectedChannelsA = AppState.userA.channels.filter(c => AppState.userA.selectedIds.has(c.id));
    
    // If User A has channels in memory, pass them directly
    const userABody = selectedChannelsA.length > 0
      ? { name: AppState.userA.name, channels: selectedChannelsA }
      : { name: AppState.userA.name, payload: AppState.userA.payload };

    const res = await fetch('/api/blend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userA: userABody,
        userB: {
          name: nameB,
          channels: selectedChannelsB
        }
      })
    });

    const data = await res.json();
    if (data.success) {
      AppState.blendResult = data.result;
      renderBlendResultsView();
      setAppMode('result');

      if (window.confetti) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  } catch (err) {
    showToast('Blend calculation failed: ' + err.message, 'error');
  }
}

function renderBlendResultsView() {
  const res = AppState.blendResult;
  if (!res) return;

  const isEn = AppState.lang === 'en-US';
  const nameA = res.userA.name || 'User A';
  const nameB = res.userB.name || 'User B';

  document.getElementById('resUserAName').innerText = nameA;
  document.getElementById('resUserBName').innerText = nameB;
  document.getElementById('resChemistryLevel').innerText = isEn ? res.stats.chemistryLevelEn : res.stats.chemistryLevel;
  document.getElementById('resMatchScore').innerText = `${res.stats.matchPercentage}%`;
  document.getElementById('resChemistryDesc').innerText = isEn ? res.stats.chemistryDescriptionEn : res.stats.chemistryDescription;

  document.getElementById('resCountCommon').innerText = res.stats.commonCount;
  document.getElementById('resCountAOnly').innerText = res.stats.aOnlyCount;
  document.getElementById('resCountBOnly').innerText = res.stats.bOnlyCount;
  document.getElementById('resCountIndie').innerText = res.indieGems.length;

  const lblStatA = document.getElementById('lblStatAOnly');
  if (lblStatA) lblStatA.innerText = isEn ? `${nameA}'s Unique` : `${nameA} 獨有推坑`;

  const lblStatB = document.getElementById('lblStatBOnly');
  if (lblStatB) lblStatB.innerText = isEn ? `${nameB}'s Unique` : `${nameB} 獨有推坑`;

  const lblTabA = document.getElementById('lblTabAOnly');
  if (lblTabA) lblTabA.innerText = isEn ? `${nameA} Recommends` : `${nameA} 推薦`;

  const lblTabB = document.getElementById('lblTabBOnly');
  if (lblTabB) lblTabB.innerText = isEn ? `${nameB} Recommends` : `${nameB} 推薦`;

  document.getElementById('tabCountCommon').innerText = res.stats.commonCount;
  document.getElementById('tabCountAOnly').innerText = res.stats.aOnlyCount;
  document.getElementById('tabCountBOnly').innerText = res.stats.bOnlyCount;
  document.getElementById('tabCountIndie').innerText = res.indieGems.length;

  switchResultTab('common');
}

function switchResultTab(tabKey) {
  AppState.activeResultTab = tabKey;
  const res = AppState.blendResult;
  if (!res) return;

  const isEn = AppState.lang === 'en-US';
  const nameA = res.userA.name || 'User A';
  const nameB = res.userB.name || 'User B';

  document.querySelectorAll('.tab-res-btn').forEach(b => {
    b.classList.remove('bg-rose-600', 'text-white', 'shadow-lg');
    b.classList.add('bg-slate-800/80', 'text-slate-400');
  });

  const activeBtn = document.getElementById(`btnTabRes_${tabKey}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-800/80', 'text-slate-400');
    activeBtn.classList.add('bg-rose-600', 'text-white', 'shadow-lg');
  }

  const container = document.getElementById('resultChannelsContainer');
  let channels = [];
  let emptyMsg = '';

  if (tabKey === 'common') {
    channels = res.commonChannels;
    emptyMsg = isEn ? 'No common channels found yet. Perfect opportunity to recommend!' : '你們目前沒有共同訂閱的頻道，正是互相推坑的好時機！';
  } else if (tabKey === 'a_only') {
    channels = res.aRecommendationsToB;
    emptyMsg = isEn ? `${nameA} has no further recommendations` : `${nameA} 暫無其他獨有推薦頻道`;
  } else if (tabKey === 'b_only') {
    channels = res.bRecommendationsToA;
    emptyMsg = isEn ? `${nameB} has no further recommendations` : `${nameB} 暫無其他獨有推薦頻道`;
  } else if (tabKey === 'indie') {
    channels = res.indieGems;
    emptyMsg = isEn ? 'No indie gems (< 100k subs) in common channels' : '共同訂閱中暫無 10 萬粉以下的小眾寶藏';
  }

  if (channels.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-16 text-slate-500 text-xs"><i class="fa-solid fa-compass text-2xl mb-2 block"></i>${emptyMsg}</div>`;
    return;
  }

  container.innerHTML = channels.map(c => `
    <div class="p-4 rounded-2xl bg-slate-900/80 border ${c.isIndie ? 'border-amber-500/30' : 'border-slate-800'} hover:border-slate-700 transition flex flex-col justify-between space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h4 class="font-bold text-sm text-slate-100 line-clamp-1">${c.title}</h4>
          <p class="text-[10px] text-slate-500 font-mono mt-0.5">${c.id}</p>
        </div>
        ${c.isIndie ? `<span class="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] border border-amber-800 flex-shrink-0">${t('indie_tag')}</span>` : ''}
      </div>
      <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
        <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">${getCategoryDisplayName(c.category || '綜合')}</span>
        <a href="https://www.youtube.com/channel/${c.id}" target="_blank" rel="noopener noreferrer" class="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold">
          ${t('btn_visit_channel')} <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  `).join('');
}

async function shareAsUserB() {
  const selectedChannelsB = AppState.userB.channels.filter(c => AppState.userB.selectedIds.has(c.id));
  if (selectedChannelsB.length === 0) {
    showToast('Please select your channels first!', 'warning');
    return;
  }

  try {
    const channelIds = selectedChannelsB.map(c => c.id);
    const res = await fetch('/api/pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelIds })
    });
    const data = await res.json();

    if (data.success) {
      const shareUrl = `${window.location.origin}/#u1=${data.payload}&name=${encodeURIComponent(AppState.userB.name)}`;
      
      document.getElementById('outputShareUrl').value = shareUrl;
      document.getElementById('modalShareLink').classList.remove('hidden');

      const qrContainer = document.getElementById('qrcodeContainer');
      qrContainer.innerHTML = '';
      if (window.QRCode) {
        new QRCode(qrContainer, {
          text: shareUrl,
          width: 140,
          height: 140,
          colorDark: '#0f172a',
          colorLight: '#ffffff'
        });
      }

      showToast(t('toast_generating'), 'success');
    }
  } catch (err) {
    showToast('Pack failed: ' + err.message, 'error');
  }
}

async function exportTasteCard() {
  const cardElement = document.getElementById('tasteShareCardPreview');
  if (!cardElement) return;

  showToast('Generating share card image...', 'info');

  try {
    if (window.html2canvas) {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#090d16',
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `YouTube-Taste-Blend-${AppState.userA.name}-vs-${AppState.userB.name}.png`;
      link.href = imgData;
      link.click();

      showToast(t('toast_card_success'), 'success');
    } else {
      showToast('Image generator loading, please retry in a moment', 'warning');
    }
  } catch (err) {
    showToast('Export failed: ' + err.message, 'error');
  }
}

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initAuthAndSubscriptions();

  const searchA = document.getElementById('searchChannelA');
  if (searchA) {
    searchA.addEventListener('input', (e) => {
      AppState.searchQueryA = e.target.value;
      AppState.pageA = 1;
      renderChannelSelection('A');
    });
  }

  const searchB = document.getElementById('searchChannelB');
  if (searchB) {
    searchB.addEventListener('input', (e) => {
      AppState.searchQueryB = e.target.value;
      AppState.pageB = 1;
      renderChannelSelection('B');
    });
  }
});
