import React, { useRef, useEffect, useState } from 'react';

const GAME_W = 320;
const GAME_H = 400;
const BIRD_SIZE = 32;
const GRAVITY = 0.35;
const FLAP = -4.5;
const PIPE_W = 48;
const PIPE_GAP = 110;
const PIPE_INTERVAL = 1400;
const PIPE_SPEED = 2.2;

export default function GameFlappyBird({ lang = 'zh' }) {
    const texts = {
        zh: {
            title: 'Flappy Bird',
            tip: '点击或空格让小鸟飞翔，躲避障碍物！',
            start: '点击或空格开始',
            score: '分数',
            over: '游戏结束',
            again: '再来一局',
        },
        en: {
            title: 'Flappy Bird',
            tip: 'Click or press Space to fly. Avoid the pipes!',
            start: 'Click or press Space to start',
            score: 'Score',
            over: 'Game Over',
            again: 'Try Again',
        }
    };
    const t = texts[lang] || texts.zh;

    const [birdY, setBirdY] = useState(GAME_H / 2 - BIRD_SIZE / 2);
    const [birdV, setBirdV] = useState(0);
    const [pipes, setPipes] = useState([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('ready'); // ready | running | over
    const [tick, setTick] = useState(0);
    const rafRef = useRef();
    const lastPipeTime = useRef(Date.now());

    // 游戏主循环
    useEffect(() => {
        if (gameState === 'running') {
            rafRef.current = requestAnimationFrame(loop);
            return () => cancelAnimationFrame(rafRef.current);
        }
    });

    function loop() {
        setTick(t => t + 1);
        rafRef.current = requestAnimationFrame(loop);
    }

    // 物理与碰撞
    useEffect(() => {
        if (gameState !== 'running') return;
        // 小鸟下落
        setBirdY(y => y + birdV);
        setBirdV(v => v + GRAVITY);
        // 生成新管道
        if (Date.now() - lastPipeTime.current > PIPE_INTERVAL) {
            const topH = Math.random() * (GAME_H - PIPE_GAP - 80) + 40;
            setPipes(ps => [...ps, { x: GAME_W, top: topH }]);
            lastPipeTime.current = Date.now();
        }
        // 管道移动
        setPipes(ps => ps.map(p => ({ ...p, x: p.x - PIPE_SPEED })).filter(p => p.x > -PIPE_W));
        // 计分
        setPipes(ps => {
            let add = 0;
            const newPipes = ps.map(p => {
                if (!p.passed && p.x + PIPE_W < GAME_W / 2 - BIRD_SIZE / 2) {
                    add = 1;
                    return { ...p, passed: true };
                }
                return p;
            });
            if (add) setScore(s => s + 1);
            return newPipes;
        });
        // 碰撞检测
        const birdBox = {
            x: GAME_W / 2 - BIRD_SIZE / 2 + BIRD_SIZE * 0.1,
            y: birdY + BIRD_SIZE * 0.1,
            w: BIRD_SIZE * 0.8,
            h: BIRD_SIZE * 0.8,
        };
        for (const p of pipes) {
            // 上管道
            const topBox = { x: p.x, y: 0, w: PIPE_W, h: p.top };
            // 下管道
            const botBox = { x: p.x, y: p.top + PIPE_GAP, w: PIPE_W, h: GAME_H - p.top - PIPE_GAP };
            if (isCollide(birdBox, topBox) || isCollide(birdBox, botBox)) {
                setGameState('over');
                return;
            }
        }
        // 地面/天花板
        if (birdY < 0 || birdY + BIRD_SIZE > GAME_H) {
            setGameState('over');
            return;
        }
    }, [tick]);

    // 控制
    useEffect(() => {
        function onAction(e) {
            if (e.type === 'keydown' && e.repeat) return;
            if (gameState === 'ready') {
                setGameState('running');
                setBirdY(GAME_H / 2 - BIRD_SIZE / 2);
                setBirdV(FLAP);
                setPipes([]);
                setScore(0);
                lastPipeTime.current = Date.now();
            } else if (gameState === 'running') {
                setBirdV(FLAP);
            } else if (gameState === 'over') {
                setGameState('ready');
                setBirdY(GAME_H / 2 - BIRD_SIZE / 2);
                setBirdV(0);
                setPipes([]);
                setScore(0);
            }
        }
        function onKey(e) {
            if (e.code === 'Space') onAction(e);
        }
        function onClick(e) {
            onAction(e);
        }
        window.addEventListener('keydown', onKey);
        window.addEventListener('mousedown', onClick);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('mousedown', onClick);
        };
    }, [gameState]);

    function isCollide(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    // 渲染
    return (
        <div style={{ width: GAME_W, height: GAME_H, background: 'linear-gradient(135deg, #fffbe3 0%, #ffe6b2 100%)', borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(255,174,79,0.10)', position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
            {/* 分数 */}
            <div style={{ position: 'absolute', top: 12, left: 0, width: '100%', textAlign: 'center', color: '#ffb300', fontWeight: 700, fontSize: 20, textShadow: '0 2px 8px #fffbe3' }}>{t.score}：{score}</div>
            {/* 小鸟 */}
            <div style={{ position: 'absolute', left: GAME_W / 2 - BIRD_SIZE / 2, top: birdY, width: BIRD_SIZE, height: BIRD_SIZE, background: '#ffb300', borderRadius: '50%', boxShadow: '0 2px 8px #ffe6b2', border: '2.5px solid #fffbe3', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', marginLeft: 7, marginTop: 2, border: '1.5px solid #ffb300' }} />
                <div style={{ width: 7, height: 7, background: '#333', borderRadius: '50%', position: 'absolute', left: 18, top: 10 }} />
                <div style={{ width: 10, height: 10, background: '#ff6ec4', borderRadius: '50%', position: 'absolute', left: 8, top: 20, opacity: 0.7 }} />
            </div>
            {/* 管道 */}
            {pipes.map((p, i) => (
                <React.Fragment key={i}>
                    {/* 上管道 */}
                    <div style={{ position: 'absolute', left: p.x, top: 0, width: PIPE_W, height: p.top, background: '#4f8cff', borderRadius: '12px 12px 0 0', boxShadow: '0 2px 8px #b2d8fa', border: '2px solid #b2d8fa' }} />
                    {/* 下管道 */}
                    <div style={{ position: 'absolute', left: p.x, top: p.top + PIPE_GAP, width: PIPE_W, height: GAME_H - p.top - PIPE_GAP, background: '#4f8cff', borderRadius: '0 0 12px 12px', boxShadow: '0 2px 8px #b2d8fa', border: '2px solid #b2d8fa' }} />
                </React.Fragment>
            ))}
            {/* 提示/开始/结束 */}
            {gameState === 'ready' && (
                <div style={{ position: 'absolute', top: 120, left: 0, width: '100%', textAlign: 'center', color: '#ffb300', fontWeight: 700, fontSize: 22, textShadow: '0 2px 8px #fffbe3' }}>{t.start}</div>
            )}
            {gameState === 'over' && (
                <div style={{ position: 'absolute', top: 120, left: 0, width: '100%', textAlign: 'center', color: '#ff6ec4', fontWeight: 800, fontSize: 28, textShadow: '0 2px 8px #fffbe3' }}>{t.over}</div>
            )}
            {/* 操作提示 */}
            <div style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center', color: '#ffb300', fontWeight: 500, fontSize: 14 }}>{t.tip}</div>
            {/* 再来一局按钮 */}
            {gameState === 'over' && (
                <button onClick={() => setGameState('ready')} style={{ position: 'absolute', top: 180, left: '50%', transform: 'translateX(-50%)', padding: '0.6em 2em', fontSize: 16, borderRadius: 8, border: 'none', background: '#4f8cff', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>{t.again}</button>
            )}
        </div>
    );
} 
