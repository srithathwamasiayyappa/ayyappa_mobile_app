# ProGuard & R8 Optimization Rules for Saranam Ayyappa Release
-keepattributes *Annotation*,InnerClasses,EnclosingMethod,Signature,SourceFile,LineNumberTable

# React Native Core & Fabric / TurboModules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.jni.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Expo Modules Core & Plugins
-keep class expo.modules.** { *; }

# Firebase Core & Phone Authentication
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }

# Google Play Services & Google Sign-In
-keep class com.google.android.gms.** { *; }
-keep class co.apptailor.googlesignin.** { *; }

# Native App Application & Activity Classes
-keep class com.saranam.ayyappa.** { *; }
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.horcrux.svg.** { *; }
-keep class com.facebook.hermes.** { *; }

# Preserve line numbers for Google Play Console deobfuscation mapping
-renamesourcefileattribute SourceFile

# Suppress harmless build-time warnings for optional classes
-dontwarn com.facebook.react.**
-dontwarn io.invertase.firebase.**
-dontwarn com.google.android.gms.**
-dontwarn expo.modules.**

