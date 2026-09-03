export interface BubbleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isHovered: boolean;
  lastMouseDistance: number;
}

export interface MouseState {
  x: number;
  y: number;
  isActive: boolean;
}

export class BubblePhysics {
  private static readonly ATTRACTION_STRENGTH = 0.8;
  private static readonly DAMPING = 0.92;
  private static readonly LOG_DAMPING = Math.log(0.92);
  private static readonly MAX_SPEED = 3;
  private static readonly MOUSE_INFLUENCE_RADIUS = 200;
  private static readonly COLLISION_DAMPING = 0.7;
  private static readonly BOUNDARY_MARGIN = 20;

  static updateBubble(
    bubble: BubbleState,
    mouse: MouseState,
    containerBounds: { width: number; height: number },
    otherBubbles: BubbleState[],
    deltaTime: number
  ): BubbleState {
    const dt = Math.min(deltaTime / 16, 2); // Normalize to 60fps, cap at 2x

    // ⚡ Bolt: Eliminate Math.sqrt where possible by comparing squared distances
    // Mouse attraction
    if (mouse.isActive) {
      const dx = mouse.x - bubble.x;
      const dy = mouse.y - bubble.y;
      const distSq = dx * dx + dy * dy;

      const hoverRadius = bubble.radius + 50;
      bubble.isHovered = distSq < hoverRadius * hoverRadius; // Larger hover zone for easier touch

      if (distSq > 0) {
        const distance = Math.sqrt(distSq);
        bubble.lastMouseDistance = distance;

        if (distance < this.MOUSE_INFLUENCE_RADIUS && distance > 1) {
          const force = this.ATTRACTION_STRENGTH / Math.max(distance * 0.01, 1);
          bubble.vx += (dx / distance) * force * dt;
          bubble.vy += (dy / distance) * force * dt;
        }
      }
    } else {
      bubble.isHovered = false;
    }

    // Collision avoidance
    // ⚡ Bolt Performance Optimization: Replace .forEach() with a standard for-loop
    // Eliminates thousands of callback allocations per second in this O(N²) collision check during the 60fps animation loop.
    for (let i = 0; i < otherBubbles.length; i++) {
      const other = otherBubbles[i];
      if (other === bubble) {
        continue;
      }

      const dx = other.x - bubble.x;
      const dy = other.y - bubble.y;

      // ⚡ Bolt: Avoid expensive Math.sqrt by checking squared distance first
      const distSq = dx * dx + dy * dy;
      const minDistance = bubble.radius + other.radius + 10;
      const minDistSq = minDistance * minDistance;

      if (distSq < minDistSq && distSq > 0) {
        const distance = Math.sqrt(distSq);
        const pushForce = (minDistance - distance) * 0.1;
        const normalX = dx / distance;
        const normalY = dy / distance;

        bubble.vx -= normalX * pushForce * dt;
        bubble.vy -= normalY * pushForce * dt;
      }
    }

    // Apply damping (exp is faster than pow with fractional exponents)
    const dampingFactor = Math.exp(dt * this.LOG_DAMPING);
    bubble.vx *= dampingFactor;
    bubble.vy *= dampingFactor;

    // Limit speed
    // ⚡ Bolt: Avoid Math.sqrt for speed limit check
    const speedSq = bubble.vx * bubble.vx + bubble.vy * bubble.vy;
    if (speedSq > this.MAX_SPEED * this.MAX_SPEED) {
      const speed = Math.sqrt(speedSq);
      const scale = this.MAX_SPEED / speed;
      bubble.vx *= scale;
      bubble.vy *= scale;
    }

    // Update position
    bubble.x += bubble.vx * dt;
    bubble.y += bubble.vy * dt;

    // Boundary collision
    const margin = this.BOUNDARY_MARGIN;
    if (bubble.x - bubble.radius < margin) {
      bubble.x = margin + bubble.radius;
      bubble.vx = Math.abs(bubble.vx) * this.COLLISION_DAMPING;
    }
    if (bubble.x + bubble.radius > containerBounds.width - margin) {
      bubble.x = containerBounds.width - margin - bubble.radius;
      bubble.vx = -Math.abs(bubble.vx) * this.COLLISION_DAMPING;
    }
    if (bubble.y - bubble.radius < margin) {
      bubble.y = margin + bubble.radius;
      bubble.vy = Math.abs(bubble.vy) * this.COLLISION_DAMPING;
    }
    if (bubble.y + bubble.radius > containerBounds.height - margin) {
      bubble.y = containerBounds.height - margin - bubble.radius;
      bubble.vy = -Math.abs(bubble.vy) * this.COLLISION_DAMPING;
    }

    // ⚡ Bolt: Mutate bubble in-place instead of creating a new object on every frame
    return bubble;
  }
}
