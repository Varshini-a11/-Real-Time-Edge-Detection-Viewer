cmake_minimum_required(VERSION 3.18.1)

project("edgedetection")

# Find OpenCV
find_package(OpenCV REQUIRED)

# Add native library
add_library(
        edgedetection
        SHARED
        native-lib.cpp
        edge_detector.cpp
)

# Include directories
include_directories(${OpenCV_INCLUDE_DIRS})

# Link libraries
target_link_libraries(
        edgedetection
        android
        log
        EGL
        GLESv2
        ${OpenCV_LIBS}
)

# C++ features
set_target_properties(edgedetection PROPERTIES
        CXX_STANDARD 17
        CXX_STANDARD_REQUIRED ON
)