import { useState, useEffect } from 'react';
import Game2048 from './Game2048.jsx';
import GameFlappyBird from './GameFlappyBird.jsx';
import GamePuzzle from './GamePuzzle.jsx';
import GameEliminate from './GameEliminate.jsx';
import GameSnake from './GameSnake.jsx';
import GameKnife from './GameKnife.jsx';
import { SiDouban, SiXiaohongshu, SiGithub, SiTencentqq, SiWechat, SiNeteasecloudmusic } from 'react-icons/si';
import { Email } from '@mui/icons-material';
import './App.css';
// 在文件顶部导入图片（假设放在 assets 目录下，实际可替换为真实图片路径）
import pic1 from './pic/pic1.JPG';
import pic2 from './pic/pic2.JPG';
import pic3 from './pic/pic3.JPG';
import pic4 from './pic/pic4.JPG';
import pic5 from './pic/pic5.JPG';
import pic6 from './pic/pic6.JPG';
import pic7 from './pic/pic7.JPG';
import pic8 from './pic/pic8.JPG';
// 在顶部引入相机图标
import { FaCameraRetro } from 'react-icons/fa';

const profile = {
  zh: {
    name: '菊次郎',
    desc: '你好，我是菊次郎，一名热爱前端开发和生活的年轻人。喜欢探索新技术，热衷于分享和记录生活。',
    links: [
      { icon: <SiDouban />, name: '豆瓣', url: 'https://www.douban.com/people/230674291' },
      { icon: <SiXiaohongshu />, name: '小红书', url: 'https://www.xiaohongshu.com/user/profile/5e8efca8000000000100a2d3' },
      { icon: <SiGithub />, name: 'GitHub', url: 'https://github.com/jucilang2022' },
      { icon: <SiNeteasecloudmusic />, name: '网易云音乐', url: 'https://music.163.com/#/user/home?id=1443295984' },
    ],
    contacts: [
      { icon: <SiTencentqq />, label: 'QQ', value: '2544668581' },
      { icon: <Email />, label: '邮箱', value: 'lizhengyang@douban.com' },
      { icon: <SiWechat />, label: '微信', value: 'L15191880198' },
    ],
  },
  en: {
    name: 'JuCilang',
    desc: "Hi, I'm JuCilang, a young developer passionate about frontend and life. I love exploring new tech and sharing my journey.",
    links: [
      { icon: <SiDouban />, name: 'Douban', url: 'https://www.douban.com/people/230674291' },
      { icon: <SiXiaohongshu />, name: 'Xiaohongshu', url: 'https://www.xiaohongshu.com/user/profile/5e8efca8000000000100a2d3' },
      { icon: <SiGithub />, name: 'GitHub', url: 'https://github.com/jucilang2022' },
      { icon: <SiNeteasecloudmusic />, name: 'Music163', url: 'https://music.163.com/#/user/home?id=1443295984' },
    ],
    contacts: [
      { icon: <SiTencentqq />, label: 'QQ', value: '2544668581' },
      { icon: <Email />, label: 'Email', value: 'lizhengyang@douban.com' },
      { icon: <SiWechat />, label: 'WeChat', value: 'L15191880198' },
    ],
  },
};

// 电子时钟组件
function DigitalClock({ lang }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const zh = now.toLocaleTimeString('zh-CN', { hour12: false });
  const en = now.toLocaleTimeString('en-US', { hour12: false });
  return (
    <div style={{
      position: 'fixed',
      top: 18,
      left: 18,
      background: 'rgba(255,255,255,0.92)',
      color: '#4f8cff',
      fontWeight: 1000,
      fontSize: '1.35em',
      letterSpacing: '0.08em',
      borderRadius: 10,
      boxShadow: '0 2px 8px 0 rgba(79,140,255,0.08)',
      padding: '0.45em 1.2em',
      zIndex: 100,
      fontFamily: 'monospace',
      userSelect: 'none',
    }}>{lang === 'en' ? en : zh}</div>
  );
}

function App() {
  const [lang, setLang] = useState('zh');
  const [showContact, setShowContact] = useState(false);
  const [showContactQuiz, setShowContactQuiz] = useState(false);
  const [quizInput, setQuizInput] = useState('');
  const [quizError, setQuizError] = useState('');
  const [avatarSpin, setAvatarSpin] = useState(false);
  const [tip, setTip] = useState('');
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const tips = [
    '今天也在发光 ✨',
    '点我干嘛？😏',
    '祝你天天开心！',
    '前端万岁！',
    '你发现了隐藏彩蛋！',
    '要不要一起写代码？',
    '生活要有点小乐趣~',
  ];
  const p = profile[lang];

  // galleryTitle 必须放在这里，才能被正确引用
  const galleryTitle = lang === 'en' ? (
    <>
      <FaCameraRetro style={{ color: '#43e97b', fontSize: '1.2em', marginRight: '0.2em' }} />
      My Photography Portfolio
      <span style={{ fontSize: '0.7em', color: '#ff6ec4', marginLeft: '0.5em' }}>✦</span>
    </>
  ) : (
    <>
      <FaCameraRetro style={{ color: '#43e97b', fontSize: '1.2em', marginRight: '0.2em' }} />
      我的摄影作品集
      <span style={{ fontSize: '0.7em', color: '#ff6ec4', marginLeft: '0.5em' }}>✦</span>
    </>
  );

  // 每日一句/签名内容
  const dailyQuotes = {
    zh: [
      '愿你走出半生，归来仍是少年。',
      '保持热爱，奔赴山海。',
      '星光不问赶路人，时光不负有心人。',
      '生活明朗，万物可爱。',
      '前端改变世界，代码点亮人生。',
      '世界很大，开心最重要。',
      '愿你所想皆如愿，所行化坦途。',
    ],
    en: [
      'May you return as a youth after half a lifetime.',
      'Keep passion, chase the mountains and seas.',
      'Stars don’t ask the wayfarer, time rewards the diligent.',
      'Life is bright, everything is lovely.',
      'Frontend changes the world, code lights up life.',
      'The world is big, happiness matters most.',
      'May all your wishes come true and your path be smooth.',
    ],
  };
  const quoteList = dailyQuotes[lang] || dailyQuotes.zh;
  const todayIdx = new Date().getDate() % quoteList.length;
  const todayQuote = quoteList[todayIdx];

  // 网易云音乐歌单ID（可替换为你喜欢的歌单）
  const songId = '541326593'; // 默认单曲ID，可替换为你喜欢的单曲
  const musicTitle = lang === 'en' ? 'Music' : '音乐';

  // galleryData 支持中英文描述
  const galleryData = [
    { src: pic1, desc: { zh: '为人民服务', en: 'Serve the People' } },
    { src: pic2, desc: { zh: '魔法城堡', en: 'Magic Castle' } },
    { src: pic3, desc: { zh: '猫猫猫', en: 'Cat Cat Cat' } },
    { src: pic4, desc: { zh: '繁华', en: 'Bustling City' } },
    { src: pic5, desc: { zh: '欧洲风情', en: 'European Style' } },
    { src: pic6, desc: { zh: '花园', en: 'Garden' } },
    { src: pic7, desc: { zh: '飞机划过城堡', en: 'Airplane Flying Past Castle' } },
    { src: pic8, desc: { zh: '中国瓷器', en: 'China china' } },
  ];

  const handleAvatarClick = () => {
    setAvatarSpin(true);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    setTimeout(() => setAvatarSpin(false), 1000);
    setTimeout(() => setTip(''), 2500);
  };

  const handleOpenGameModal = () => {
    setShowGameModal(true);
    setSelectedGame(null);
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
  };

  const handleCloseGameModal = () => {
    setShowGameModal(false);
    setSelectedGame(null);
  };

  function handleQuizSubmit() {
    if (quizInput.trim() === '李郑洋') {
      setShowContactQuiz(false);
      setShowContact(true);
    } else {
      setQuizError(lang === 'zh' ? '答案错误，请重试！' : 'Incorrect answer, please try again!');
    }
  }

  const texts = {
    zh: {
      select: '选择一个小游戏',
      close: '关闭',
      game2048: '2048',
      flappy: '小鸟飞飞',
      gameBtn: '小游戏',
      puzzle: '拼图',
      eliminate: '消消乐',
    },
    en: {
      select: 'Choose a mini game',
      close: 'Close',
      game2048: '2048',
      flappy: 'Flappy Bird',
      gameBtn: 'Mini Game',
      puzzle: 'Puzzle',
      eliminate: 'Eliminate',
    },
  };
  const t = texts[lang] || texts.zh;

  // 新增：多页面翻页相关状态
  const [pageIndex, setPageIndex] = useState(0); // 0:主页, 1:空白1, 2:空白2
  const [pageTrans, setPageTrans] = useState(''); // 动画方向
  const [isScrolling, setIsScrolling] = useState(false); // 防抖

  // 新增：动画切换相关状态
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDirection, setAnimDirection] = useState(null); // 'up' or 'down'
  const [nextPageIndex, setNextPageIndex] = useState(null);

  // 作品集页相关状态
  const [previewIdx, setPreviewIdx] = useState(null); // 当前预览图片索引

  // 页面内容数组
  const pages = [
    // 主页内容
    (
      <div key="main" className="page-content">
        {/* <DigitalClock lang={lang} /> */}
        <div className="rainbow-bar"></div>
        {/* 右上角头像 */}
        <img
          className={`avatar-floating${avatarSpin ? ' spin' : ''}`}
          src="https://img9.doubanio.com/icon/ul290069963-4.jpg"
          alt="avatar"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
        />
        {tip && (
          <div style={{
            position: 'absolute',
            top: 110,
            right: 40,
            background: 'rgba(255,255,255,0.95)',
            color: '#00796b',
            borderRadius: 12,
            padding: '0.6em 1.2em',
            boxShadow: '0 2px 8px 0 rgba(38,166,154,0.10)',
            zIndex: 99,
            fontWeight: 600,
            fontSize: '1.05em',
            pointerEvents: 'none',
            transition: 'opacity 0.3s',
          }}>{tip}</div>
        )}
        <div className="lang-switch">
          <button
            className={lang === 'zh' ? 'active' : ''}
            onClick={() => setLang('zh')}
          >
            中文
          </button>
          <span>|</span>
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>
        <div className="profile-card">
          <h1>{p.name}</h1>
          <p className="desc">{p.desc}</p>
          {/* 每日一句/签名模块（暂时注释）
        <div style={{
          margin: '0.5em 0 1.2em 0',
          padding: '0.7em 1.2em',
          background: 'rgba(79,140,255,0.08)',
          borderRadius: 10,
          color: '#4f8cff',
          fontWeight: 600,
          fontSize: '1.08em',
          textAlign: 'center',
          boxShadow: '0 2px 8px 0 rgba(79,140,255,0.06)',
          letterSpacing: '0.5px',
        }}>{todayQuote}</div>
        */}
          <div className="links">
            {p.links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </div>
          {/* 底部widgets：小游戏和音乐播放器 */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            marginTop: 32,
            marginBottom: 0,
            minHeight: 80,
          }}>
            {/* 小游戏入口按钮 */}
            <button className="game-btn" onClick={handleOpenGameModal} style={{ background: '#a084ee', color: '#fff', fontWeight: 700, fontSize: '1.08em', borderRadius: 10, padding: '0.5em 1.5em', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(160,132,238,0.10)' }}>🎮 {t.gameBtn}</button>
            {/* 网易云音乐单曲播放器 */}
            <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 10, boxShadow: '0 2px 8px 0 rgba(79,140,255,0.08)', padding: '0.3em 0.7em', minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#4f8cff', fontWeight: 700, fontSize: '1em', marginBottom: 4 }}>{musicTitle}</div>
              <iframe allow="encrypted-media; accelerometer; gyroscope" frameBorder="no" border="0" marginWidth="0" marginHeight="0" width="170" height="52" style={{ borderRadius: 8 }}
                src={`https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=32`} />
            </div>
          </div>
        </div>
      </div>
    ),
    // 作品集页
    <div key="gallery" className="page-content blank-page">
      <h2 style={{ color: '#a084ee', marginTop: '2em', textAlign: 'center', marginBottom: '1.5em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6em', fontWeight: 800, fontSize: '2em', letterSpacing: '0.05em' }}>
        {galleryTitle}
      </h2>
      <div className="gallery-grid">
        {galleryData.map((item, i) => (
          <div className="gallery-item" key={i}>
            <img src={item.src} alt={`pic${i + 1}`} className="gallery-img" onClick={() => setPreviewIdx(i)} style={{ cursor: 'pointer' }} />
            <div className="gallery-desc">{item.desc[lang]}</div>
          </div>
        ))}
      </div>
      {/* 大图预览弹窗 */}
      {previewIdx !== null && (
        <div className="preview-mask" onClick={() => setPreviewIdx(null)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <img src={galleryData[previewIdx].src} alt="preview" className="preview-img" />
            <div className="preview-desc">{galleryData[previewIdx].desc[lang]}</div>
            <button className="preview-close" onClick={() => setPreviewIdx(null)}>{lang === 'en' ? 'Close' : '关闭'}</button>
          </div>
        </div>
      )}
    </div>,
    // 空白页2
    // <div key="blank2" className="page-content blank-page">
    //   <h2 style={{ color: '#43e97b', marginTop: '3em', textAlign: 'center' }}>空白页 2</h2>
    // </div>,
  ];

  // 翻页事件（带防抖）
  function goToPage(idx, direction) {
    if (idx === pageIndex || idx < 0 || idx >= pages.length || isScrolling || isAnimating) return;
    setIsScrolling(true);
    setIsAnimating(true);
    setAnimDirection(direction === 'slide-up' ? 'up' : 'down');
    setNextPageIndex(idx);
    setTimeout(() => {
      setIsAnimating(false);
      setAnimDirection(null);
      setNextPageIndex(null);
      setPageIndex(idx);
      setTimeout(() => setIsScrolling(false), 80);
    }, 350);
  }

  // 处理鼠标滚轮
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling || isAnimating) return;
      if (e.deltaY > 30) {
        goToPage(pageIndex + 1, 'slide-up'); // 下滑进入下一页
      } else if (e.deltaY < -30) {
        goToPage(pageIndex - 1, 'slide-down'); // 上滑进入上一页
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [pageIndex, isScrolling, isAnimating]);

  // 处理触摸滑动
  useEffect(() => {
    let startY = null;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = (e) => {
      if (startY === null || isScrolling || isAnimating) return;
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startY;
      if (deltaY < -40) {
        goToPage(pageIndex + 1, 'slide-up'); // 上滑
      } else if (deltaY > 40) {
        goToPage(pageIndex - 1, 'slide-down'); // 下滑
      }
      startY = null;
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pageIndex, isScrolling, isAnimating]);

  // 渲染动画内容
  let pageSliderContent;
  if (isAnimating && nextPageIndex !== null) {
    // 动画中，渲染当前页和目标页
    pageSliderContent = (
      <>
        <div className={`page-anim-page anim-out anim-${animDirection}`}>{pages[pageIndex]}</div>
        <div className={`page-anim-page anim-in anim-${animDirection}`}>{pages[nextPageIndex]}</div>
      </>
    );
  } else {
    // 静止时只渲染当前页
    pageSliderContent = pages[pageIndex];
  }

  // 留言簿相关状态
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [showAddMsg, setShowAddMsg] = useState(false);
  const [guestbook, setGuestbook] = useState([]);
  const [msgName, setMsgName] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgError, setMsgError] = useState('');

  // 留言本地存储
  useEffect(() => {
    const data = localStorage.getItem('guestbook');
    if (data) setGuestbook(JSON.parse(data));
  }, []);
  useEffect(() => {
    localStorage.setItem('guestbook', JSON.stringify(guestbook));
  }, [guestbook]);

  // 留言按钮文本
  const guestbookBtnText = lang === 'en' ? 'Guestbook' : '留言簿';
  const addMsgBtnText = lang === 'en' ? 'Add Message' : '添加留言';
  const addMsgTitle = lang === 'en' ? 'Add a Message' : '添加留言';
  const namePlaceholder = lang === 'en' ? 'Your name...' : '你的昵称...';
  const contentPlaceholder = lang === 'en' ? 'Your message...' : '留言内容...';
  const confirmText = lang === 'en' ? 'Confirm' : '确定';
  const cancelText = lang === 'en' ? 'Cancel' : '取消';
  const msgNameEmpty = lang === 'en' ? 'Please enter your name.' : '请输入昵称。';
  const msgContentEmpty = lang === 'en' ? 'Please enter your message.' : '请输入留言内容。';
  const noMsgText = lang === 'en' ? 'No messages yet.' : '暂无留言。';

  // 添加留言
  function handleAddMsg() {
    if (!msgName.trim()) {
      setMsgError(msgNameEmpty); return;
    }
    if (!msgContent.trim()) {
      setMsgError(msgContentEmpty); return;
    }
    setGuestbook([
      ...guestbook,
      { name: msgName.trim(), content: msgContent.trim(), time: new Date().toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { hour12: false }) }
    ]);
    setShowAddMsg(false);
    setMsgName('');
    setMsgContent('');
    setMsgError('');
  }

  return (
    <div className="homepage-container">
      {/* 翻页内容区 */}
      <div className="page-slider" style={{ overflow: 'hidden' }}>
        {pageSliderContent}
      </div>
      {/* 移除页码指示器 */}
      {/* <div className="page-nav-btns" style={{ pointerEvents: 'none' }}>
        <span className="page-indicator">{pageIndex + 1} / {pages.length}</span>
      </div> */}
      {/* 其余弹窗和footer等内容保持原有逻辑 */}
      {/* 游戏弹窗 */}
      {showGameModal && (
        <div className="contact-modal-mask" onClick={handleCloseGameModal}>
          <div className="contact-modal" style={{ minWidth: 320, minHeight: 220 }} onClick={e => e.stopPropagation()}>
            {!selectedGame && (
              <>
                <h2 style={{ marginBottom: '1em' }}>{t.select}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'center' }}>
                  <button onClick={() => handleSelectGame('2048')} style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, border: 'none', background: '#43e97b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{t.game2048}</button>
                  <button onClick={() => handleSelectGame('flappy')} style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, border: 'none', background: '#ff6ec4', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{t.flappy}</button>
                  <button onClick={() => handleSelectGame('puzzle')} style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, border: 'none', background: '#4f8cff', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{t.puzzle}</button>
                  <button onClick={() => handleSelectGame('eliminate')} style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, border: 'none', background: '#26a69a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{t.eliminate}</button>
                  {/* 新增贪吃蛇按钮 */}
                  <button onClick={() => handleSelectGame('snake')} style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, border: 'none', background: '#00dbff', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{lang === 'en' ? 'Snake' : '贪吃蛇'}</button>
                  {/* 新增飞刀挑战按钮 */}
                  <button onClick={() => handleSelectGame('knife')} style={{ padding: '0.7em 2em', fontSize: '1.1em', borderRadius: 8, border: 'none', background: '#fc8064', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{lang === 'en' ? 'Knife Hit' : '飞刀挑战'}</button>
                </div>
                <button className="close-btn" style={{ marginTop: '2em' }} onClick={handleCloseGameModal}>{t.close}</button>
              </>
            )}
            {selectedGame === '2048' && (
              <Game2048 lang={lang} />
            )}
            {selectedGame === 'flappy' && (
              <GameFlappyBird lang={lang} />
            )}
            {selectedGame === 'puzzle' && (
              <GamePuzzle lang={lang} onBack={() => setSelectedGame(null)} />
            )}
            {selectedGame === 'eliminate' && (
              <GameEliminate lang={lang} onBack={() => setSelectedGame(null)} />
            )}
            {/* 新增贪吃蛇入口 */}
            {selectedGame === 'snake' && (
              <GameSnake lang={lang} />
            )}
            {/* 新增飞刀挑战入口 */}
            {selectedGame === 'knife' && (
              <GameKnife lang={lang} />
            )}
          </div>
        </div>
      )}
      {/* 页脚联系方式+留言簿按钮 */}
      <footer className="footer-contact">
        <button className="contact-btn" onClick={() => { setShowContactQuiz(true); setQuizInput(''); setQuizError(''); }}>
          {lang === 'zh' ? '联系方式' : 'Contact'}
        </button>
        <button className="guestbook-btn" onClick={() => setShowGuestbook(true)}>{guestbookBtnText}</button>
      </footer>
      {/* 留言簿弹窗 */}
      {showGuestbook && (
        <div className="contact-modal-mask" onClick={() => setShowGuestbook(false)}>
          <div className="contact-modal guestbook-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1em', color: '#4f8cff', fontWeight: 700, fontSize: '1.2em' }}>{guestbookBtnText}</h2>
            <div className="guestbook-list" style={{ maxHeight: 260, overflowY: 'auto', width: '100%', marginBottom: 16 }}>
              {guestbook.length === 0 ? (
                <div style={{ color: '#aaa', textAlign: 'center', margin: '2em 0' }}>{noMsgText}</div>
              ) : guestbook.map((msg, i) => (
                <div className="guestbook-msg" key={i} style={{ marginBottom: 18, borderBottom: '1px solid #e0f7fa', paddingBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#43e97b', fontSize: '1.08em' }}>{msg.name}</div>
                  <div style={{ color: '#333', margin: '0.3em 0 0.2em 0', wordBreak: 'break-all' }}>{msg.content}</div>
                  <div style={{ color: '#bbb', fontSize: '0.92em' }}>{msg.time}</div>
                </div>
              ))}
            </div>
            <button className="guestbook-add-btn" onClick={() => setShowAddMsg(true)}>{addMsgBtnText}</button>
            <button className="close-btn" style={{ marginTop: 10 }} onClick={() => setShowGuestbook(false)}>{cancelText}</button>
          </div>
        </div>
      )}
      {/* 添加留言弹窗 */}
      {showAddMsg && (
        <div className="contact-modal-mask" onClick={() => setShowAddMsg(false)}>
          <div className="contact-modal" style={{ minWidth: 260, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1em', color: '#4f8cff', fontWeight: 700, fontSize: '1.2em' }}>{addMsgTitle}</h2>
            <input
              type="text"
              value={msgName}
              onChange={e => { setMsgName(e.target.value); setMsgError(''); }}
              placeholder={namePlaceholder}
              style={{ width: '100%', padding: '0.6em', fontSize: '1em', borderRadius: 8, border: '1.5px solid #b2ebf2', marginBottom: 12 }}
              autoFocus
            />
            <textarea
              value={msgContent}
              onChange={e => { setMsgContent(e.target.value); setMsgError(''); }}
              placeholder={contentPlaceholder}
              style={{ width: '100%', padding: '0.6em', fontSize: '1em', borderRadius: 8, border: '1.5px solid #b2ebf2', marginBottom: 12, minHeight: 60, resize: 'vertical' }}
            />
            {msgError && <div style={{ color: '#ff6ec4', marginBottom: 8, fontWeight: 600 }}>{msgError}</div>}
            <button className="guestbook-add-btn" style={{ width: '100%', marginBottom: 8 }} onClick={handleAddMsg}>{confirmText}</button>
            <button className="close-btn" onClick={() => setShowAddMsg(false)}>{cancelText}</button>
          </div>
        </div>
      )}
      {/* 联系方式答题弹窗 */}
      {showContactQuiz && (
        <div className="contact-modal-mask" onClick={() => setShowContactQuiz(false)}>
          <div className="contact-modal" style={{ minWidth: 260 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1em', color: '#26a69a', fontWeight: 700, fontSize: '1.2em' }}>{lang === 'zh' ? '我的真实姓名是？' : 'What is my real name?'}</h2>
            <input
              type="text"
              value={quizInput}
              onChange={e => { setQuizInput(e.target.value); setQuizError(''); }}
              placeholder={lang === 'zh' ? '请输入...' : 'Please enter...'}
              style={{ width: '100%', padding: '0.6em', fontSize: '1em', borderRadius: 8, border: '1.5px solid #b2ebf2', marginBottom: 12 }}
              onKeyDown={e => { if (e.key === 'Enter') { handleQuizSubmit(); } }}
              autoFocus
            />
            {quizError && <div style={{ color: '#ff6ec4', marginBottom: 8, fontWeight: 600 }}>{quizError}</div>}
            <button className="contact-btn" style={{ width: '100%', marginBottom: 8 }} onClick={handleQuizSubmit}>
              {lang === 'zh' ? '提交' : 'Submit'}
            </button>
            <button className="close-btn" onClick={() => setShowContactQuiz(false)}>{lang === 'zh' ? '取消' : 'Cancel'}</button>
          </div>
        </div>
      )}
      {/* 弹窗 */}
      {showContact && (
        <div className="contact-modal-mask" onClick={() => setShowContact(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <h2>{lang === 'zh' ? '联系方式' : 'Contact Info'}</h2>
            <div className="modal-contacts">
              {p.contacts.map((c) => (
                <div className="contact-item modal" key={c.label}>
                  {c.icon}
                  <span>{c.label}:</span>
                  <span className="contact-value">{c.value}</span>
                </div>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowContact(false)}>
              {lang === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
