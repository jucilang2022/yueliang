import React, { useState } from 'react';

const texts = {
  zh: {
    title: '拼图小游戏',
    select: '选择难度',
    easy: '简单 (3x3)',
    medium: '中等 (4x4)',
    hard: '困难 (5x5)',
    start: '开始游戏',
    reset: '重置',
    tip: '点击空白块相邻的方块进行移动，拼出完整图片！',
    back: '返回',
    win: '恭喜你，拼图完成！',
    again: '再玩一次',
    changeImg: '切换图片',
    chooseImg: '选择一张图片',
    confirm: '确定',
    cancel: '取消',
  },
  en: {
    title: 'Puzzle Game',
    select: 'Select Difficulty',
    easy: 'Easy (3x3)',
    medium: 'Medium (4x4)',
    hard: 'Hard (5x5)',
    start: 'Start',
    reset: 'Reset',
    tip: 'Click a tile next to the blank to move it and complete the picture!',
    back: 'Back',
    win: 'Congratulations, you solved the puzzle!',
    again: 'Play Again',
    changeImg: 'Change Image',
    chooseImg: 'Choose an image',
    confirm: 'Confirm',
    cancel: 'Cancel',
  }
};

const imgList = [
  'https://img1.baidu.com/it/u=4293477457,634035788&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img2.baidu.com/it/u=674332157,2002410930&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  'https://img1.baidu.com/it/u=1327503112,3995552716&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
];

// 判断是否有解（逆序数法）
function isSolvable(arr, size) {
  let inv = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] && arr[j] && arr[i] > arr[j]) inv++;
    }
  }
  if (size % 2 === 1) return inv % 2 === 0;
  const blankRow = size - Math.floor(arr.indexOf(null) / size);
  return (inv + blankRow) % 2 === 0;
}

// 生成有解的乱序拼图
function genPuzzle(size) {
  let arr;
  do {
    arr = Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? null : i));
    // 洗牌
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr, size) || isSolved(arr));
  return arr;
}

function isSolved(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] !== i) return false;
  }
  return arr[arr.length - 1] === null;
}

export default function GamePuzzle({ lang = 'zh', onBack }) {
  const [difficulty, setDifficulty] = useState(3); // 3,4,5
  const [started, setStarted] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [win, setWin] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [showImgSel, setShowImgSel] = useState(false);
  const [imgSelIdx, setImgSelIdx] = useState(0);

  const t = texts[lang] || texts.zh;
  const defaultImg = imgList[imgIdx];

  // 开始游戏
  function startGame() {
    setTiles(genPuzzle(difficulty));
    setStarted(true);
    setWin(false);
  }

  // 重置
  function resetGame() {
    setTiles(genPuzzle(difficulty));
    setWin(false);
  }

  // 移动逻辑
  function moveTile(idx) {
    if (win) return;
    const size = difficulty;
    const blank = tiles.indexOf(null);
    const canMove = [
      blank - 1 === idx && blank % size !== 0,
      blank + 1 === idx && idx % size !== 0,
      blank - size === idx,
      blank + size === idx
    ].some(Boolean);
    if (!canMove) return;
    const newTiles = tiles.slice();
    [newTiles[blank], newTiles[idx]] = [newTiles[idx], newTiles[blank]];
    setTiles(newTiles);
    if (isSolved(newTiles)) setWin(true);
  }

  // 切换图片弹窗
  function openImgSel() {
    setImgSelIdx(imgIdx);
    setShowImgSel(true);
  }
  function confirmImgSel() {
    setImgIdx(imgSelIdx);
    setShowImgSel(false);
    // 切换图片后重置拼图
    if (started) resetGame();
  }

  // 生成拼图块
  const grid = started ? tiles : Array.from({ length: difficulty * difficulty }, (_, i) => i);

  // 计算每块边长，保证在手机端不会超出屏幕
  let vw = typeof window !== 'undefined' ? window.innerWidth : 375;
  const maxTotalWidth = vw * 0.9;
  const minThumb = 40;
  const gap = 24 + 8; // gap+marginRight
  // 先假设缩略图为 tileSize*difficulty/2，tileSize最大为60
  let tileSize = 60;
  let thumbSize = tileSize * difficulty / 2;
  // 迭代减小tileSize直到总宽度合适
  while ((tileSize * difficulty + thumbSize + gap > maxTotalWidth || tileSize > 60) && tileSize > 24) {
    tileSize--;
    thumbSize = Math.max(tileSize * difficulty / 2, minThumb);
  }

  return (
    <div style={{ minWidth: 320, minHeight: 320, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24 }}>
      {/* 左侧原图缩略图和切换图片按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: thumbSize, minWidth: minThumb, marginTop: 18, marginRight: 8 }}>
        <div style={{ width: thumbSize, height: thumbSize, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px 0 rgba(160,132,238,0.10)', background: '#fff' }}>
          <img src={defaultImg} alt="origin" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#fff' }} />
        </div>
        <button onClick={openImgSel} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1.2em', fontWeight: 700, marginTop: 12, width: '90%', cursor: 'pointer' }}>{t.changeImg}</button>
      </div>
      {/* 右侧拼图和操作区 */}
      <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#a084ee', marginBottom: '0.5em', fontWeight: 800 }}>{t.title}</h2>
        {!started && (
          <>
            <div style={{ marginBottom: '1em', color: '#4f8cff', fontWeight: 600 }}>{t.select}</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <button onClick={() => setDifficulty(3)} style={{ background: difficulty === 3 ? '#43e97b' : '#e0f7fa', color: '#333', border: 'none', borderRadius: 8, padding: '0.5em 1.2em', fontWeight: 700, cursor: 'pointer' }}>{t.easy}</button>
              <button onClick={() => setDifficulty(4)} style={{ background: difficulty === 4 ? '#43e97b' : '#e0f7fa', color: '#333', border: 'none', borderRadius: 8, padding: '0.5em 1.2em', fontWeight: 700, cursor: 'pointer' }}>{t.medium}</button>
              <button onClick={() => setDifficulty(5)} style={{ background: difficulty === 5 ? '#43e97b' : '#e0f7fa', color: '#333', border: 'none', borderRadius: 8, padding: '0.5em 1.2em', fontWeight: 700, cursor: 'pointer' }}>{t.hard}</button>
            </div>
            <button onClick={startGame} style={{ background: '#a084ee', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6em 2em', fontWeight: 700, fontSize: '1.1em', cursor: 'pointer', marginBottom: 12 }}>{t.start}</button>
            <button onClick={onBack} style={{ background: '#b2ebf2', color: '#00796b', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, marginLeft: 16, cursor: 'pointer' }}>{t.back}</button>
          </>
        )}
        {started && (
          <>
            <div style={{ marginBottom: 10, color: '#888', fontSize: '1em' }}>{t.tip}</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${difficulty}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${difficulty}, ${tileSize}px)`,
              gap: 0,
              marginBottom: 18,
              background: '#eee',
              borderRadius: 10,
              boxShadow: '0 2px 8px 0 rgba(160,132,238,0.10)'
            }}>
              {grid.map((val, i) => val === null ? (
                <div key={i} style={{ width: tileSize, height: tileSize, background: 'none' }} />
              ) : (
                <div
                  key={i}
                  style={{
                    width: tileSize, height: tileSize,
                    background: `url(${defaultImg})`,
                    backgroundSize: `${difficulty * tileSize}px ${difficulty * tileSize}px`,
                    backgroundPosition: `-${(val % difficulty) * tileSize}px -${Math.floor(val / difficulty) * tileSize}px`,
                    borderRadius: 0,
                    border: '1px solid #fff',
                    boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: '#fff', fontSize: '1.1em',
                    userSelect: 'none',
                    cursor: win ? 'default' : 'pointer',
                    opacity: win ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  onClick={() => moveTile(i)}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
              <button onClick={onBack} style={{ background: '#b2ebf2', color: '#00796b', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, width: 120, cursor: 'pointer' }}>{t.back}</button>
              <button onClick={resetGame} style={{ background: '#a084ee', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, width: 120, cursor: 'pointer' }}>{t.reset}</button>
            </div>
            {/* 胜利弹窗 */}
            {win && (
              <div style={{
                position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: '2em 2.5em', boxShadow: '0 8px 32px 0 rgba(160,132,238,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: '#43e97b', fontWeight: 800, fontSize: '1.3em', marginBottom: 18 }}>{t.win}</div>
                  <button onClick={resetGame} style={{ background: '#a084ee', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6em 2em', fontWeight: 700, fontSize: '1.1em', cursor: 'pointer', marginBottom: 8 }}>{t.again}</button>
                  <button onClick={onBack} style={{ background: '#b2ebf2', color: '#00796b', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, cursor: 'pointer' }}>{t.back}</button>
                </div>
              </div>
            )}
          </>
        )}
        {/* 切换图片弹窗 */}
        {showImgSel && (
          <div style={{
            position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '2em 2.5em', boxShadow: '0 8px 32px 0 rgba(160,132,238,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320 }}>
              <div style={{ color: '#4f8cff', fontWeight: 700, fontSize: '1.1em', marginBottom: 18 }}>{t.chooseImg}</div>
              <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
                {imgList.map((url, idx) => (
                  <div key={idx} style={{ border: imgSelIdx === idx ? '3px solid #43e97b' : '3px solid #eee', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', boxShadow: imgSelIdx === idx ? '0 2px 12px 0 rgba(67,233,123,0.10)' : 'none' }} onClick={() => setImgSelIdx(idx)}>
                    <img src={url} alt={`img${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={confirmImgSel} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, cursor: 'pointer' }}>{t.confirm}</button>
                <button onClick={() => setShowImgSel(false)} style={{ background: '#b2ebf2', color: '#00796b', border: 'none', borderRadius: 8, padding: '0.5em 1.5em', fontWeight: 700, cursor: 'pointer' }}>{t.cancel}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
