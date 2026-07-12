declare module "ogl" {
  export class Renderer {
    constructor(options?: {
      dpr?: number;
      alpha?: boolean;
      antialias?: boolean;
      depth?: boolean;
      preserveDrawingBuffer?: boolean;
      canvas?: HTMLCanvasElement;
      webgl?: 1 | 2;
      width?: number;
      height?: number;
    });
    gl: WebGLRenderingContext & { canvas: HTMLCanvasElement };
    dpr: number;
    isWebgl2: boolean;
    setSize(width: number, height: number): void;
    render(options: {
      scene: Mesh;
      frustumCull?: boolean;
      camera?: unknown;
      clear?: boolean;
    }): void;
  }

  export class Program {
    constructor(
      gl: WebGLRenderingContext,
      options: {
        vertex: string;
        fragment: string;
        uniforms: Record<string, { value: unknown }>;
        transparent?: boolean;
        depthTest?: boolean;
        depthWrite?: boolean;
        cullFace?: number | false;
      }
    );
    program: WebGLProgram;
    remove?(): void;
  }

  export class Mesh {
    constructor(
      gl: WebGLRenderingContext,
      options: { geometry: Triangle; program: Program }
    );
    frustumCulled: boolean;
    visible: boolean;
    remove?(): void;
  }

  export class Triangle {
    constructor(gl: WebGLRenderingContext);
    remove?(): void;
  }
}
