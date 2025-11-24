export interface EdgeDetectionConfig {
    lowThreshold: number;
    highThreshold: number;
    blurAmount: number;
    showOriginal: boolean;
}

export interface ProcessedFrame {
    original: ImageData;
    edges: ImageData;
    timestamp: number;
}