import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph3D from 'react-force-graph-3d';
import { useAppStore } from '../../store/useAppStore';
import Card from '../ui/Card';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

interface GraphNode {
    id: string;
    name: string;
    val: number;
    type: 'course' | 'section' | 'term';
    sections?: number;
    terms?: number;
    x?: number;
    y?: number;
    z?: number;
}

interface GraphLink {
    source: string;
    target: string;
}

export default function KnowledgeGalaxy() {
    const navigate = useNavigate();
    const { notes } = useAppStore();
    const fgRef = useRef<any>(null);
    const hasCenteredRef = useRef(false);

    // Reset centering flag when notes change
    useEffect(() => {
        hasCenteredRef.current = false;
    }, [notes]);

    const graphData = useMemo(() => {
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // Calculate layout for course nodes (stars)
        const courseRadius = 4000; // Radius for separating galaxies

        notes.forEach((note, index) => {
            // Calculate position for the course node to ensure spacing
            const angle = (index / notes.length) * Math.PI * 2;
            const x = Math.cos(angle) * courseRadius;
            const y = Math.sin(angle) * courseRadius;

            nodes.push({
                id: note.id,
                name: note.courseName || '未命名課程',
                val: 40,
                type: 'course',
                sections: note.sections.length,
                terms: note.terms?.length || 0,
                x: x, // Initial X
                y: y, // Initial Y
                z: 0  // Initial Z
            });

            note.sections.forEach(section => {
                nodes.push({
                    id: section.id,
                    name: section.title,
                    val: 15,
                    type: 'section'
                });

                links.push({
                    source: note.id,
                    target: section.id
                });
            });

            note.terms?.forEach(term => {
                nodes.push({
                    id: `term-${term.term}`,
                    name: term.term,
                    val: 8,
                    type: 'term'
                });

                links.push({
                    source: note.id,
                    target: `term-${term.term}`
                });
            });
        });

        return { nodes, links };
    }, [notes]);

    const handleNodeClick = (node: any) => {
        if (node.type === 'course') {
            setTimeout(() => {
                navigate(`/notes/${node.id}`);
            }, 300);
        }
    };

    const [isLegendOpen, setIsLegendOpen] = useState(false);

    useEffect(() => {
        if (fgRef.current) {
            const camera = fgRef.current.camera();
            const renderer = fgRef.current.renderer();

            if (camera) {
                camera.near = 0.1;
                camera.far = 10000;
                camera.updateProjectionMatrix();
            }

            if (renderer) {
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.sortObjects = false;
            }
        }
    }, []);

    const getGlowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 32, 32);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [controlMode, setControlMode] = useState<'orbit' | 'pan'>('orbit');

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });

                // Re-center on resize
                if (fgRef.current) {
                    fgRef.current.camera().aspect = width / height;
                    fgRef.current.camera().updateProjectionMatrix();
                    fgRef.current.renderer().setSize(width, height);
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Update controls based on mode
    useEffect(() => {
        if (fgRef.current) {
            const controls = fgRef.current.controls();
            if (controls) {
                if (controlMode === 'pan') {
                    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
                    controls.touches.ONE = THREE.TOUCH.PAN;
                } else {
                    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
                    controls.touches.ONE = THREE.TOUCH.ROTATE;
                }
                controls.update();
            }
        }
    }, [controlMode]);

    // Memoize geometries and materials for performance
    const materials = useMemo(() => ({
        course: new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.9 }),
        section: new THREE.MeshPhongMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.2, shininess: 50 }),
        term: new THREE.MeshLambertMaterial({ color: 0xa78bfa }),
        glow: new THREE.SpriteMaterial({
            map: getGlowTexture,
            color: 0xffaa00,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        })
    }), [getGlowTexture]);

    const geometries = useMemo(() => ({
        course: new THREE.SphereGeometry(8, 32, 32),
        section: new THREE.SphereGeometry(4, 24, 24),
        term: new THREE.SphereGeometry(2, 16, 16)
    }), []);

    return (
        <Card>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">🌌</span>
                        知識星系 Knowledge Galaxy
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        目前規模：{notes.length} 顆恆星 ⭐
                    </p>
                </div>

                {/* Control Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setControlMode('orbit')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${controlMode === 'orbit'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        🔄 旋轉
                    </button>
                    <button
                        onClick={() => setControlMode('pan')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${controlMode === 'pan'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        ✋ 移動
                    </button>
                </div>
            </div>

            {notes.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4">🌠</div>
                    <p className="text-lg font-medium">宇宙還是一片虛無...</p>
                    <p className="text-sm mt-2">上傳筆記來創造星系吧！</p>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className={`relative h-[600px] w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-purple-500/30 cursor-${controlMode === 'pan' ? 'grab' : 'default'}`}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
                        <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                            {[...Array(100)].map((_, i) => {
                                const size = Math.random() * 1.5;
                                const x = Math.random() * 100;
                                const y = Math.random() * 100;
                                const opacity = Math.random() * 0.8;
                                return (
                                    <circle
                                        key={i}
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r={size}
                                        fill={Math.random() > 0.9 ? '#a78bfa' : 'white'}
                                        opacity={opacity}
                                    />
                                );
                            })}
                        </svg>
                    </div>

                    {dimensions.width > 0 && (
                        <ForceGraph3D
                            ref={fgRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            graphData={graphData}
                            backgroundColor="rgba(0,0,0,0)"
                            nodeThreeObject={(node: any) => {
                                const group = new THREE.Group();
                                let geometry;
                                let material;
                                let size;

                                if (node.type === 'course') {
                                    size = 8;
                                    geometry = geometries.course;
                                    material = materials.course;

                                    const sprite = new THREE.Sprite(materials.glow);
                                    sprite.scale.set(size * 4, size * 4, 1);
                                    group.add(sprite);
                                } else if (node.type === 'section') {
                                    size = 4;
                                    geometry = geometries.section;
                                    material = materials.section;
                                } else {
                                    size = 2;
                                    geometry = geometries.term;
                                    material = materials.term;
                                }

                                const mesh = new THREE.Mesh(geometry, material);
                                group.add(mesh);

                                const sprite = new SpriteText(node.name);
                                sprite.color = 'white';
                                sprite.textHeight = node.type === 'course' ? 4 : (node.type === 'section' ? 2.5 : 1.5);
                                (sprite as any).position.set(0, -size - 4, 0);
                                sprite.backgroundColor = 'rgba(0,0,0,0.6)';
                                sprite.padding = 3;
                                sprite.borderRadius = 6;
                                group.add(sprite);

                                return group;
                            }}
                            nodeLabel={(node: any) => node.name}
                            linkColor={() => 'rgba(100, 200, 255, 0.2)'}
                            linkWidth={0.5}
                            onNodeClick={(node) => {
                                if (controlMode === 'orbit') {
                                    handleNodeClick(node);
                                }
                            }}
                            onEngineStop={() => {
                                // Only center if we haven't done so for this set of notes
                                if (!hasCenteredRef.current) {
                                    const latestNote = notes[notes.length - 1];
                                    const targetNode = latestNote
                                        ? graphData.nodes.find(n => n.id === latestNote.id)
                                        : graphData.nodes.find(n => n.type === 'course');

                                    if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined && targetNode.z !== undefined) {
                                        const isMobile = window.innerWidth < 768;
                                        const distance = isMobile ? 350 : 200;

                                        fgRef.current?.cameraPosition(
                                            { x: targetNode.x, y: targetNode.y + (isMobile ? 50 : 0), z: targetNode.z + distance },
                                            { x: targetNode.x, y: targetNode.y, z: targetNode.z },
                                            1000
                                        );

                                        // Mark as centered so we don't reset on subsequent renders (like mode switching)
                                        hasCenteredRef.current = true;
                                    }
                                }
                            }}
                            enableNodeDrag={false}
                            enableNavigationControls={true}
                            controlType="orbit"
                            showNavInfo={false}
                            d3VelocityDecay={0.3}
                            d3AlphaDecay={0.01}
                            warmupTicks={100}
                            cooldownTicks={0}
                        />
                    )}

                    <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-xl">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg"></div>
                    </div>

                    <div className={`absolute bottom-4 right-4 transition-all duration-300 ease-in-out ${isLegendOpen ? 'bg-black/80 border-cyan-500/30' : 'bg-black/40 border-white/10 hover:bg-black/60'} backdrop-blur-md rounded-xl border shadow-2xl overflow-hidden pointer-events-auto`}>
                        <button
                            onClick={() => setIsLegendOpen(!isLegendOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span>ℹ️</span>
                                <span>{isLegendOpen ? '星系指南' : '顯示指南'}</span>
                            </div>
                            <span className="text-lg leading-none">{isLegendOpen ? '×' : '+'}</span>
                        </button>

                        {isLegendOpen && (
                            <div className="px-5 pb-4 text-xs space-y-4 min-w-[200px]">
                                <div className="space-y-2 border-b border-gray-700 pb-3">
                                    <div className="font-bold text-gray-300 mb-1">星體圖例</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                                        <span className="text-gray-300">恆星 (筆記)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]"></div>
                                        <span className="text-gray-300">行星 (章節)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                        <span className="text-gray-300">衛星 (術語)</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-bold text-gray-300 mb-1">操作指南</div>
                                    <div className="text-gray-400 flex items-center gap-2">
                                        <span>🖱️</span> 拖曳旋轉
                                    </div>
                                    <div className="text-gray-400 flex items-center gap-2">
                                        <span>🔍</span> 滾輪縮放
                                    </div>
                                    <div className="text-gray-400 flex items-center gap-2">
                                        <span>💫</span> 點擊導航
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-4 right-4 bg-gradient-to-br from-purple-600 to-blue-600 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg border-2 border-white/30">
                        ✨ {graphData.nodes.length} 個節點
                    </div>
                </div>
            )}
        </Card>
    );
}
