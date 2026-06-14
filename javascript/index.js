// --- 設定區域 ---
const CITY = 'Taipei';
const WEATHER_API_KEY = '你的OpenWeather金鑰'; // 如果還沒申請，這段會顯示預設值
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=zh-TW&gl=TW&ceid=TW:zh-Hant';

// --- 初始化執行 ---
document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    fetchGoogleNews();
    startProgress(); // 啟動天氣更新進度條
});

// --- 1. 抓取 Google News 邏輯 ---
async function fetchGoogleNews() {
    const newsGrid = document.getElementById('news-grid');
    const cacheKey = 'news_cache_v1';

    try {
        // 先檢查 localStorage 快取（有效期 5 分鐘）
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            try {
                const c = JSON.parse(raw);
                if (Date.now() - c.ts < 5 * 60 * 1000) {
                    renderNews(c.items);
                    return;
                }
            } catch (e) {
                // 解析失敗則忽略快取
            }
        }

        // 使用 rss2json 轉換 Google News RSS 並避開 CORS
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(GOOGLE_NEWS_RSS)}`;
        const response = await fetch(proxyUrl, { cache: 'no-store' });
        const data = await response.json();

        if (data.status === 'ok') {
            // 儲存快取
            try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), items: data.items })); } catch(e) { /* ignore */ }
            renderNews(data.items);
        } else {
            throw new Error('RSS 轉換失敗');
        }
    } catch (error) {
        console.error("新聞抓取錯誤:", error);
        newsGrid.innerHTML = '<p style="color: gray;">新聞暫時無法載入，請確認網路連線。</p>';
    }
}

function renderNews(items) {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = ''; // 清除骨架屏

    items.slice(0, 6).forEach(item => {
        const imageUrl = item.thumbnail || `https://picsum.photos/seed/${Math.floor(Math.random()*10000)}/400/225`;

        const card = document.createElement('article');
        card.className = 'news-card';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'news-image-wrapper';

        const img = document.createElement('img');
        img.className = 'news-image';
        img.src = imageUrl;
        img.alt = 'news';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 400;
        img.height = 225;
        imgWrap.appendChild(img);

        const tag = document.createElement('span');
        tag.className = 'news-tag';
        tag.textContent = 'Google News';
        imgWrap.appendChild(tag);

        const content = document.createElement('div');
        content.className = 'news-content';

        const timeEl = document.createElement('time');
        timeEl.textContent = new Date(item.pubDate).toLocaleDateString();

        const h3 = document.createElement('h3');
        h3.className = 'news-title';
        h3.textContent = item.title;

        const p = document.createElement('p');
        p.className = 'news-excerpt';
        p.textContent = (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 120) + '...';

        const footer = document.createElement('div');
        footer.className = 'news-footer';

        const readMore = document.createElement('span');
        readMore.className = 'read-more';
        readMore.textContent = '閱讀原文 →';
        readMore.style.cursor = 'pointer';
        readMore.addEventListener('click', () => window.open(item.link, '_blank'));

        footer.appendChild(readMore);
        content.appendChild(timeEl);
        content.appendChild(h3);
        content.appendChild(p);
        content.appendChild(footer);

        card.appendChild(imgWrap);
        card.appendChild(content);
        newsGrid.appendChild(card);
    });
}

// --- 2. 抓取天氣 API 邏輯 ---
async function fetchWeather() {
    try {
        // 這裡暫時使用模擬數據，如果你有 API Key，請換成真實 Fetch
        setTimeout(() => {
            document.getElementById('city').innerText = CITY;
            document.getElementById('temp').innerText = '22';
            document.getElementById('description').innerText = '多雲轉晴';
        }, 1000);
    } catch (error) {
        console.log("天氣資訊獲取失敗");
    }
}

// --- 3. 進度條動畫邏輯 ---
function startProgress() {
    const bar = document.getElementById('progress-bar');
    let width = 0;
    setInterval(() => {
        if (width >= 100) {
            width = 0;
            fetchWeather(); // 進度條滿了就重新抓一次天氣
        } else {
            width++;
            bar.style.width = width + '%';
        }
    }, 300); // 30秒更新一次
}