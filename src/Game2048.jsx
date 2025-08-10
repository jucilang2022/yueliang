import { useState, useEffect, useCallback } from 'react';

const SIZE = 4;
const INIT_BOARD = () => {
  const board = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
  addRandom(board);
  addRandom(board);
  return board;
};

function addRandom(board) {
  const empty = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) empty.push([i, j]);
    }
  }
  if (empty.length) {
    const [i, j] = empty[Math.floor(Math.random() * empty.length)];
    board[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
}

function getTileColor(val) {
  const colors = {
    0: '#e3f0fc',
    2: '#c6e2ff',
    4: '#a7d3fa',
    8: '#7bb8f9',
    16: '#4f8cff',
    32: '#3a6fd8',
    64: '#2b4fa2',
    128: '#1e3877',
    256: '#17406a',
    512: '#0e2a4c',
    1024: '#0a1c33',
    2048: '#001a3a',
  };
  return colors[val] || '#001a3a';
}

function clone(board) {
  return board.map(row => [...row]);
}

function transpose(board) {
  return board[0].map((_, i) => board.map(row => row[i]));
}

function reverse(board) {
  return board.map(row => [...row].reverse());
}

function moveLeft(board) {
  let moved = false;
  let score = 0;
  const newBoard = board.map(row => {
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr[i + 1] = 0;
        i++;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < SIZE) arr.push(0);
    if (arr.some((v, idx) => v !== row[idx])) moved = true;
    return arr;
  });
  return { newBoard, moved, score };
}

function move(board, dir) {
  let b = clone(board);
  let moved = false;
  let score = 0;
  if (dir === 'left') {
    const res = moveLeft(b);
    b = res.newBoard;
    moved = res.moved;
    score = res.score;
  } else if (dir === 'right') {
    b = reverse(b);
    const res = moveLeft(b);
    b = reverse(res.newBoard);
    moved = res.moved;
    score = res.score;
  } else if (dir === 'up') {
    b = transpose(b);
    const res = moveLeft(b);
    b = transpose(res.newBoard);
    moved = res.moved;
    score = res.score;
  } else if (dir === 'down') {
    b = transpose(b);
    b = reverse(b);
    const res = moveLeft(b);
    b = reverse(res.newBoard);
    b = transpose(b);
    moved = res.moved;
    score = res.score;
  }
  return { newBoard: b, moved, score };
}

function hasMoves(board) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) return true;
      if (i < SIZE - 1 && board[i][j] === board[i + 1][j]) return true;
      if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) return true;
    }
  }
  return false;
}

export default function Game2048({ lang = 'zh' }) {
  const [board, setBoard] = useState(INIT_BOARD());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const texts = {
    zh: {
      title: '2048',
      score: '分数',
      tip: '方向键/WASD操作，合成2048赢得胜利！',
      win: '🎉 你赢啦！',
      over: '游戏结束',
      again: '再来一局',
    },
    en: {
      title: '2048',
      score: 'Score',
      tip: 'Use Arrow keys or WASD. Reach 2048 to win!',
      win: '🎉 You win!',
      over: 'Game Over',
      again: 'Try Again',
    },
  };
  const t = texts[lang] || texts.zh;

  const handleKey = useCallback((e) => {
    if (gameOver || win) return;
    let dir = null;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = 'left';
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = 'right';
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = 'up';
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = 'down';
    if (!dir) return;
    e.preventDefault();
    const { newBoard, moved, score: addScore } = move(board, dir);
    if (moved) {
      addRandom(newBoard);
      setBoard(newBoard);
      setScore(s => s + addScore);
      if (newBoard.flat().includes(2048)) setWin(true);
      else if (!hasMoves(newBoard)) setGameOver(true);
    }
  }, [board, gameOver, win]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleRestart = () => {
    setBoard(INIT_BOARD());
    setScore(0);
    setGameOver(false);
    setWin(false);
  };

  return (
    <div style={{ width: 320, background: 'linear-gradient(135deg, #e3f0fc 0%, #b2d8fa 100%)', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(79,140,255,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, position: 'relative' }}>
      <h3 style={{ color: '#4f8cff', marginBottom: 8 }}>{t.title}</h3>
      <div style={{ color: '#4f8cff', fontWeight: 600, marginBottom: 12 }}>{t.score}：{score}</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${SIZE}, 56px)`,
        gridTemplateRows: `repeat(${SIZE}, 56px)`,
        gap: 8,
        background: '#b2d8fa',
        borderRadius: 12,
        padding: 8,
      }}>
        {board.flat().map((val, idx) => (
          <div key={idx} style={{
            width: 56,
            height: 56,
            background: getTileColor(val),
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: val ? 22 : 18,
            color: val <= 4 ? '#4f8cff' : '#fff',
            boxShadow: val ? '0 2px 8px 0 rgba(79,140,255,0.10)' : 'none',
            transition: 'background 0.2s',
            userSelect: 'none',
          }}>{val || ''}</div>
        ))}
      </div>
      <div style={{marginTop: 16, color: '#4f8cff', fontSize: 14}}>{t.tip}</div>
      {(gameOver || win) && (
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
          <div style={{ color: win ? '#4f8cff' : '#ff6ec4', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
            {win ? t.win : t.over}
          </div>
          <button onClick={handleRestart} style={{padding: '0.6em 2em', fontSize: 16, borderRadius: 8, border: 'none', background: '#4f8cff', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 8}}>{t.again}</button>
        </div>
      )}
    </div>
  );
} 
