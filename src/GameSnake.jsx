import { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_SIZE = 15;
const INIT_SNAKE = [
  { x: 7, y: 7 },
  { x: 6, y: 7 },
];
const INIT_DIR = 'right';

function getRandomFood(snake) {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    if (!snake.some(seg => seg.x === x && seg.y === y)) {
      return { x, y };
    }
  }
}

function isCollision(snake, pos) {
  return snake.some(seg => seg.x === pos.x && seg.y === pos.y);
}

export default function GameSnake({ lang = 'zh' }) {
  const [snake, setSnake] = useState([...INIT_SNAKE]);
  const [dir, setDir] = useState(INIT_DIR);
  const [food, setFood] = useState(getRandomFood(INIT_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const moveRef = useRef();
  moveRef.current = dir;

  const texts = {
    zh: {
      title: '贪吃蛇',
      score: '分数',
      tip: '方向键/WASD控制，吃到食物得分，撞墙或自咬游戏结束',
      again: '再来一局',
      over: '游戏结束',
    },
    en: {
      title: 'Snake',
      score: 'Score',
      tip: 'Use Arrow keys or WASD. Eat food, avoid walls and yourself!',
      again: 'Try Again',
      over: 'Game Over',
    },
  };
  const t = texts[lang] || texts.zh;

  // 方向控制
  const handleKey = useCallback((e) => {
    if (gameOver) return;
    let newDir = moveRef.current;
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && moveRef.current !== 'down') newDir = 'up';
    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && moveRef.current !== 'up') newDir = 'down';
    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && moveRef.current !== 'right') newDir = 'left';
    if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && moveRef.current !== 'left') newDir = 'right';
    setDir(newDir);
  }, [gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // 移动逻辑
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] };
        if (moveRef.current === 'up') head.y -= 1;
        if (moveRef.current === 'down') head.y += 1;
        if (moveRef.current === 'left') head.x -= 1;
        if (moveRef.current === 'right') head.x += 1;
        // 撞墙
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameOver(true);
          return prev;
        }
        // 自咬
        if (isCollision(prev, head)) {
          setGameOver(true);
          return prev;
        }
        let newSnake = [head, ...prev];
        // 吃到食物
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(getRandomFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 160); // 速度调慢
    return () => clearInterval(timer);
  }, [food, gameOver]);

  // 手机端触摸滑动控制
  useEffect(() => {
    let startX = null, startY = null;
    function handleTouchStart(e) {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }
    function handleTouchEnd(e) {
      if (startX === null || startY === null) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // 左右
          if (dx > 0 && moveRef.current !== 'left') setDir('right');
          else if (dx < 0 && moveRef.current !== 'right') setDir('left');
        } else {
          // 上下
          if (dy > 0 && moveRef.current !== 'up') setDir('down');
          else if (dy < 0 && moveRef.current !== 'down') setDir('up');
        }
      }
      startX = null;
      startY = null;
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleRestart = () => {
    setSnake([...INIT_SNAKE]);
    setDir(INIT_DIR);
    setFood(getRandomFood(INIT_SNAKE));
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ width: 360, background: 'linear-gradient(135deg, #e3f0fc 0%, #b2d8fa 100%)', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(79,140,255,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, position: 'relative' }}>
      <h3 style={{ color: '#43e97b', marginBottom: 8 }}>{t.title}</h3>
      <div style={{ color: '#43e97b', fontWeight: 600, marginBottom: 12 }}>{t.score}：{score}</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 16px)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 16px)`,
        gap: 2,
        background: '#b2d8fa',
        borderRadius: 8,
        padding: 6,
        marginBottom: 10,
      }}>
        {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, idx) => {
          const x = idx % BOARD_SIZE;
          const y = Math.floor(idx / BOARD_SIZE);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = snake.slice(1).some(seg => seg.x === x && seg.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div key={idx} style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: isHead ? '#43e97b' : isBody ? '#a084ee' : isFood ? '#ff6ec4' : '#e3f0fc',
              boxShadow: isHead || isFood ? '0 2px 8px 0 rgba(67,233,123,0.10)' : 'none',
              border: isFood ? '2px solid #ff6ec4' : 'none',
              transition: 'background 0.1s',
            }} />
          );
        })}
      </div>
      <div style={{marginTop: 8, color: '#43e97b', fontSize: 14}}>{t.tip}</div>
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
          <button onClick={handleRestart} style={{padding: '0.6em 2em', fontSize: 16, borderRadius: 8, border: 'none', background: '#43e97b', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 8}}>{t.again}</button>
        </div>
      )}
    </div>
  );
} 