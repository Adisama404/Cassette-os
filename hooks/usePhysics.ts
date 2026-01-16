import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface PhysicsBody {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    vRotation: number;
    isDragging: boolean;
    width: number;
    height: number;
    mass: number;
}

const FRICTION = 0.92;
const ANGULAR_FRICTION = 0.90;
const BOUNCE = 0.4;
const EDGE_PADDING = 20;
const BOTTOM_PADDING = 180; // Reserve space for Mini Player

export const usePhysics = (initialBodies: PhysicsBody[]) => {
    // We use a ref for the mutable state to avoid re-renders on every frame
    const bodiesRef = useRef<PhysicsBody[]>(initialBodies);
    // We expose a state version for React to render
    const [bodiesState, setBodiesState] = useState<PhysicsBody[]>(initialBodies);

    const requestRef = useRef<number>();
    const dragRef = useRef<{ id: string | null; startX: number; startY: number; lastX: number; lastY: number }>({
        id: null,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0
    });

    // Initialize or Update bodies when props change (handling new playlists)
    useEffect(() => {
        // Only add new ones, don't overwrite existing positions
        const currentIds = new Set(bodiesRef.current.map(b => b.id));
        const newBodies = initialBodies.filter(b => !currentIds.has(b.id));
        if (newBodies.length > 0) {
            bodiesRef.current = [...bodiesRef.current, ...newBodies];
            setBodiesState([...bodiesRef.current]);
        }
    }, [initialBodies]);

    const update = useCallback(() => {
        const { innerWidth, innerHeight } = window;
        const dragging = dragRef.current; // access current drag state

        bodiesRef.current.forEach(body => {
            if (body.isDragging) {
                // Velocity is calculated by mouse movement in handleMove
                // Here we just keep it still or follow mouse (handled by logic below)
                // Actually, for direct 1:1 drag, we don't update physics position here, 
                // we update it in handling the pointer move.
                // But we should zero out velocity so it doesn't fly away when released
                // We track "throw" velocity separately.
            } else {
                // Apply Physics
                body.x += body.vx;
                body.y += body.vy;
                body.rotation += body.vRotation;

                // Friction
                body.vx *= FRICTION;
                body.vy *= FRICTION;
                body.vRotation *= ANGULAR_FRICTION;

                // Floor/Wall Collisions (Bounds)
                // Left
                if (body.x < EDGE_PADDING) {
                    body.x = EDGE_PADDING;
                    body.vx *= -BOUNCE;
                    body.vRotation += body.vy * 0.1; // Spin on impact
                }
                // Right
                if (body.x > innerWidth - body.width - EDGE_PADDING) {
                    body.x = innerWidth - body.width - EDGE_PADDING;
                    body.vx *= -BOUNCE;
                    body.vRotation -= body.vy * 0.1;
                }
                // Top
                if (body.y < EDGE_PADDING) {
                    body.y = EDGE_PADDING;
                    body.vy *= -BOUNCE;
                }
                // Bottom
                if (body.y > innerHeight - body.height - BOTTOM_PADDING) {
                    body.y = innerHeight - body.height - BOTTOM_PADDING;
                    body.vy *= -BOUNCE;
                    body.vRotation += body.vx * 0.1; // Friction spin
                }

                // Stop if super slow
                if (Math.abs(body.vx) < 0.01) body.vx = 0;
                if (Math.abs(body.vy) < 0.01) body.vy = 0;
                if (Math.abs(body.vRotation) < 0.01) body.vRotation = 0;
            }
        });

        // Trigger render
        setBodiesState([...bodiesRef.current]);
        requestRef.current = requestAnimationFrame(update);
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [update]);

    // Handlers
    const onPointerDown = (id: string, e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent page scroll or other interactions
        const body = bodiesRef.current.find(b => b.id === id);
        if (body) {
            body.isDragging = true;
            // Stop motion
            body.vx = 0;
            body.vy = 0;
            body.vRotation = 0;

            dragRef.current = {
                id,
                startX: e.clientX,
                startY: e.clientY,
                lastX: e.clientX,
                lastY: e.clientY
            };

            // Bring to front (move to end of array)
            bodiesRef.current = bodiesRef.current.filter(b => b.id !== id).concat(body);
        }
    };

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (!dragRef.current.id) return;

        const body = bodiesRef.current.find(b => b.id === dragRef.current.id);
        if (body) {
            const dx = e.clientX - dragRef.current.lastX;
            const dy = e.clientY - dragRef.current.lastY;

            body.x += dx;
            body.y += dy;

            // Store "throw" velocity
            body.vx = dx;
            body.vy = dy;

            // Add slight rotation based on movement
            body.rotation += dx * 0.1;

            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;
        }
    }, []);

    const onPointerUp = useCallback(() => {
        if (dragRef.current.id) {
            const body = bodiesRef.current.find(b => b.id === dragRef.current.id);
            if (body) {
                body.isDragging = false;
                // Inherit the velocity from the last drag frame (throw)
                // Maybe boost it slightly for feel
                body.vx *= 1.2;
                body.vy *= 1.2;
            }
            dragRef.current.id = null;
        }
    }, []);

    // Global listeners for move/up to catch outside the element
    useEffect(() => {
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [onPointerMove, onPointerUp]);

    return {
        bodies: bodiesState,
        onPointerDown
    };
};
