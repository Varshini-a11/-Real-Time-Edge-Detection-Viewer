#ifndef EDGE_DETECTOR_H
#define EDGE_DETECTOR_H

#include <opencv2/opencv.hpp>
#include <jni.h>

class EdgeDetector {
public:
    EdgeDetector();
    ~EdgeDetector();

    // Process frame for edge detection
    void detectEdges(cv::Mat& input, cv::Mat& output);

    // Set edge detection threshold
    void setThreshold(int low, int high);

private:
    int lowThreshold = 50;
    int highThreshold = 150;

    void convertToGrayscale(cv::Mat& input, cv::Mat& output);
    void applyGaussianBlur(cv::Mat& input, cv::Mat& output);
    void applyCanny(cv::Mat& input, cv::Mat& output);
};

#endif // EDGE_DETECTOR_H