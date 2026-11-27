package com.saranam.ayyappa

import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

  companion object {
    private const val TAG = "AyyappaAudio"
    private const val LOW_VOLUME = 0.22f // Low ambient devotional volume
  }

  private var mediaPlayer: MediaPlayer? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme)
    super.onCreate(null)
    initAndStartBackgroundAudio()
  }

  private fun initAndStartBackgroundAudio() {
    try {
      if (mediaPlayer == null) {
        mediaPlayer = MediaPlayer.create(applicationContext, R.raw.background_chant)?.apply {
          isLooping = true
          setVolume(LOW_VOLUME, LOW_VOLUME)
          start()
        }
        Log.i(TAG, "Devotional background audio started at low volume ($LOW_VOLUME)")
      } else if (!mediaPlayer!!.isPlaying) {
        mediaPlayer?.start()
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error initializing background audio", e)
    }
  }

  override fun onResume() {
    super.onResume()
    try {
      if (mediaPlayer != null && !mediaPlayer!!.isPlaying) {
        mediaPlayer?.start()
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error resuming background audio", e)
    }
  }

  override fun onPause() {
    super.onPause()
    try {
      if (mediaPlayer != null && mediaPlayer!!.isPlaying) {
        mediaPlayer?.pause()
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error pausing background audio", e)
    }
  }

  override fun onDestroy() {
    super.onDestroy()
    try {
      mediaPlayer?.stop()
      mediaPlayer?.release()
      mediaPlayer = null
      Log.i(TAG, "Background audio released upon app close")
    } catch (e: Exception) {
      Log.e(TAG, "Error releasing background audio", e)
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
