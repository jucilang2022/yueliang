import React, { useState } from 'react';

const texts = {
  zh: {
    title: '消消乐',
    back: '返回',
    score: '得分',
    tip: '点击两个相邻水果交换，3个及以上相同可消除',
  },
  en: {
    title: 'Eliminate Game',
    back: 'Back',
    score: 'Score',
    tip: 'Swap two adjacent fruits, 3+ in a row/col to eliminate',
  }
};

const fruits = [
  { color: '#ff6ec4', icon: '🍎' }, // 红-苹果
  { color: '#fcb045', icon: '🍊' }, // 橙-橙子
  { color: '#fff94c', icon: '🍋' }, // 黄-柠檬
  { color: '#38f9d7', icon: '🍏' }, // 青-青苹果
  { color: '#4f8cff', icon: '🍇' }, // 蓝-葡萄
];
const size = 8;

function randomFruit() {
  return Math.floor(Math.random() * fruits.length);
}

function createGrid() {
  // 生成初始无消除的格子
  let grid = Array(size * size).fill(0).map(randomFruit);
  // 保证初始无3连消
  for (let i = 0; i < size * size; i++) {
    let row = Math.floor(i / size), col = i % size;
    while (
      (col >= 2 && grid[i] === grid[i - 1] && grid[i] === grid[i - 2]) ||
      (row >= 2 && grid[i] === grid[i - size] && grid[i] === grid[i - 2 * size])
    ) {
      grid[i] = randomFruit();
    }
  }
  return grid;
}

function getRC(idx) {
  return [Math.floor(idx / size), idx % size];
}
function isAdjacent(a, b) {
  const [ar, ac] = getRC(a), [br, bc] = getRC(b);
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
}

function findMatches(grid) {
  // 返回所有需要消除的格子下标
  let matched = new Set();
  // 行
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      let cur = grid[r * size + c], prev = grid[r * size + c - 1];
      if (cur !== null && cur === prev) count++;
      else count = 1;
      if (count >= 3 && (c === size - 1 || cur !== grid[r * size + c + 1])) {
        for (let k = 0; k < count; k++) matched.add(r * size + c - k);
      }
    }
  }
  // 列
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      let cur = grid[r * size + c], prev = grid[(r - 1) * size + c];
      if (cur !== null && cur === prev) count++;
      else count = 1;
      if (count >= 3 && (r === size - 1 || cur !== grid[(r + 1) * size + c])) {
        for (let k = 0; k < count; k++) matched.add((r - k) * size + c);
      }
    }
  }
  return matched;
}

export default function GameEliminate({ lang = 'zh', onBack }) {
  const t = texts[lang] || texts.zh;
  const [grid, setGrid] = useState(createGrid());
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [animating, setAnimating] = useState(false);

  // 交换并消除逻辑
  function handleClick(idx) {
    if (animating) return;
    if (selected === null) {
      setSelected(idx);
      return;
    }
    if (selected === idx) {
      setSelected(null);
      return;
    }
    if (!isAdjacent(selected, idx)) {
      setSelected(null); // 优化：无效点击也清空选择，防止卡死
      return;
    }
    // 尝试交换
    let newGrid = grid.slice();
    [newGrid[selected], newGrid[idx]] = [newGrid[idx], newGrid[selected]];
    const matched = findMatches(newGrid);
    if (matched.size === 0) {
      setSelected(null);
      return;
    }
    setAnimating(true);
    setGrid(newGrid);
    setSelected(null);
    setTimeout(() => {
      eliminate(newGrid, matched, 0);
    }, 200);
  }

  // 消除、下落、补全
  function eliminate(curGrid, matched, combo) {
    let nextGrid = curGrid.slice();
    matched.forEach(i => nextGrid[i] = null);
    setScore(s => s + matched.size);
    setGrid(nextGrid.slice());
    setTimeout(() => {
      // 下落
      for (let c = 0; c < size; c++) {
        let col = [];
        for (let r = size - 1; r >= 0; r--) {
          let v = nextGrid[r * size + c];
          if (v !== null) col.push(v);
        }
        while (col.length < size) col.push(randomFruit());
        for (let r = size - 1; r >= 0; r--) {
          nextGrid[r * size + c] = col[size - 1 - r];
        }
      }
      setGrid(nextGrid.slice());
      // 检查是否还有可消除
      const nextMatched = findMatches(nextGrid);
      if (nextMatched.size > 0) {
        setTimeout(() => eliminate(nextGrid, nextMatched, combo + 1), 200);
      } else {
        setAnimating(false); // 优化：确保每次消除后都能重置
      }
    }, 200);
  }

  return (
    <div style={{ minWidth: 380, minHeight: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ color: '#a084ee', marginBottom: '0.5em', fontWeight: 800 }}>{t.title}</h2>
      <div style={{ marginBottom: 10, color: '#888', fontSize: '1em' }}>{t.tip}</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 42px)`,
        gridTemplateRows: `repeat(${size}, 42px)`,
        gap: 2,
        background: '#eee',
        borderRadius: 10,
        boxShadow: '0 2px 8px 0 rgba(160,132,238,0.10)',
        marginBottom: 18,
      }}>
        {grid.map((f, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: 42, height: 42,
              background: fruits[f] ? fruits[f].color : '#fff',
              borderRadius: 6,
              border: selected === i ? '2px solid #ff6ec4' : '1px solid #fff',
              boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#333', fontSize: '1.7em',
              userSelect: 'none',
              cursor: animating ? 'not-allowed' : 'pointer',
              transition: 'border 0.15s',
              opacity: f === null ? 0.2 : 1,
            }}
          >{f !== null && fruits[f].icon}</div>
        ))}
      </div>
      <div style={{ color: '#4f8cff', fontWeight: 700, fontSize: '1.1em', marginBottom: 10 }}>{t.score}: {score}</div>
      <button onClick={onBack} style={{ background: '#b2ebf2', color: '#00796b', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, width: 120, cursor: 'pointer' }}>{t.back}</button>
    </div>
  );
} 
