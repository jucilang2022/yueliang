import { useState } from 'react';
import { SiDouban, SiXiaohongshu, SiGithub, SiTencentqq, SiWechat, SiNeteasecloudmusic } from 'react-icons/si';
import { Email } from '@mui/icons-material';
import './App.css';

const profile = {
  zh: {
    name: '月亮',
    desc: '你好，我是月亮，一名热爱前端开发和生活的年轻人。喜欢探索新技术，热衷于分享和记录生活。',
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
    name: 'Yueliang',
    desc: "Hi, I'm Yueliang, a young developer passionate about frontend and life. I love exploring new tech and sharing my journey.",
    links: [
      { icon: <SiDouban />, name: 'Douban', url: 'https://www.douban.com/people/230674291' },
      { icon: <SiXiaohongshu />, name: 'Xiaohongshu', url: 'https://www.xiaohongshu.com/user/profile/5e8efca8000000000100a2d3' },
      { icon: <SiGithub />, name: 'GitHub', url: 'https://github.com/jucilang2022' },
      { icon: <SiNeteasecloudmusic />, name: 'NetEase Music', url: 'https://music.163.com/#/user/home?id=1443295984' },
    ],
    contacts: [
      { icon: <SiTencentqq />, label: 'QQ', value: '2544668581' },
      { icon: <Email />, label: 'Email', value: 'lizhengyang@douban.com' },
      { icon: <SiWechat />, label: 'WeChat', value: 'L15191880198' },
    ],
  },
};

function App() {
  const [lang, setLang] = useState('zh');
  const [showContact, setShowContact] = useState(false);
  const p = profile[lang];

  return (
    <div className="homepage-container">
      <div className="rainbow-bar"></div>
      {/* 右上角头像 */}
      <img
        className="avatar-floating"
        src="https://img9.doubanio.com/icon/ul290069963-4.jpg"
        alt="avatar"
      />
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
      </div>
      {/* 页脚联系方式按钮 */}
      <footer className="footer-contact">
        <button className="contact-btn" onClick={() => setShowContact(true)}>
          {lang === 'zh' ? '联系方式' : 'Contact'}
        </button>
      </footer>
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
