package com.example.edgedetection

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.opengl.GLSurfaceView
import android.os.Bundle
import android.widget.SeekBar
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.edgedetection.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var cameraRenderer: CameraRenderer
    private var lowThreshold = 50
    private var highThreshold = 150

    companion object {
        private const val CAMERA_PERMISSION_REQUEST_CODE = 100
        private const val TAG = "MainActivity"

        init {
            System.loadLibrary("edgedetection")
        }
    }

    // JNI Native methods
    external fun nativeInit()
    external fun nativeRelease()
    external fun nativeProcessFrame(inputBitmap: Bitmap, outputBitmap: Bitmap)
    external fun nativeSetThreshold(low: Int, high: Int)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        checkCameraPermission()
    }

    private fun setupUI() {
        // Setup threshold seek bars
        binding.lowThresholdSeekBar.progress = lowThreshold
        binding.highThresholdSeekBar.progress = highThreshold

        binding.lowThresholdSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                lowThreshold = progress
                binding.lowThresholdText.text = "Low: $progress"
                updateThreshold()
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        binding.highThresholdSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                highThreshold = progress
                binding.highThresholdText.text = "High: $progress"
                updateThreshold()
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    private fun updateThreshold() {
        nativeSetThreshold(lowThreshold, highThreshold)
    }

    private fun checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                CAMERA_PERMISSION_REQUEST_CODE
            )
        } else {
            initializeCamera()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            initializeCamera()
        }
    }

    private fun initializeCamera() {
        nativeInit()

        // Setup GLSurfaceView
        binding.glSurfaceView.setEGLContextClientVersion(2)
        cameraRenderer = CameraRenderer(this)
        binding.glSurfaceView.setRenderer(cameraRenderer)
        binding.glSurfaceView.renderMode = GLSurfaceView.RENDERMODE_WHEN_DIRTY
    }

    fun processFrame(inputBitmap: Bitmap, outputBitmap: Bitmap) {
        nativeProcessFrame(inputBitmap, outputBitmap)
    }

    override fun onDestroy() {
        super.onDestroy()
        nativeRelease()
    }
}