#include <jni.h>
#include <opencv2/opencv.hpp>
#include "edge_detector.h"
#include <android/bitmap.h>
#include <android/log.h>

#define LOG_TAG "NativeLib"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

static EdgeDetector* gEdgeDetector = nullptr;

extern "C" {

JNIEXPORT void JNICALL
Java_com_example_edgedetection_MainActivity_nativeInit(JNIEnv *env, jobject thiz) {
if (gEdgeDetector == nullptr) {
gEdgeDetector = new EdgeDetector();
LOGI("Native edge detector initialized");
}
}

JNIEXPORT void JNICALL
Java_com_example_edgedetection_MainActivity_nativeRelease(JNIEnv *env, jobject thiz) {
if (gEdgeDetector != nullptr) {
delete gEdgeDetector;
gEdgeDetector = nullptr;
LOGI("Native edge detector released");
}
}

JNIEXPORT void JNICALL
Java_com_example_edgedetection_MainActivity_nativeProcessFrame(
        JNIEnv *env,
jobject thiz,
        jobject input_bitmap,
jobject output_bitmap) {

if (gEdgeDetector == nullptr) {
LOGI("Edge detector not initialized");
return;
}

try {
AndroidBitmapInfo inputInfo, outputInfo;
void* inputPixels;
void* outputPixels;

// Get input bitmap info
AndroidBitmap_getInfo(env, input_bitmap, &inputInfo);
AndroidBitmap_lockPixels(env, input_bitmap, &inputPixels);

// Get output bitmap info
AndroidBitmap_getInfo(env, output_bitmap, &outputInfo);
AndroidBitmap_lockPixels(env, output_bitmap, &outputPixels);

// Create OpenCV matrices from bitmaps
cv::Mat inputMat(inputInfo.height, inputInfo.width, CV_8UC4, inputPixels);
cv::Mat outputMat(outputInfo.height, outputInfo.width, CV_8UC4, outputPixels);
cv::Mat edges;

// Process frame for edge detection
gEdgeDetector->detectEdges(inputMat, edges);

// Convert single channel edges to RGBA for display
if (!edges.empty()) {
cv::cvtColor(edges, outputMat, cv::COLOR_GRAY2RGBA);
}

// Unlock bitmaps
AndroidBitmap_unlockPixels(env, input_bitmap);
AndroidBitmap_unlockPixels(env, output_bitmap);

} catch (const cv::Exception& e) {
LOGI("Processing error: %s", e.what());
AndroidBitmap_unlockPixels(env, input_bitmap);
AndroidBitmap_unlockPixels(env, output_bitmap);
}
}

JNIEXPORT void JNICALL
Java_com_example_edgedetection_MainActivity_nativeSetThreshold(
        JNIEnv *env,
jobject thiz,
        jint low,
jint high) {

if (gEdgeDetector != nullptr) {
gEdgeDetector->setThreshold(low, high);
LOGI("Threshold set to: %d, %d", low, high);
}
}

} // extern "C"