import { EdgeDetectionConfig } from './types';

export class WebEdgeDetector {
    private config: EdgeDetectionConfig;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.config = {
            lowThreshold: 50,
            highThreshold: 150,
            blurAmount: 1.5,
            showOriginal: false
        };
    }

    setConfig(config: Partial<EdgeDetectionConfig>): void {
        this.config = { ...this.config, ...config };
    }

    async processImage(imageData: ImageData): Promise<ImageData> {
        // Convert to grayscale and apply edge detection
        const grayscale = this.convertToGrayscale(imageData);
        const blurred = this.applyGaussianBlur(grayscale);
        const edges = this.applyCanny(blurred);

        return edges;
    }

    private convertToGrayscale(imageData: ImageData): ImageData {
        const { width, height, data } = imageData;
        const grayscale = new ImageData(width, height);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            grayscale.data[i] = gray;
            grayscale.data[i + 1] = gray;
            grayscale.data[i + 2] = gray;
            grayscale.data[i + 3] = 255;
        }

        return grayscale;
    }

    private applyGaussianBlur(imageData: ImageData): ImageData {
        // Simplified Gaussian blur implementation
        const { width, height, data } = imageData;
        const blurred = new ImageData(width, height);
        const kernel = this.createGaussianKernel(this.config.blurAmount);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let weightSum = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const px = x + kx;
                        const py = y + ky;

                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const weight = kernel[ky + 1][kx + 1];
                            const pixelIndex = (py * width + px) * 4;
                            sum += data[pixelIndex] * weight;
                            weightSum += weight;
                        }
                    }
                }

                const pixelIndex = (y * width + x) * 4;
                const value = sum / weightSum;

                blurred.data[pixelIndex] = value;
                blurred.data[pixelIndex + 1] = value;
                blurred.data[pixelIndex + 2] = value;
                blurred.data[pixelIndex + 3] = 255;
            }
        }

        return blurred;
    }

    private applyCanny(imageData: ImageData): ImageData {
        const { width, height, data } = imageData;
        const edges = new ImageData(width, height);

        // Simplified edge detection
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const center = this.getPixel(data, width, x, y);
                const neighbors = [
                    this.getPixel(data, width, x-1, y-1),
                    this.getPixel(data, width, x, y-1),
                    this.getPixel(data, width, x+1, y-1),
                    this.getPixel(data, width, x-1, y),
                    this.getPixel(data, width, x+1, y),
                    this.getPixel(data, width, x-1, y+1),
                    this.getPixel(data, width, x, y+1),
                    this.getPixel(data, width, x+1, y+1)
                ];

                const maxNeighbor = Math.max(...neighbors);
                const minNeighbor = Math.min(...neighbors);
                const gradient = maxNeighbor - minNeighbor;

                const pixelIndex = (y * width + x) * 4;
                const edgeValue = gradient > this.config.lowThreshold ? 255 : 0;

                edges.data[pixelIndex] = edgeValue;
                edges.data[pixelIndex + 1] = edgeValue;
                edges.data[pixelIndex + 2] = edgeValue;
                edges.data[pixelIndex + 3] = 255;
            }
        }

        return edges;
    }

    private getPixel(data: Uint8ClampedArray, width: number, x: number, y: number): number {
        const index = (y * width + x) * 4;
        return data[index];
    }

    private createGaussianKernel(sigma: number): number[][] {
        const kernel = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ];

        // Normalize kernel
        let sum = 0;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                sum += kernel[y][x];
            }
        }

        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                kernel[y][x] /= sum;
            }
        }

        return kernel;
    }

    drawResult(original: ImageData, edges: ImageData): void {
        this.ctx.putImageData(
            this.config.showOriginal ? original : edges,
            0, 0
        );
    }
}