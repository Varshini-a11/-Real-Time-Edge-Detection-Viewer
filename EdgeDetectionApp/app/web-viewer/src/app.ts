import { WebEdgeDetector } from './edge-detector';
import { EdgeDetectionConfig } from './types';

class EdgeDetectionViewer {
    private detector: WebEdgeDetector;
    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private isProcessing: boolean = false;

    constructor() {
        this.video = document.getElementById('video') as HTMLVideoElement;
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.detector = new WebEdgeDetector(this.canvas);

        this.setupEventListeners();
        this.setupCamera();
    }

    private setupEventListeners(): void {
        const lowThreshold = document.getElementById('lowThreshold') as HTMLInputElement;
        const highThreshold = document.getElementById('highThreshold') as HTMLInputElement;
        const blurAmount = document.getElementById('blurAmount') as HTMLInputElement;
        const showOriginal = document.getElementById('showOriginal') as HTMLInputElement;

        lowThreshold.addEventListener('input', () => this.updateConfig());
        highThreshold.addEventListener('input', () => this.updateConfig());
        blurAmount.addEventListener('input', () => this.updateConfig());
        showOriginal.addEventListener('change', () => this.updateConfig());
    }

    private updateConfig(): void {
        const config: Partial<EdgeDetectionConfig> = {
            lowThreshold: parseInt((document.getElementById('lowThreshold') as HTMLInputElement).value),
            highThreshold: parseInt((document.getElementById('highThreshold') as HTMLInputElement).value),
            blurAmount: parseFloat((document.getElementById('blurAmount') as HTMLInputElement).value),
            showOriginal: (document.getElementById('showOriginal') as HTMLInputElement).checked
        };

        this.detector.setConfig(config);
    }

    private async setupCamera(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            this.video.srcObject = stream;
            this.video.play();

            this.startProcessing();

        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }

    private startProcessing(): void {
        const processFrame = async () => {
            if (this.video.paused || this.video.ended) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;

            ctx.drawImage(this.video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const edges = await this.detector.processImage(imageData);
            this.detector.drawResult(imageData, edges);

            requestAnimationFrame(processFrame);
        };

        processFrame();
    }
}

// Initialize the application
new EdgeDetectionViewer();