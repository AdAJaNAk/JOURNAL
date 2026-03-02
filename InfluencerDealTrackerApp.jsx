import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  Home,
  Image as ImageIcon,
  Import,
  Info,
  Kanban,
  Link as LinkIcon,
  Loader2,
  Menu,
  Moon,
  Pencil,
  PieChart,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Twitter,
  Undo2,
  User,
  Users,
  Video,
  X,
} from "lucide-react";

const STORAGE_KEYS = {
  deals: "idt_deals",
  sponsors: "idt_sponsors",
  posts: "idt_posts",
  xauth: "idt_xauth",
  settings: "idt_settings",
  undo: "idt_undo_stack",
};

const TABS = ["Dashboard", "Deals", "Sponsors", "Posts", "Analytics", "Settings"];
const POST_TYPES = ["post", "retweet", "quote_tweet", "comment", "newsletter", "video", "story"];
const PIPELINE_STAGES = ["Prospecting", "Outreach Sent", "Negotiating", "Contracted", "Active", "Churned"];

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const nowIso = () => new Date().toISOString();
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
const isOverdue = (d) => d && new Date(d) < new Date();
const parseMoney = (n) => Number(n || 0);

const sampleData = () => {
  const sponsors = [
    { id: uid(), name: "TechBrand", email: "ads@techbrand.com", xHandle: "@techbrand", templates: ["Launch", "Reminder"], referralLinks: [{ name: "Affiliate", url: "https://techbrand.com/ref" }], contractRate: 1200, notes: "Hardware campaigns", tags: ["tech"], stage: "Active", rateHistory: [{ date: nowIso(), rate: 1200 }] },
    { id: uid(), name: "FashionCo", email: "partnerships@fashionco.com", xHandle: "@fashionco", templates: ["Seasonal"], referralLinks: [], contractRate: 900, notes: "Lifestyle audience", tags: ["fashion"], stage: "Negotiating", rateHistory: [{ date: nowIso(), rate: 900 }] },
    { id: uid(), name: "FitnessBrand", email: "creator@fitnessbrand.com", xHandle: "@fitnessbrand", templates: [], referralLinks: [{ name: "UTM", url: "https://fit.co/u" }], contractRate: 1100, notes: "Performance campaigns", tags: ["fitness"], stage: "Prospecting", rateHistory: [{ date: nowIso(), rate: 1100 }] },
  ];
  const deals = [
    { id: uid(), sponsorId: sponsors[0].id, title: "Tech launch thread", amount: 4000, ratePerPost: 1000, deliverables: [{ type: "post", count: 3, completed: 1, scheduledDates: [new Date().toISOString(), new Date(Date.now() + 86400000).toISOString(), new Date(Date.now() + 2 * 86400000).toISOString()], linkedPostIds: [] }, { type: "quote_tweet", count: 1, completed: 0, scheduledDates: [new Date(Date.now() + 3 * 86400000).toISOString()], linkedPostIds: [] }], status: "in-progress", deadline: new Date(Date.now() + 7 * 86400000).toISOString(), isPaid: false, completedAt: null, notes: "Need CTA", frequency: "weekly", invoiceGenerated: false, contractUrl: "", contentBrief: "Mention launch date and code.", notesHistory: [{ at: nowIso(), text: "Deal created" }] },
    { id: uid(), sponsorId: sponsors[1].id, title: "OOTD promo", amount: 1800, ratePerPost: 900, deliverables: [{ type: "post", count: 2, completed: 2, scheduledDates: [new Date(Date.now() - 7 * 86400000).toISOString(), new Date(Date.now() - 5 * 86400000).toISOString()], linkedPostIds: [] }], status: "completed", deadline: new Date(Date.now() - 4 * 86400000).toISOString(), isPaid: false, completedAt: new Date(Date.now() - 6 * 86400000).toISOString(), notes: "Invoice pending", frequency: "biweekly", invoiceGenerated: false, contractUrl: "", contentBrief: "Streetwear focus", notesHistory: [{ at: nowIso(), text: "Awaiting payment" }] },
    { id: uid(), sponsorId: sponsors[2].id, title: "Workout reel sequence", amount: 3300, ratePerPost: 1100, deliverables: [{ type: "video", count: 3, completed: 0, scheduledDates: [new Date(Date.now() + 4 * 86400000).toISOString(), new Date(Date.now() + 8 * 86400000).toISOString(), new Date(Date.now() + 12 * 86400000).toISOString()], linkedPostIds: [] }], status: "pending", deadline: new Date(Date.now() + 15 * 86400000).toISOString(), isPaid: false, completedAt: null, notes: "Shoot needed", frequency: "weekly", invoiceGenerated: false, contractUrl: "", contentBrief: "Highlight training app", notesHistory: [{ at: nowIso(), text: "Kickoff pending" }] },
    { id: uid(), sponsorId: sponsors[0].id, title: "Retargeting retweets", amount: 800, ratePerPost: 200, deliverables: [{ type: "retweet", count: 4, completed: 1, scheduledDates: [new Date(Date.now() - 2 * 86400000).toISOString(), new Date(Date.now() - 86400000).toISOString(), new Date(Date.now() + 86400000).toISOString(), new Date(Date.now() + 2 * 86400000).toISOString()], linkedPostIds: [] }], status: "in-progress", deadline: new Date(Date.now() + 3 * 86400000).toISOString(), isPaid: false, completedAt: null, notes: "Overdue slots", frequency: "daily", invoiceGenerated: false, contractUrl: "", contentBrief: "Boost campaign tweets", notesHistory: [{ at: nowIso(), text: "One overdue slot" }] },
    { id: uid(), sponsorId: sponsors[1].id, title: "Story drops", amount: 1200, ratePerPost: 400, deliverables: [{ type: "story", count: 3, completed: 0, scheduledDates: [new Date(Date.now() - 10 * 86400000).toISOString(), new Date(Date.now() - 9 * 86400000).toISOString(), new Date(Date.now() - 8 * 86400000).toISOString()], linkedPostIds: [] }], status: "pending", deadline: new Date(Date.now() - 7 * 86400000).toISOString(), isPaid: false, completedAt: null, notes: "Overdue deal", frequency: "custom", invoiceGenerated: false, contractUrl: "", contentBrief: "3 story frames", notesHistory: [{ at: nowIso(), text: "Overdue detected" }] },
  ];
  const posts = [
    { id: uid(), dealId: deals[0].id, sponsorId: deals[0].sponsorId, deliverableType: "post", xPostId: "111", link: "https://x.com/wallstengine/status/111", platform: "X", description: "Tech launch teaser thread live now", timestamp: nowIso(), impressions: 25000, likes: 900, retweets: 120, replies: 40, quotes: 12, bookmarks: 50, hasMedia: true, mediaUrls: ["https://picsum.photos/seed/1/160/90"], mediaType: "photo", autoDetectedType: "post", engagementRate: 4.29, notes: "Strong start", verified: true },
    { id: uid(), dealId: deals[1].id, sponsorId: deals[1].sponsorId, deliverableType: "post", xPostId: "112", link: "https://x.com/wallstengine/status/112", platform: "X", description: "Fashion lookbook collab", timestamp: nowIso(), impressions: 18000, likes: 500, retweets: 55, replies: 25, quotes: 4, bookmarks: 18, hasMedia: true, mediaUrls: ["https://picsum.photos/seed/2/160/90"], mediaType: "photo", autoDetectedType: "post", engagementRate: 3.22, notes: "", verified: true },
    { id: uid(), dealId: deals[3].id, sponsorId: deals[0].id, deliverableType: "retweet", xPostId: null, link: "", platform: "X", description: "Retweeted launch post", timestamp: nowIso(), impressions: null, likes: null, retweets: null, replies: null, quotes: null, bookmarks: null, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: "retweet", engagementRate: null, notes: "", verified: false },
    { id: uid(), dealId: deals[2].id, sponsorId: deals[2].sponsorId, deliverableType: "video", xPostId: null, link: "", platform: "Instagram", description: "Workout teaser clip", timestamp: nowIso(), impressions: null, likes: null, retweets: null, replies: null, quotes: null, bookmarks: null, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: null, engagementRate: null, notes: "", verified: false },
    { id: uid(), dealId: deals[4].id, sponsorId: deals[1].sponsorId, deliverableType: "story", xPostId: null, link: "", platform: "Instagram", description: "Story frame 1", timestamp: nowIso(), impressions: null, likes: null, retweets: null, replies: null, quotes: null, bookmarks: null, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: null, engagementRate: null, notes: "", verified: false },
    { id: uid(), dealId: deals[0].id, sponsorId: deals[0].sponsorId, deliverableType: "quote_tweet", xPostId: "113", link: "https://x.com/wallstengine/status/113", platform: "X", description: "Quoted customer feedback", timestamp: nowIso(), impressions: 9000, likes: 210, retweets: 22, replies: 9, quotes: 7, bookmarks: 10, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: "quote_tweet", engagementRate: 2.76, notes: "", verified: true },
    { id: uid(), dealId: deals[2].id, sponsorId: deals[2].sponsorId, deliverableType: "newsletter", xPostId: null, link: "https://newsletter.example.com/1", platform: "Beehiiv", description: "Fitness newsletter mention", timestamp: nowIso(), impressions: null, likes: null, retweets: null, replies: null, quotes: null, bookmarks: null, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: null, engagementRate: null, notes: "", verified: true },
    { id: uid(), dealId: deals[3].id, sponsorId: deals[0].id, deliverableType: "comment", xPostId: null, link: "", platform: "X", description: "Reply campaign follow-up", timestamp: nowIso(), impressions: null, likes: null, retweets: null, replies: null, quotes: null, bookmarks: null, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: "comment", engagementRate: null, notes: "", verified: false },
  ];
  return { sponsors, deals, posts };
};

export default function InfluencerDealTrackerApp() {
  const [theme, setTheme] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}").theme || "dark");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [subTab, setSubTab] = useState("All");
  const [postPage, setPostPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showMetrics, setShowMetrics] = useState(true);
  const [xRate, setXRate] = useState({ remaining: null, reset: null });
  const [bulkImportTweets, setBulkImportTweets] = useState([]);

  const [settings, setSettings] = useState(() => {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}");
    return {
      theme: s.theme || "dark",
      defaultPlatform: s.defaultPlatform || "X",
      autoPullOnOpen: s.autoPullOnOpen ?? false,
      autoDetectType: s.autoDetectType ?? true,
      paymentAlerts: s.paymentAlerts ?? true,
      overdueAlerts: s.overdueAlerts ?? true,
      creatorName: s.creatorName || "@wallstengine",
      invoiceCounter: s.invoiceCounter || 1001,
      taxRate: s.taxRate || 0,
      paymentInstructions: s.paymentInstructions || "ACH within 30 days",
    };
  });
  const [xAuth, setXAuth] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.xauth) || "null"));
  const [undoStack, setUndoStack] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.undo) || "[]"));

  const initial = useRef(null);
  if (!initial.current) {
    const deals = JSON.parse(localStorage.getItem(STORAGE_KEYS.deals) || "null");
    const sponsors = JSON.parse(localStorage.getItem(STORAGE_KEYS.sponsors) || "null");
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.posts) || "null");
    if (!deals || !sponsors || !posts) {
      initial.current = sampleData();
      localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(initial.current.deals));
      localStorage.setItem(STORAGE_KEYS.sponsors, JSON.stringify(initial.current.sponsors));
      localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(initial.current.posts));
      setTimeout(() => toast("info", "Sample data loaded"), 0);
    }
  }

  const [deals, setDeals] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.deals) || JSON.stringify(initial.current?.deals || [])));
  const [sponsors, setSponsors] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.sponsors) || JSON.stringify(initial.current?.sponsors || [])));
  const [posts, setPosts] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.posts) || JSON.stringify(initial.current?.posts || [])));

  function toast(type, message) {
    const t = { id: uid(), type, message };
    setToasts((p) => [...p, t]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== t.id)), 3000);
  }

  const saveUndo = useCallback((label) => {
    setUndoStack((prev) => [{ label, deals, sponsors, posts, settings }, ...prev].slice(0, 20));
  }, [deals, sponsors, posts, settings]);

  useEffect(() => {
    const tm = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(tm);
  }, [search]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    setSettings((s) => ({ ...s, theme }));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(deals));
    localStorage.setItem(STORAGE_KEYS.sponsors, JSON.stringify(sponsors));
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.xauth, JSON.stringify(xAuth));
    localStorage.setItem(STORAGE_KEYS.undo, JSON.stringify(undoStack));
  }, [deals, sponsors, posts, settings, xAuth, undoStack]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const code = p.get("code");
    if (code && settings.xClientId) exchangeXCode(code);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "n" || e.key === "N") setModal({ type: "deal" });
      if (e.key === "l" || e.key === "L") setModal({ type: "quick-log" });
      if (e.key === "b" || e.key === "B") setModal({ type: "bulk-log" });
      if (e.key === "t" || e.key === "T") setTheme((x) => (x === "dark" ? "light" : "dark"));
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sponsorMap = useMemo(() => Object.fromEntries(sponsors.map((s) => [s.id, s])), [sponsors]);
  const dealMap = useMemo(() => Object.fromEntries(deals.map((d) => [d.id, d])), [deals]);

  async function xFetch(url, options = {}) {
    if (!xAuth?.access_token) throw new Error("X session expired, please reconnect");
    const res = await fetch(url, { ...options, headers: { Authorization: `Bearer ${xAuth.access_token}`, ...(options.headers || {}) } });
    const remaining = res.headers.get("x-rate-limit-remaining");
    const reset = res.headers.get("x-rate-limit-reset");
    if (remaining) setXRate({ remaining: Number(remaining), reset: reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : null });
    if (Number(remaining) < 5) toast("warning", `X rate limit low (${remaining} left)`);
    if (res.status === 401) throw new Error("X session expired, please reconnect");
    if (res.status === 429) throw new Error("Rate limit reached, retry in a few minutes");
    if (!res.ok) throw new Error("Could not reach X API, check connection");
    return res.json();
  }

  const extractTweetId = (v) => (v.match(/\/status\/(\d+)/)?.[1] || null);

  async function pullTweetMetrics(tweetId) {
    try {
      const data = await xFetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,attachments,created_at,referenced_tweets&expansions=attachments.media_keys&media.fields=url,preview_image_url,type`);
      const t = data.data || {};
      const m = t.public_metrics || {};
      const ref = t.referenced_tweets?.[0]?.type;
      const type = ref === "retweeted" ? "retweet" : ref === "quoted" ? "quote_tweet" : ref === "replied_to" ? "comment" : "post";
      const media = (data.includes?.media || []).map((x) => x.url || x.preview_image_url).filter(Boolean);
      const impressions = m.impression_count || null;
      const engagementRate = impressions ? (((m.like_count || 0) + (m.retweet_count || 0) + (m.reply_count || 0) + (m.quote_count || 0)) / impressions) * 100 : null;
      return { impressions, likes: m.like_count || null, retweets: m.retweet_count || null, replies: m.reply_count || null, quotes: m.quote_count || null, bookmarks: m.bookmark_count || null, hasMedia: media.length > 0, mediaUrls: media, mediaType: data.includes?.media?.[0]?.type || null, autoDetectedType: type, engagementRate };
    } catch (e) {
      toast("error", e.message);
      return null;
    }
  }

  async function bulkPullMetrics(postIds) {
    const chunks = [];
    for (let i = 0; i < postIds.length; i += 100) chunks.push(postIds.slice(i, i + 100));
    for (const chunk of chunks) {
      try {
        const data = await xFetch(`https://api.twitter.com/2/tweets?ids=${chunk.join(",")}&tweet.fields=public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,type`);
        setPosts((prev) => prev.map((p) => {
          const t = data.data?.find((x) => x.id === p.xPostId);
          if (!t) return p;
          const m = t.public_metrics || {};
          const impressions = m.impression_count || null;
          return { ...p, impressions, likes: m.like_count || null, retweets: m.retweet_count || null, replies: m.reply_count || null, quotes: m.quote_count || null, bookmarks: m.bookmark_count || null, engagementRate: impressions ? (((m.like_count || 0) + (m.retweet_count || 0) + (m.reply_count || 0) + (m.quote_count || 0)) / impressions) * 100 : null };
        }));
      } catch (e) {
        toast("error", e.message);
      }
    }
  }

  async function importTweetsFromX(opts) {
    const query = encodeURIComponent(opts.query || `from:${opts.authorId || "wallstengine"}`);
    try {
      const data = await xFetch(`https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=${opts.maxResults || 10}&tweet.fields=public_metrics,attachments,created_at,referenced_tweets,text&expansions=attachments.media_keys&media.fields=url,preview_image_url,type`);
      return data.data || [];
    } catch (e) {
      toast("error", e.message);
      return [];
    }
  }

  function connectX() {
    const clientId = settings.xClientId;
    if (!clientId) return toast("error", "Enter X API Client ID first");
    const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => ("0" + b.toString(16)).slice(-2)).join("");
    localStorage.setItem("idt_pkce_verifier", verifier);
    const challenge = btoa(verifier).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&scope=tweet.read%20users.read%20offline.access&state=${uid()}&code_challenge=${challenge}&code_challenge_method=plain`;
    window.location.href = url;
  }

  async function exchangeXCode(code) {
    try {
      const body = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: window.location.origin + window.location.pathname, code_verifier: localStorage.getItem("idt_pkce_verifier") || "", client_id: settings.xClientId || "" });
      const res = await fetch("https://api.twitter.com/2/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      if (!res.ok) throw new Error("X token exchange failed");
      const token = await res.json();
      setXAuth({ ...token, connectedAt: nowIso(), handle: "@wallstengine" });
      window.history.replaceState({}, "", window.location.pathname);
      toast("success", "X connected");
    } catch (e) {
      toast("error", e.message);
    }
  }

  const dashboard = useMemo(() => {
    const totalEarnings = deals.reduce((a, d) => a + parseMoney(d.amount), 0);
    const paid = deals.filter((d) => d.isPaid).reduce((a, d) => a + parseMoney(d.amount), 0);
    const unpaid = totalEarnings - paid;
    const active = deals.filter((d) => ["pending", "in-progress"].includes(d.status)).length;
    const week = new Date(Date.now() + 7 * 86400000);
    let dueWeek = 0;
    let overdue = 0;
    deals.forEach((d) => d.deliverables.forEach((dv) => dv.scheduledDates.forEach((sd) => {
      if (new Date(sd) <= week && new Date(sd) >= new Date()) dueWeek += 1;
      if (new Date(sd) < new Date()) overdue += 1;
    })));
    const forecast = deals.filter((d) => ["pending", "in-progress"].includes(d.status)).reduce((a, d) => a + parseMoney(d.amount), 0);
    return { totalEarnings, paid, unpaid, active, dueWeek, overdue, forecast };
  }, [deals]);

  const filteredPosts = useMemo(() => {
    let p = [...posts];
    if (subTab !== "All") p = p.filter((x) => x.deliverableType === subTab.toLowerCase().replace(" ", "_"));
    if (searchDebounced) p = p.filter((x) => `${x.description} ${x.link} ${x.notes} ${(sponsorMap[x.sponsorId] || {}).name || ""}`.toLowerCase().includes(searchDebounced.toLowerCase()));
    return p.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [posts, subTab, searchDebounced, sponsorMap]);

  const pagedPosts = filteredPosts.slice((postPage - 1) * 10, postPage * 10);
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / 10));

  const themeBg = theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const card = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const input = theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900";

  const renderEmpty = (title, actionLabel, action) => (
    <div className={`p-8 border rounded-2xl ${card} text-center`}>
      <Sparkles className="mx-auto mb-3" />
      <p className="text-gray-400 mb-4">{title}</p>
      <button className="px-3 py-2 rounded-xl bg-blue-600" onClick={action}>{actionLabel}</button>
    </div>
  );

  return (
    <div className={`${themeBg} min-h-screen font-sans`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 z-30 bg-inherit">
        <div className="flex items-center gap-2"><button className="md:hidden" onClick={() => setMobileNav((v) => !v)}><Menu /></button><h1 className="font-bold text-xl">Influencer Deal Tracker</h1></div>
        <div className="flex items-center gap-3">
          {undoStack.length > 0 && <button className="px-3 py-2 rounded-xl bg-gray-700" onClick={() => { const [head, ...rest] = undoStack; if (head) { setDeals(head.deals); setSponsors(head.sponsors); setPosts(head.posts); setSettings(head.settings); setUndoStack(rest); toast("info", `Undid ${head.label}`); } }}><Undo2 className="w-4 h-4 inline mr-1" />Undo</button>}
          <button className="p-2 rounded-xl bg-gray-800" onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun /> : <Moon />}</button>
        </div>
      </div>

      <div className="flex">
        <aside className={`hidden md:block w-56 p-4 border-r border-gray-800`}>
          {TABS.map((t) => <button key={t} onClick={() => setActiveTab(t)} className={`w-full text-left p-3 rounded-xl mb-2 ${activeTab === t ? "bg-blue-600" : "bg-gray-800"}`}>{t}</button>)}
        </aside>
        <main className="flex-1 p-4 space-y-4 pb-24 md:pb-4">
          {activeTab === "Dashboard" && <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[{ label: "Total", val: dashboard.totalEarnings, cls: "from-blue-600 to-indigo-600" }, { label: "Paid", val: dashboard.paid, cls: "from-green-600 to-emerald-600" }, { label: "Unpaid", val: dashboard.unpaid, cls: "from-orange-600 to-red-600" }, { label: "Active Deals", val: dashboard.active, cls: "from-purple-600 to-fuchsia-600" }, { label: "Due This Week", val: dashboard.dueWeek, cls: "from-cyan-600 to-blue-600" }, { label: "Overdue", val: dashboard.overdue, cls: "from-red-700 to-rose-700" }].map((s) => <div key={s.label} className={`p-4 rounded-2xl bg-gradient-to-r ${s.cls}`}><div className="text-sm">{s.label}</div><div className="text-2xl font-bold">{typeof s.val === "number" && s.val > 100 ? `$${s.val.toLocaleString()}` : s.val}</div></div>)}
            </div>
            <div className="text-sm p-3 rounded-xl bg-gray-800">Earnings forecast this cycle: <b>${dashboard.forecast.toLocaleString()}</b></div>
          </div>}

          {activeTab === "Deals" && <div className="space-y-4">
            <div className="flex gap-2 flex-wrap"><button onClick={() => setModal({ type: "deal" })} className="px-3 py-2 rounded-xl bg-blue-600"><Plus className="w-4 h-4 inline" /> New Deal</button><button onClick={() => setModal({ type: "quick-log" })} className="px-3 py-2 rounded-xl bg-gray-700">Log Post</button><button onClick={() => setModal({ type: "bulk-log" })} className="px-3 py-2 rounded-xl bg-gray-700">Bulk Log</button><button onClick={() => setModal({ type: "x-import" })} className="px-3 py-2 rounded-xl bg-gray-700">Bulk Tweet Import</button></div>
            <div className="grid md:grid-cols-3 gap-3">{deals.map((d) => {
              const s = sponsorMap[d.sponsorId];
              const done = d.deliverables.reduce((a, x) => a + x.completed, 0);
              const tot = d.deliverables.reduce((a, x) => a + x.count, 0);
              return <div key={d.id} className={`p-4 border rounded-2xl ${card}`}>
                <div className="flex justify-between"><h3 className="font-semibold">{d.title}</h3><button onClick={() => { saveUndo("delete deal"); setDeals((prev) => prev.filter((x) => x.id !== d.id)); }}><Trash2 className="w-4 h-4" /></button></div>
                <div className="text-sm text-gray-400">{s?.name}</div>
                <div className="text-sm mt-2">{d.status} • {d.isPaid ? "Paid" : "Unpaid"}</div>
                <div className="w-full h-2 bg-gray-700 rounded mt-2"><div className={`h-2 rounded ${isOverdue(d.deadline) ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${Math.round((done / Math.max(1, tot)) * 100)}%` }} /></div>
                <div className="text-xs mt-1">{done}/{tot} complete</div>
                <div className="flex gap-2 mt-2 flex-wrap">{d.deliverables.flatMap((dv) => dv.scheduledDates.map((dt) => <button key={`${dv.type}_${dt}`} className={`px-2 py-1 rounded text-xs ${new Date(dt) < new Date() ? "bg-red-700" : "bg-gray-700"}`} onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.title)}&dates=${new Date(dt).toISOString().replace(/[-:]/g, "").slice(0, 15)}Z/${new Date(new Date(dt).getTime() + 3600000).toISOString().replace(/[-:]/g, "").slice(0, 15)}Z&details=${encodeURIComponent(d.notes || "Sponsored post")}`)}>{fmtDate(dt)}</button>))}</div>
                <div className="mt-2 text-sm">${d.amount} (${d.ratePerPost}/post)</div>
                <div className="mt-2 flex gap-2 flex-wrap"><button className="px-2 py-1 bg-gray-700 rounded" onClick={() => setModal({ type: "quick-log", dealId: d.id })}>Quick Log</button><button className="px-2 py-1 bg-gray-700 rounded" onClick={() => { saveUndo("duplicate deal"); const c = { ...d, id: uid(), title: `${d.title} (Copy)`, notesHistory: [{ at: nowIso(), text: "Cloned deal" }] }; setDeals((p) => [c, ...p]); }}>Duplicate</button><button className="px-2 py-1 bg-green-700 rounded" onClick={() => setDeals((p) => p.map((x) => x.id === d.id ? { ...x, status: "completed", completedAt: nowIso() } : x))}>Complete</button><button className="px-2 py-1 bg-indigo-700 rounded" onClick={async () => { const ids = posts.filter((p) => p.dealId === d.id && p.xPostId).map((p) => p.xPostId); await bulkPullMetrics(ids); }}>X Sync</button></div>
              </div>;
            })}</div>
          </div>}

          {activeTab === "Sponsors" && <div className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{sponsors.map((s) => {
              const sDeals = deals.filter((d) => d.sponsorId === s.id);
              const active = sDeals.filter((d) => ["pending", "in-progress"].includes(d.status));
              const owed = active.reduce((a, d) => a + d.deliverables.reduce((z, dv) => z + dv.count, 0), 0);
              const complete = active.reduce((a, d) => a + d.deliverables.reduce((z, dv) => z + dv.completed, 0), 0);
              const trend = s.rateHistory?.length > 1 ? ((s.rateHistory.at(-1).rate - s.rateHistory.at(-2).rate) / Math.max(1, s.rateHistory.at(-2).rate)) * 100 : 0;
              return <div key={s.id} className={`p-4 border rounded-2xl ${card}`}>
                <h3 className="font-semibold">{s.name}</h3><div className="text-sm text-gray-400">{s.email} {s.xHandle}</div>
                <select className={`mt-2 p-2 rounded ${input}`} value={s.stage || "Prospecting"} onChange={(e) => setSponsors((p) => p.map((x) => x.id === s.id ? { ...x, stage: e.target.value } : x))}>{PIPELINE_STAGES.map((st) => <option key={st}>{st}</option>)}</select>
                <div className="text-xs mt-2">Deliverables: {complete}/{owed}</div>
                <div className="text-xs">Rate trend: {trend.toFixed(1)}%</div>
              </div>;
            })}</div>
          </div>}

          {activeTab === "Posts" && <div className="space-y-3">
            <div className="flex gap-2 flex-wrap items-center"><input className={`px-3 py-2 rounded-xl border ${input}`} placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} /><button className="px-3 py-2 rounded-xl bg-gray-700" onClick={() => setModal({ type: "quick-log" })}>+ Log Post</button><button className="px-3 py-2 rounded-xl bg-gray-700" onClick={() => setModal({ type: "bulk-log" })}>Bulk Log</button><button className="px-3 py-2 rounded-xl bg-gray-700" onClick={() => setModal({ type: "x-import" })}>🐦 X Import</button><button className="px-3 py-2 rounded-xl bg-gray-700" onClick={() => navigator.clipboard.writeText(filteredPosts.map((p) => `${p.deliverableType}: ${p.link}`).join("\n"))}>Copy All Links</button><label className="text-sm"><input type="checkbox" checked={showMetrics} onChange={(e) => setShowMetrics(e.target.checked)} /> metrics</label></div>
            <div className="flex gap-2 overflow-auto">{["All", "Post", "Retweet", "Quote_tweet", "Comment", "Newsletter", "Video", "Story"].map((t) => <button key={t} onClick={() => setSubTab(t === "Post" ? "Posts" : t)} className={`px-3 py-1 rounded-xl ${subTab.toLowerCase() === t.toLowerCase() ? "bg-blue-600" : "bg-gray-700"}`}>{t.replace("_", " ")}</button>)}</div>
            {pagedPosts.length === 0 ? renderEmpty("No posts logged yet", "Log Post", () => setModal({ type: "quick-log" })) : pagedPosts.map((p) => <div key={p.id} className={`p-3 border rounded-xl ${card}`}>
              <div className="flex justify-between gap-2"><div><div className="text-xs text-gray-400">{p.deliverableType} • {p.platform} • {fmtDate(p.timestamp)}</div><div className="font-semibold">{p.description.split(" ").slice(0, 6).join(" ")}</div></div><div className="flex gap-2"><input type="checkbox" checked={selectedPosts.includes(p.id)} onChange={() => setSelectedPosts((s) => s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id])} /><button onClick={() => { saveUndo("delete post"); const gone = p; setPosts((x) => x.filter((z) => z.id !== p.id)); toast("info", "Post deleted. Use Undo to restore."); setTimeout(() => gone, 0); }}><Trash2 className="w-4 h-4" /></button></div></div>
              {p.hasMedia && <img src={p.mediaUrls[0]} alt="thumb" className="mt-2 w-32 h-20 object-cover rounded" />}
              {showMetrics && <div className="text-xs mt-2">👁 {p.impressions ?? "-"} ❤️ {p.likes ?? "-"} 🔁 {p.retweets ?? "-"} 💬 {p.replies ?? "-"} 🔖 {p.bookmarks ?? "-"} {p.engagementRate ? `ER ${p.engagementRate.toFixed(2)}%` : ""}</div>}
              <div className="text-xs mt-1">{dealMap[p.dealId]?.title} / {sponsorMap[p.sponsorId]?.name}</div>
              <div className="mt-1 flex gap-2"><a href={p.link} target="_blank" rel="noreferrer" className="text-blue-400">Open</a><button onClick={() => navigator.clipboard.writeText(p.link)}><Copy className="w-4 h-4" /></button>{p.xPostId && <button onClick={async () => { const m = await pullTweetMetrics(p.xPostId); if (m) setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, ...m } : x)); }}>Pull Metrics</button>}</div>
            </div>)}
            <div className="flex gap-2 items-center"><button disabled={postPage === 1} onClick={() => setPostPage((p) => Math.max(1, p - 1))}><ChevronLeft /></button><span>{postPage}/{pageCount}</span><button disabled={postPage === pageCount} onClick={() => setPostPage((p) => Math.min(pageCount, p + 1))}><ChevronRight /></button></div>
            {selectedPosts.length > 0 && <div className="p-3 rounded-xl bg-indigo-800 flex gap-2 flex-wrap"><button onClick={() => { saveUndo("bulk delete posts"); setPosts((p) => p.filter((x) => !selectedPosts.includes(x.id))); setSelectedPosts([]); }}>Delete Selected</button><button onClick={async () => await bulkPullMetrics(posts.filter((x) => selectedPosts.includes(x.id)).map((x) => x.xPostId).filter(Boolean))}>Pull Metrics for Selected</button><button onClick={() => navigator.clipboard.writeText(posts.filter((x) => selectedPosts.includes(x.id)).map((x) => x.link).join("\n"))}>Copy Selected Links</button></div>}
          </div>}

          {activeTab === "Analytics" && <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-3">{[{ k: "Total Revenue", v: dashboard.totalEarnings }, { k: "Avg Rate/Post", v: Math.round(deals.reduce((a, d) => a + d.ratePerPost, 0) / Math.max(1, deals.length)) }, { k: "Completion %", v: Math.round((deals.filter((d) => d.status === "completed").length / Math.max(1, deals.length)) * 100) }, { k: "Schedule Health %", v: Math.max(0, 100 - dashboard.overdue * 5) }].map((x) => <div key={x.k} className={`p-3 rounded-xl border ${card}`}>{x.k}<div className="text-2xl font-bold">{x.v}{x.k.includes("%") ? "%" : ""}</div></div>)}</div>
            <div className={`p-3 border rounded-xl ${card}`}><h3>Revenue by sponsor</h3>{sponsors.map((s) => { const rev = deals.filter((d) => d.sponsorId === s.id).reduce((a, d) => a + d.amount, 0); return <div key={s.id} className="mt-2"><div className="text-xs">{s.name} ${rev}</div><div className="h-2 bg-gray-700 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${Math.min(100, (rev / Math.max(1, dashboard.totalEarnings)) * 100)}%` }} /></div></div>; })}</div>
            <div className={`p-3 border rounded-xl ${card}`}>Best post: {(posts.filter((p) => p.impressions).sort((a, b) => b.impressions - a.impressions)[0] || {}).description || "N/A"}. Worst post: {(posts.filter((p) => p.impressions).sort((a, b) => a.impressions - b.impressions)[0] || {}).description || "N/A"}.</div>
          </div>}

          {activeTab === "Settings" && <div className="space-y-4">
            <div className={`p-4 border rounded-2xl ${card} space-y-2`}>
              <h3 className="font-semibold">X API Authentication</h3>
              <input className={`w-full p-2 border rounded ${input}`} placeholder="Client ID" value={settings.xClientId || ""} onChange={(e) => setSettings((s) => ({ ...s, xClientId: e.target.value }))} />
              <input className={`w-full p-2 border rounded ${input}`} readOnly value={window.location.origin + window.location.pathname} />
              {!xAuth ? <button className="px-3 py-2 rounded-xl bg-blue-600" onClick={connectX}>Connect X Account</button> : <div className="text-sm">Connected as {xAuth.handle || "@wallstengine"} <button className="ml-2 px-2 py-1 bg-red-700 rounded" onClick={() => setXAuth(null)}>Disconnect</button></div>}
              <div className="text-xs text-gray-400">{xRate.remaining !== null ? `Rate limit remaining: ${xRate.remaining}, reset ${xRate.reset}` : "No rate limit data yet."}</div>
            </div>
            <div className={`p-4 border rounded-2xl ${card} space-y-2`}>
              <h3 className="font-semibold">Preferences</h3>
              <label className="block"><input type="checkbox" checked={settings.autoPullOnOpen} onChange={(e) => setSettings((s) => ({ ...s, autoPullOnOpen: e.target.checked }))} /> Auto-pull metrics on open</label>
              <label className="block"><input type="checkbox" checked={settings.autoDetectType} onChange={(e) => setSettings((s) => ({ ...s, autoDetectType: e.target.checked }))} /> Auto-detect post type</label>
              <label className="block"><input type="checkbox" checked={settings.paymentAlerts} onChange={(e) => setSettings((s) => ({ ...s, paymentAlerts: e.target.checked }))} /> Payment reminders</label>
              <label className="block"><input type="checkbox" checked={settings.overdueAlerts} onChange={(e) => setSettings((s) => ({ ...s, overdueAlerts: e.target.checked }))} /> Overdue alerts</label>
              <input className={`p-2 border rounded ${input}`} placeholder="Creator name/handle" value={settings.creatorName} onChange={(e) => setSettings((s) => ({ ...s, creatorName: e.target.value }))} />
            </div>
            <div className={`p-4 border rounded-2xl ${card} space-y-2`}>
              <h3 className="font-semibold">Data management</h3>
              <button className="px-3 py-2 bg-gray-700 rounded" onClick={() => { const blob = new Blob([JSON.stringify({ deals, sponsors, posts, settings }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "idt-backup.json"; a.click(); }}>Export all JSON</button>
              <button className="px-3 py-2 bg-red-700 rounded" onClick={() => { saveUndo("clear all data"); setDeals([]); setSponsors([]); setPosts([]); }}>Clear all</button>
            </div>
          </div>}
        </main>
      </div>

      {modal?.type === "quick-log" && <QuickLogModal card={card} input={input} deals={deals} onClose={() => setModal(null)} onSave={async (payload) => { saveUndo("log post"); let patch = {}; if (payload.link) { const tid = extractTweetId(payload.link); if (tid) { const m = await pullTweetMetrics(tid); patch = { ...patch, xPostId: tid, ...(m || {}) }; } }
        const post = { id: uid(), sponsorId: dealMap[payload.dealId]?.sponsorId, timestamp: nowIso(), verified: true, ...payload, ...patch };
        setPosts((p) => [post, ...p]);
        setDeals((d) => d.map((x) => x.id === payload.dealId ? { ...x, deliverables: x.deliverables.map((dv) => dv.type === payload.deliverableType ? { ...dv, completed: Math.min(dv.count, dv.completed + 1), linkedPostIds: [...dv.linkedPostIds, post.id] } : dv) } : x));
        toast("success", "Post logged"); setModal(null);
      }} preDealId={modal.dealId} />}

      {modal?.type === "deal" && <DealModal card={card} input={input} sponsors={sponsors} onClose={() => setModal(null)} onSave={(deal) => { saveUndo("create deal"); setDeals((p) => [{ ...deal, id: uid(), status: "pending", completedAt: null, invoiceGenerated: false, notesHistory: [{ at: nowIso(), text: "Deal created" }] }, ...p]); setModal(null); }} />}

      {modal?.type === "bulk-log" && <BulkLogModal card={card} input={input} deals={deals} onClose={() => setModal(null)} onSave={async (vals) => {
        saveUndo("bulk log posts");
        const lines = vals.links.split("\n").map((x) => x.trim()).filter(Boolean);
        const additions = [];
        for (const link of lines) {
          const tid = extractTweetId(link);
          let metrics = {};
          if (tid && vals.pullMetrics) metrics = (await pullTweetMetrics(tid)) || {};
          additions.push({ id: uid(), dealId: vals.dealId, sponsorId: dealMap[vals.dealId]?.sponsorId, deliverableType: vals.deliverableType, xPostId: tid, link, platform: vals.platform, description: vals.notes || "Bulk logged", timestamp: nowIso(), notes: vals.notes, verified: false, ...metrics });
        }
        setPosts((p) => [...additions, ...p]); setModal(null); toast("success", `${additions.length} posts logged`);
      }} />}

      {modal?.type === "x-import" && <XImportModal card={card} input={input} deals={deals} sponsorMap={sponsorMap} tweets={bulkImportTweets} onSearch={async (opts) => setBulkImportTweets(await importTweetsFromX(opts))} onClose={() => setModal(null)} onImport={(selected, dealId) => {
        saveUndo("import tweets");
        const converted = selected.map((t) => ({ id: uid(), dealId, sponsorId: dealMap[dealId]?.sponsorId, deliverableType: "post", xPostId: t.id, link: `https://x.com/wallstengine/status/${t.id}`, platform: "X", description: t.text, timestamp: t.created_at || nowIso(), impressions: t.public_metrics?.impression_count || null, likes: t.public_metrics?.like_count || null, retweets: t.public_metrics?.retweet_count || null, replies: t.public_metrics?.reply_count || null, quotes: t.public_metrics?.quote_count || null, bookmarks: t.public_metrics?.bookmark_count || null, hasMedia: false, mediaUrls: [], mediaType: null, autoDetectedType: t.referenced_tweets?.[0]?.type || "post", engagementRate: null, notes: "Imported", verified: true }));
        setPosts((p) => [...converted, ...p]); setModal(null);
      }} />}

      <div className="fixed top-4 right-4 space-y-2 z-50">{toasts.map((t) => <div key={t.id} className={`px-4 py-2 rounded-xl shadow ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : t.type === "warning" ? "bg-orange-600" : "bg-blue-600"}`}>{t.message}</div>)}</div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900 p-2 grid grid-cols-5 gap-1">{["Dashboard", "Deals", "Sponsors", "Posts", "Settings"].map((t) => <button key={t} className={`p-2 rounded ${activeTab === t ? "bg-blue-600" : "bg-gray-800"}`} onClick={() => setActiveTab(t)}>{t}</button>)}</div>
    </div>
  );
}

function DealModal({ card, input, sponsors, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", sponsorId: sponsors[0]?.id || "", amount: 0, ratePerPost: 0, deadline: "", frequency: "weekly", deliverables: [{ type: "post", count: 1, completed: 0, scheduledDates: [new Date().toISOString()], linkedPostIds: [] }], notes: "", isPaid: false, contractUrl: "", contentBrief: "" });
  const totalCount = form.deliverables.reduce((a, d) => a + Number(d.count || 0), 0);
  return <div className="fixed inset-0 bg-black/60 grid place-items-center z-40"><div className={`w-full max-w-3xl p-4 rounded-2xl border ${card} max-h-[90vh] overflow-auto space-y-2`}>
    <div className="flex justify-between"><h3>New Deal</h3><button onClick={onClose}><X /></button></div>
    <input className={`w-full p-2 border rounded ${input}`} placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
    <select className={`w-full p-2 border rounded ${input}`} value={form.sponsorId} onChange={(e) => setForm((f) => ({ ...f, sponsorId: e.target.value }))}>{sponsors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    <div className="grid grid-cols-2 gap-2"><input className={`p-2 border rounded ${input}`} type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value), ratePerPost: totalCount ? Number(e.target.value) / totalCount : 0 }))} /><input className={`p-2 border rounded ${input}`} type="number" placeholder="Rate/Post" value={form.ratePerPost} onChange={(e) => setForm((f) => ({ ...f, ratePerPost: Number(e.target.value), amount: Number(e.target.value) * totalCount }))} /></div>
    <div className="text-xs">Live calc: {totalCount} posts × ${form.ratePerPost} = ${Math.round(totalCount * form.ratePerPost)}</div>
    {form.deliverables.map((d, i) => <div key={i} className="grid grid-cols-3 gap-2"><select className={`p-2 border rounded ${input}`} value={d.type} onChange={(e) => setForm((f) => ({ ...f, deliverables: f.deliverables.map((x, idx) => idx === i ? { ...x, type: e.target.value } : x) }))}>{POST_TYPES.map((t) => <option key={t}>{t}</option>)}</select><input className={`p-2 border rounded ${input}`} type="number" value={d.count} onChange={(e) => setForm((f) => ({ ...f, deliverables: f.deliverables.map((x, idx) => idx === i ? { ...x, count: Number(e.target.value), scheduledDates: Array.from({ length: Number(e.target.value) }, (_, k) => new Date(Date.now() + k * 86400000).toISOString()) } : x) }))} /><button className="bg-gray-700 rounded" onClick={() => setForm((f) => ({ ...f, deliverables: [...f.deliverables, { type: "post", count: 1, completed: 0, scheduledDates: [new Date().toISOString()], linkedPostIds: [] }] }))}>+</button></div>)}
    <textarea className={`w-full p-2 border rounded ${input}`} rows={4} placeholder="Content brief" value={form.contentBrief} onChange={(e) => setForm((f) => ({ ...f, contentBrief: e.target.value }))} />
    <button className="px-3 py-2 rounded-xl bg-blue-600" onClick={() => onSave(form)}>Save Deal</button>
  </div></div>;
}

function QuickLogModal({ card, input, deals, onClose, onSave, preDealId }) {
  const [form, setForm] = useState({ dealId: preDealId || deals[0]?.id || "", deliverableType: deals[0]?.deliverables?.[0]?.type || "post", platform: "X", link: "", description: "", notes: "" });
  return <div className="fixed inset-0 bg-black/60 grid place-items-center z-40"><div className={`w-full max-w-xl p-4 rounded-2xl border ${card} space-y-2`}>
    <div className="flex justify-between"><h3>Quick Log</h3><button onClick={onClose}><X /></button></div>
    <select className={`w-full p-2 border rounded ${input}`} value={form.dealId} onChange={(e) => setForm((f) => ({ ...f, dealId: e.target.value }))}>{deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select>
    <select className={`w-full p-2 border rounded ${input}`} value={form.deliverableType} onChange={(e) => setForm((f) => ({ ...f, deliverableType: e.target.value }))}>{POST_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
    <input className={`w-full p-2 border rounded ${input}`} placeholder="Link" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
    <input className={`w-full p-2 border rounded ${input}`} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
    <textarea className={`w-full p-2 border rounded ${input}`} rows={3} placeholder="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
    <button className="px-3 py-2 rounded-xl bg-blue-600" onClick={() => onSave(form)}>Log Post</button>
  </div></div>;
}

function BulkLogModal({ card, input, deals, onClose, onSave }) {
  const [form, setForm] = useState({ links: "", platform: "X", deliverableType: "post", dealId: deals[0]?.id || "", notes: "", pullMetrics: true });
  const lines = form.links.split("\n").map((x) => x.trim()).filter(Boolean);
  const ids = lines.filter((l) => /\/status\/(\d+)/.test(l));
  return <div className="fixed inset-0 bg-black/60 grid place-items-center z-40"><div className={`w-full max-w-2xl p-4 rounded-2xl border ${card} space-y-2`}>
    <div className="flex justify-between"><h3>Bulk Log</h3><button onClick={onClose}><X /></button></div>
    <textarea className={`w-full p-2 border rounded ${input}`} rows={7} placeholder="One link per line" value={form.links} onChange={(e) => setForm((f) => ({ ...f, links: e.target.value }))} />
    <div className="text-xs">{lines.length} links detected, {ids.length} valid tweet IDs found.</div>
    <button className="px-3 py-2 rounded-xl bg-blue-600" onClick={() => onSave(form)}>Log {lines.length} Posts</button>
  </div></div>;
}

function XImportModal({ card, input, deals, tweets, onSearch, onClose, onImport }) {
  const [query, setQuery] = useState("from:wallstengine");
  const [selected, setSelected] = useState([]);
  const [dealId, setDealId] = useState(deals[0]?.id || "");
  return <div className="fixed inset-0 bg-black/60 grid place-items-center z-40"><div className={`w-full max-w-3xl p-4 rounded-2xl border ${card} space-y-2 max-h-[90vh] overflow-auto`}>
    <div className="flex justify-between"><h3>Import Tweets from X</h3><button onClick={onClose}><X /></button></div>
    <div className="flex gap-2"><input className={`flex-1 p-2 border rounded ${input}`} value={query} onChange={(e) => setQuery(e.target.value)} /><button className="px-3 py-2 bg-blue-600 rounded" onClick={() => onSearch({ query, maxResults: 25 })}>Search</button></div>
    <select className={`w-full p-2 border rounded ${input}`} value={dealId} onChange={(e) => setDealId(e.target.value)}>{deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select>
    {tweets.map((t) => <div key={t.id} className="p-2 rounded border border-gray-700"><label className="flex gap-2"><input type="checkbox" checked={selected.includes(t.id)} onChange={() => setSelected((s) => s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id])} /><span>{t.text?.slice(0, 140)}</span></label></div>)}
    <button className="px-3 py-2 rounded-xl bg-green-600" onClick={() => onImport(tweets.filter((x) => selected.includes(x.id)), dealId)}>Import Selected</button>
  </div></div>;
}
