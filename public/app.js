/**
 * YouTube Taste Blend - Client Application Engine
 */

const AppState = {
  mode: 'creator', // 'creator' | 'receiver' | 'result'
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
  activeResultTab: 'common' // 'common' | 'a_only' | 'b_only' | 'indie' | 'radar'
};

// Toast notification helper
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
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald-400' : type === 'error' ? 'fa-triangle-exclamation text-rose-400' : 'fa-circle-info text-indigo-400'}"></i> <span>${message}</span>`;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Check URL Hash on boot
function parseUrlHash() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const u1Payload = params.get('u1');
  const u1Name = params.get('name');

  if (u1Payload) {
    sessionStorage.setItem('taste_invite_u1', u1Payload);
    sessionStorage.setItem('taste_invite_name', u1Name || '你的好友');
  }
}

// Check saved invitation in sessionStorage
function checkInviteSession() {
  const savedPayload = sessionStorage.getItem('taste_invite_u1');
  const savedName = sessionStorage.getItem('taste_invite_name');

  if (savedPayload) {
    AppState.userA.payload = savedPayload;
    AppState.userA.name = savedName || '好友';
    setAppMode('receiver');
  } else {
    setAppMode('creator');
  }
}

// Switch Application View Modes
function setAppMode(mode) {
  AppState.mode = mode;
  document.getElementById('viewCreator').classList.add('hidden');
  document.getElementById('viewReceiver').classList.add('hidden');
  document.getElementById('viewResult').classList.add('hidden');

  if (mode === 'creator') {
    document.getElementById('viewCreator').classList.remove('hidden');
  } else if (mode === 'receiver') {
    document.getElementById('viewReceiver').classList.remove('hidden');
    document.getElementById('receiverInviterName').innerText = AppState.userA.name;
    document.getElementById('receiverInviterBadge').innerText = AppState.userA.name;
  } else if (mode === 'result') {
    document.getElementById('viewResult').classList.remove('hidden');
    document.getElementById('viewResult').scrollIntoView({ behavior: 'smooth' });
  }
}

// Auth status check
async function checkAuthStatus() {
  try {
    const res = await fetch('/auth/status');
    const data = await res.json();
    
    const oauthButtons = document.querySelectorAll('.btn-google-oauth');
    if (!data.configured) {
      oauthButtons.forEach(btn => {
        btn.setAttribute('title', '尚未配置 Google Client ID，請使用下方【一鍵載入示範資料】進行測試');
      });
    }
  } catch (err) {
    console.error('Failed to check auth status', err);
  }
}

// Load Subscriptions (Real API or Mock)
async function loadSubscriptions(target = 'A', profile = 'A') {
  showToast(`正在載入 ${target === 'A' ? 'User A' : 'User B'} 的訂閱頻道...`, 'info');
  try {
    const res = await fetch(`/api/mock/subscriptions?profile=${profile}`);
    const data = await res.json();
    
    if (target === 'A') {
      AppState.userA.channels = data.channels;
      AppState.userA.selectedIds = new Set(data.channels.map(c => c.id));
      renderChannelSelection('A');
      showToast(`成功載入 ${data.channels.length} 個頻道！`, 'success');
    } else {
      AppState.userB.channels = data.channels;
      AppState.userB.selectedIds = new Set(data.channels.map(c => c.id));
      renderChannelSelection('B');
      showToast(`成功載入 ${data.channels.length} 個頻道！`, 'success');
    }
  } catch (err) {
    showToast('載入失敗: ' + err.message, 'error');
  }
}

// Render Channel Selection List with Filters and Checkboxes
function renderChannelSelection(target = 'A') {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  const listEl = document.getElementById(target === 'A' ? 'channelsListA' : 'channelsListB');
  const countEl = document.getElementById(target === 'A' ? 'selectedCountA' : 'selectedCountB');
  const totalEl = document.getElementById(target === 'A' ? 'totalCountA' : 'totalCountB');
  const query = target === 'A' ? AppState.searchQueryA.toLowerCase() : AppState.searchQueryB.toLowerCase();
  const filterCat = target === 'A' ? AppState.activeFilterA : AppState.activeFilterB;

  if (!listEl) return;

  const filtered = user.channels.filter(c => {
    const matchesQuery = c.title.toLowerCase().includes(query) || (c.category && c.category.toLowerCase().includes(query));
    const matchesCat = filterCat === 'all' || (filterCat === 'indie' && c.isIndie) || c.category === filterCat;
    return matchesQuery && matchesCat;
  });

  countEl.innerText = user.selectedIds.size;
  totalEl.innerText = user.channels.length;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="text-center py-12 text-slate-500 text-xs"><i class="fa-solid fa-filter-circle-xmark text-lg mb-2 block"></i>無符合篩選條件的頻道</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(c => {
    const isChecked = user.selectedIds.has(c.id);
    return `
      <div class="flex items-center justify-between p-3 rounded-xl ${isChecked ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-900/40 border-slate-800/60 opacity-60'} border hover:border-slate-600 transition cursor-pointer" onclick="toggleChannelSelect('${target}', '${c.id}')">
        <div class="flex items-center gap-3 truncate mr-2">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleChannelSelect('${target}', '${c.id}')" class="w-4 h-4 rounded text-rose-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
          <div class="truncate">
            <p class="font-bold text-xs text-slate-200 truncate">${c.title}</p>
            <div class="flex items-center gap-2 mt-0.5">
              ${c.subscriberCount ? `<span class="text-[10px] text-slate-400">${formatSubscriberCount(c.subscriberCount)} 訂閱</span>` : ''}
              ${c.isIndie ? '<span class="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 text-[10px] border border-amber-800/80">✨ 寶藏</span>' : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">${c.category || 'YouTube'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function toggleChannelSelect(target, id) {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  if (user.selectedIds.has(id)) {
    user.selectedIds.delete(id);
  } else {
    user.selectedIds.add(id);
  }
  renderChannelSelection(target);
}

function selectAllChannels(target, selectAll = true) {
  const user = target === 'A' ? AppState.userA : AppState.userB;
  if (selectAll) {
    user.selectedIds = new Set(user.channels.map(c => c.id));
  } else {
    user.selectedIds.clear();
  }
  renderChannelSelection(target);
}

function formatSubscriberCount(count) {
  if (count >= 10000000) return (count / 10000000).toFixed(1) + ' 千萬';
  if (count >= 10000) return (count / 10000).toFixed(1) + ' 萬';
  return count.toLocaleString();
}

// Generate Share URL (User A)
async function generateShareUrl() {
  const name = document.getElementById('inputUserAName').value.trim() || '神秘好友';
  AppState.userA.name = name;

  const selectedChannels = AppState.userA.channels.filter(c => AppState.userA.selectedIds.has(c.id));
  if (selectedChannels.length === 0) {
    showToast('請至少保留勾選 1 個公開頻道！', 'warning');
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

      // Generate QR Code
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

      showToast('專屬品味邀請連結已生成！', 'success');
    }
  } catch (err) {
    showToast('產生連結失敗: ' + err.message, 'error');
  }
}

// Copy Share URL
function copyToClipboard(elementId) {
  const input = document.getElementById(elementId);
  input.select();
  navigator.clipboard.writeText(input.value);
  showToast('已複製連結至剪貼簿！', 'success');
}

// User B starts Blend with User A
async function runBlendWithUserA() {
  const nameB = document.getElementById('inputUserBName').value.trim() || '受邀好友';
  AppState.userB.name = nameB;

  const selectedChannelsB = AppState.userB.channels.filter(c => AppState.userB.selectedIds.has(c.id));
  if (selectedChannelsB.length === 0) {
    showToast('請至少選擇 1 個訂閱頻道！', 'warning');
    return;
  }

  showToast('正在比對你們的品味雷達...', 'info');

  try {
    const res = await fetch('/api/blend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userA: {
          name: AppState.userA.name,
          payload: AppState.userA.payload
        },
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

      // Launch celebration confetti
      if (window.confetti) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  } catch (err) {
    showToast('比對失敗: ' + err.message, 'error');
  }
}

// Render Results View
function renderBlendResultsView() {
  const res = AppState.blendResult;
  if (!res) return;

  document.getElementById('resUserAName').innerText = res.userA.name;
  document.getElementById('resUserBName').innerText = res.userB.name;
  document.getElementById('resChemistryLevel').innerText = res.stats.chemistryLevel;
  document.getElementById('resMatchScore').innerText = `${res.stats.matchPercentage}%`;
  document.getElementById('resChemistryDesc').innerText = res.stats.chemistryDescription;

  document.getElementById('resCountCommon').innerText = res.stats.commonCount;
  document.getElementById('resCountAOnly').innerText = res.stats.aOnlyCount;
  document.getElementById('resCountBOnly').innerText = res.stats.bOnlyCount;
  document.getElementById('resCountIndie').innerText = res.indieGems.length;

  document.getElementById('tabCountCommon').innerText = res.stats.commonCount;
  document.getElementById('tabCountAOnly').innerText = res.stats.aOnlyCount;
  document.getElementById('tabCountBOnly').innerText = res.stats.bOnlyCount;
  document.getElementById('tabCountIndie').innerText = res.indieGems.length;

  switchResultTab('common');
}

// Switch result categories tab
function switchResultTab(tabKey) {
  AppState.activeResultTab = tabKey;
  const res = AppState.blendResult;
  if (!res) return;

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
    emptyMsg = '你們目前沒有共同訂閱的頻道，正是互相推坑的好時機！';
  } else if (tabKey === 'a_only') {
    channels = res.aRecommendationsToB;
    emptyMsg = `${res.userA.name} 沒有更多獨家頻道了`;
  } else if (tabKey === 'b_only') {
    channels = res.bRecommendationsToA;
    emptyMsg = `${res.userB.name} 沒有更多獨家頻道了`;
  } else if (tabKey === 'indie') {
    channels = res.indieGems;
    emptyMsg = '雙方共同訂閱中暫無 10 萬粉以下的小眾寶藏頻道';
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
        ${c.isIndie ? '<span class="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] border border-amber-800 flex-shrink-0">✨ 寶藏</span>' : ''}
      </div>
      <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
        <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">${c.category || 'YouTube'}</span>
        <a href="https://www.youtube.com/channel/${c.id}" target="_blank" rel="noopener noreferrer" class="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold">
          前往頻道 <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  `).join('');
}

// User B re-shares their own profile as a fresh invitation
async function shareAsUserB() {
  const selectedChannelsB = AppState.userB.channels.filter(c => AppState.userB.selectedIds.has(c.id));
  if (selectedChannelsB.length === 0) {
    showToast('請先載入並選擇你的頻道！', 'warning');
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

      // Refresh QR
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

      showToast('已將你的品味打包為全新邀請連結！', 'success');
    }
  } catch (err) {
    showToast('打包失敗: ' + err.message, 'error');
  }
}

// Export IG Story / Card Image
async function exportTasteCard() {
  const cardElement = document.getElementById('tasteShareCardPreview');
  if (!cardElement) return;

  showToast('正在產生專屬比對圖卡...', 'info');

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

      showToast('圖卡已成功下載！', 'success');
    } else {
      showToast('圖卡套件尚未載入，請稍候重試', 'warning');
    }
  } catch (err) {
    showToast('匯出失敗: ' + err.message, 'error');
  }
}

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  parseUrlHash();
  checkInviteSession();
  checkAuthStatus();

  // Preload Mock A for Creator mode convenience
  loadSubscriptions('A', 'A');
  loadSubscriptions('B', 'B');

  // Search input listeners
  const searchA = document.getElementById('searchChannelA');
  if (searchA) {
    searchA.addEventListener('input', (e) => {
      AppState.searchQueryA = e.target.value;
      renderChannelSelection('A');
    });
  }

  const searchB = document.getElementById('searchChannelB');
  if (searchB) {
    searchB.addEventListener('input', (e) => {
      AppState.searchQueryB = e.target.value;
      renderChannelSelection('B');
    });
  }
});
