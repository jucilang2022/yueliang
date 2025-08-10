import { useState, useEffect, useRef } from 'react';

const KNIFE_RADIUS = 90; // 圆盘半径
const KNIFE_LEN = 38; // 飞刀长度
const INIT_KNIVES = 6; // 初始飞刀数
const ROTATE_SPEED = 1.2; // 旋转速度（度/帧）

function getRandomAngleList(n, minGap = 18) {
  // 生成n个随机角度，保证最小间隔
  const arr = [];
  while (arr.length < n) {
    let angle = Math.floor(Math.random() * 360);
    if (arr.every(a => Math.abs(((a - angle + 540) % 360) - 180) > minGap)) {
      arr.push(angle);
    }
  }
  return arr;
}

export default function GameKnife({ lang = 'zh' }) {
  const [knives, setKnives] = useState([]); // 已插入飞刀角度
  const [flying, setFlying] = useState(false); // 当前是否有飞刀在飞
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [rotate, setRotate] = useState(0); // 当前圆盘旋转角度
  const requestRef = useRef();

  const texts = {
    zh: {
      title: '飞刀挑战',
      score: '分数',
      tip: '点击屏幕/按钮发射飞刀，飞刀不能碰撞！',
      again: '再来一局',
      over: '游戏结束',
      btn: '发射',
    },
    en: {
      title: 'Knife Hit',
      score: 'Score',
      tip: 'Tap to throw knives. Don’t hit other knives!',
      again: 'Try Again',
      over: 'Game Over',
      btn: 'Throw',
    },
  };
  const t = texts[lang] || texts.zh;

  // 动画主循环
  useEffect(() => {
    if (gameOver) return;
    function animate() {
      setRotate(r => (r + ROTATE_SPEED) % 360);
      requestRef.current = requestAnimationFrame(animate);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver]);

  // 点击发射飞刀
  function handleShoot() {
    if (flying || gameOver) return;
    setFlying(true);
    // 飞刀动画
    setTimeout(() => {
      // 计算插入角度
      const angle = (360 - rotate) % 360;
      // 检查碰撞
      const hit = knives.some(a => Math.abs(((a - angle + 540) % 360) - 180) < 15);
      if (hit) {
        setGameOver(true);
        setFlying(false);
        return;
      }
      setKnives([...knives, angle]);
      setScore(s => s + 1);
      setFlying(false);
    }, 220);
  }

  // 触摸支持
  useEffect(() => {
    function handleTouch(e) {
      e.preventDefault();
      handleShoot();
    }
    window.addEventListener('touchstart', handleTouch, { passive: false });
    return () => window.removeEventListener('touchstart', handleTouch);
  });

  const handleRestart = () => {
    setKnives(getRandomAngleList(INIT_KNIVES));
    setScore(0);
    setGameOver(false);
    setFlying(false);
    setRotate(0);
  };

  // 初始化
  useEffect(() => {
    setKnives(getRandomAngleList(INIT_KNIVES));
    setScore(0);
    setGameOver(false);
    setFlying(false);
    setRotate(0);
  }, [lang]);

  // SVG渲染飞刀
  function renderKnives() {
    return knives.map((a, i) => {
      const rad = (a + rotate) * Math.PI / 180;
      const x1 = 120 + Math.sin(rad) * KNIFE_RADIUS;
      const y1 = 120 - Math.cos(rad) * KNIFE_RADIUS;
      const x2 = 120 + Math.sin(rad) * (KNIFE_RADIUS - KNIFE_LEN);
      const y2 = 120 - Math.cos(rad) * (KNIFE_RADIUS - KNIFE_LEN);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a084ee" strokeWidth="6" strokeLinecap="round" />;
    });
  }

  return (
    <div style={{ width: 260, background: 'linear-gradient(135deg, #e3f0fc 0%, #b2d8fa 100%)', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(79,140,255,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, position: 'relative' }}>
      <h3 style={{ color: '#a084ee', marginBottom: 8 }}>{t.title}</h3>
      <div style={{ color: '#a084ee', fontWeight: 600, marginBottom: 12 }}>{t.score}：{score}</div>
      <svg width="240" height="240" style={{ marginBottom: 10, userSelect: 'none', touchAction: 'none' }} onClick={handleShoot}>
        {/* 圆盘 */}
        <circle cx="120" cy="120" r={KNIFE_RADIUS} fill="#fff" stroke="#a084ee" strokeWidth="6" />
        {/* 已插入飞刀 */}
        {renderKnives()}
        {/* 中心点 */}
        <circle cx="120" cy="120" r="12" fill="#a084ee" />
        {/* 飞刀动画 */}
        {flying && (
          <line x1="120" y1="220" x2="120" y2={120 + KNIFE_RADIUS} stroke="#ff6ec4" strokeWidth="6" strokeLinecap="round" />
        )}
      </svg>
      <div style={{marginTop: 8, color: '#a084ee', fontSize: 14}}>{t.tip}</div>
      <button className="game-btn" style={{ background: '#a084ee', color: '#fff', fontWeight: 700, fontSize: '1.08em', borderRadius: 10, padding: '0.5em 1.5em', border: 'none', cursor: 'pointer', marginTop: 8 }} onClick={handleShoot} disabled={flying || gameOver}>{t.btn}</button>
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(227,240,252,0.92)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
          <div style={{ color: '#ff6ec4', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
            {t.over}
          </div>
          <button onClick={handleRestart} style={{padding: '0.6em 2em', fontSize: 16, borderRadius: 8, border: 'none', background: '#a084ee', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 8}}>{t.again}</button>
        </div>
      )}
    </div>
  );
} 