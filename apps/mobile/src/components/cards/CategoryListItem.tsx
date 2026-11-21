import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';
import { AyyappaMedallion } from '../common/AyyappaMedallion';
import { devotionalAudio } from '../../services/audioService';
import { StorageService } from '../../services/storageService';

interface Props {
  id: string;
  title: string;
  isAudio?: boolean;
  audioDurationSec?: number;
  totalTime?: string;
  chantLyric?: string;
  onPress?: () => void;
}

export const CategoryListItem: React.FC<Props> = ({
  id,
  title,
  isAudio = false,
  audioDurationSec = 40,
  totalTime = '00:40',
  chantLyric,
  onPress,
}) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [progressRatio, setProgressRatio] = useState<number>(0);

  const trackWidthRef = useRef<number>(200);

  // Restore download status and last paused position from persistent storage
  useEffect(() => {
    if (!isAudio) return;
    let isMounted = true;

    async function restoreAudioState() {
      const isDl = await StorageService.isAudioDownloaded(id);
      if (isMounted) {
        setDownloaded(isDl);
      }
      if (isDl) {
        const savedProgress = await StorageService.getAudioProgress(id);
        if (isMounted && savedProgress) {
          setCurrentSec(savedProgress.elapsed);
          setProgressRatio(savedProgress.ratio);
        }
      }
    }

    restoreAudioState();
    return () => {
      isMounted = false;
    };
  }, [id, isAudio]);

  // Subscribe to the global single-audio manager
  useEffect(() => {
    if (!isAudio) return;

    const unsubscribe = devotionalAudio.subscribe((activeId, elapsed, ratio) => {
      if (activeId === id) {
        setIsPlaying(true);
        setCurrentSec(elapsed);
        setProgressRatio(ratio);
        // Persist the current progress so refresh remembers exact location
        StorageService.saveAudioProgress(id, elapsed, ratio);
      } else {
        // If another track started playing (or audio stopped), automatically pause this one!
        setIsPlaying(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, isAudio]);

  const handleDownload = async () => {
    setDownloading(true);
    setTimeout(async () => {
      await StorageService.markAudioDownloaded(id);
      setDownloading(false);
      setDownloaded(true);
    }, 1200);
  };

  const togglePlay = () => {
    if (!downloaded) {
      handleDownload();
      return;
    }

    if (isPlaying) {
      // Pause track and save paused position
      StorageService.saveAudioProgress(id, currentSec, progressRatio);
      devotionalAudio.stopTrack();
    } else {
      // Resume track from exactly where it was stopped/paused!
      const resumeFrom = currentSec >= audioDurationSec ? 0 : currentSec;
      devotionalAudio.playTrack(id, audioDurationSec, resumeFrom);
    }
  };

  // Interactive Seeking along the audio track
  const handleSeek = (e: GestureResponderEvent) => {
    if (!downloaded) return;
    const locationX = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(locationX / trackWidthRef.current, 1));
    const sec = Math.floor(ratio * audioDurationSec);
    setProgressRatio(ratio);
    setCurrentSec(sec);
    StorageService.saveAudioProgress(id, sec, ratio);
    devotionalAudio.seekToRatio(ratio);
  };

  const formattedTime = `00:${String(currentSec).padStart(2, '0')}`;
  const displayTotalTime = totalTime || `00:${String(audioDurationSec).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.medallionWrapper}>
        <AyyappaMedallion size={38} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>

        {isAudio && (
          <View style={styles.audioRow}>
            {/* Play/Pause / Download Button */}
            {!downloaded ? (
              <TouchableOpacity
                onPress={handleDownload}
                style={styles.actionBtn}
                activeOpacity={0.7}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#E65100" />
                ) : (
                  <View style={styles.downloadCircle}>
                    <Text style={styles.downloadArrow}>↓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={togglePlay}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
            )}

            {/* Dynamic Audio Progress Slider Track */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSeek}
              onLayout={(e) => {
                trackWidthRef.current = e.nativeEvent.layout.width;
              }}
              style={styles.sliderTrackTouchable}
            >
              <View style={styles.sliderTrackBackground}>
                {/* Dynamically moving progress bar */}
                <View
                  style={[
                    styles.sliderFilled,
                    { width: `${progressRatio * 100}%` },
                  ]}
                />
                {/* Dynamically positioned audio thumb */}
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${progressRatio * 100}%` },
                  ]}
                />
              </View>
            </TouchableOpacity>

            {/* Dynamic Timers showing duration before and after download */}
            <View style={styles.timerRow}>
              <Text style={styles.timeText}>
                {formattedTime}
              </Text>
              <Text style={styles.timeText}>
                {displayTotalTime}
              </Text>
            </View>

            {/* Sacred Chant Lyric while playing */}
            {isPlaying && chantLyric && (
              <View style={styles.lyricBox}>
                <Text style={styles.lyricText}>♫ {chantLyric}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 30, 0, 0.4)',
    backgroundColor: 'transparent',
  },
  medallionWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16.5,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  audioRow: {
    marginTop: 6,
    width: '100%',
  },
  actionBtn: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  downloadCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadArrow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: -2,
  },
  playIcon: {
    fontSize: 18,
    color: '#1A1A1A',
    marginLeft: 2,
  },
  sliderTrackTouchable: {
    height: 18,
    justifyContent: 'center',
    width: '98%',
    marginVertical: 2,
  },
  sliderTrackBackground: {
    height: 3.5,
    backgroundColor: '#345147',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  sliderFilled: {
    height: 3.5,
    backgroundColor: '#000000',
  },
  sliderThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FFE082',
    marginLeft: -6,
    top: -4.2,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '98%',
    marginTop: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  lyricBox: {
    marginTop: 4,
    backgroundColor: 'rgba(230, 81, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  lyricText: {
    fontSize: 12,
    color: '#B71C1C',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});
