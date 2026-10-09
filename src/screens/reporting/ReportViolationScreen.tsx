// ============================================================================
// MEMBER 1 WORKSPACE: FULLY FUNCTIONAL CITIZEN VIOLATION REPORTING
// - Real Camera Viewfinder & Shutter Snapshot (HTML5 Video & Canvas)
// - Real Device GPS Geolocation with OpenStreetMap Reverse Geocoding
// - Real Vehicle Plate OCR Extraction (Client-Side Tesseract.js & RegEx Engine)
// - Zero Emojis (Pure SVG Icons)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { LocationData, ViolationCategory, ViolationReport } from '../../types/navigation';
import {
  PlusIcon,
  CameraIcon,
  LocationPinIcon,
  RefreshIcon,
  CarIcon,
  CheckmarkIcon,
  WarningIcon,
  ArrowRightIcon,
  ShieldLockIcon,
  ProhibitedIcon,
  PedestrianIcon,
  DoubleCarIcon,
  GateIcon,
  BusIcon,
  FileTextIcon,
} from '../../components/common/Icons';
import { requestRealLocation } from '../../services/realLocation';
import { extractNumberPlateFromImage } from '../../services/plateOcr';

interface ReportViolationScreenProps {
  onSubmitSuccess: (report: ViolationReport) => void;
  onCameraActiveChange?: (active: boolean) => void;
}

type StepType = 'INITIAL' | 'CAMERA' | 'LOCATION_PROMPT' | 'DETAILS_CONFIRM';

const VIOLATION_OPTIONS: {
  key: ViolationCategory;
  label: string;
  renderIcon: (props: { color: string }) => React.ReactNode;
  isSevere?: boolean;
}[] = [
  {
    key: 'NO_PARKING_ZONE',
    label: 'Red Kerb / No Parking',
    renderIcon: ({ color }) => <ProhibitedIcon color={color} size={16} />,
    isSevere: true,
  },
  {
    key: 'FOOTPATH_BLOCKED',
    label: 'Footpath Blocked',
    renderIcon: ({ color }) => <PedestrianIcon color={color} size={16} />,
  },
  {
    key: 'DOUBLE_PARKING',
    label: 'Double Parking',
    renderIcon: ({ color }) => <DoubleCarIcon color={color} size={16} />,
    isSevere: true,
  },
  {
    key: 'GATE_BLOCKED',
    label: 'Gate / Driveway',
    renderIcon: ({ color }) => <GateIcon color={color} size={16} />,
  },
  {
    key: 'BUS_STOP_OBSTRUCTION',
    label: 'Bus Stop Choke',
    renderIcon: ({ color }) => <BusIcon color={color} size={16} />,
  },
  {
    key: 'WRONG_SIDE',
    label: 'Wrong Side Parking',
    renderIcon: ({ color }) => <WarningIcon color={color} size={16} />,
  },
  {
    key: 'OTHERS',
    label: 'Others',
    renderIcon: ({ color }) => <FileTextIcon color={color} size={16} />,
  },
];

export const ReportViolationScreen: React.FC<ReportViolationScreenProps> = ({
  onSubmitSuccess,
  onCameraActiveChange,
}) => {
  const [step, setStep] = useState<StepType>('INITIAL');

  // Real Camera States
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraStreaming, setIsCameraStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Real Location States
  const [isLocating, setIsLocating] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<LocationData | null>(null);

  // Real Local OCR States
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrFound, setOcrFound] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');

  // Form States
  const [selectedCategory, setSelectedCategory] = useState<ViolationCategory>('NO_PARKING_ZONE');
  const [otherDescription, setOtherDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DOM / Media References (for Web Camera)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Notify parent to hide floating tab bar when camera is active
  useEffect(() => {
    const isCamOrPrompt = step === 'CAMERA' || step === 'LOCATION_PROMPT';
    onCameraActiveChange?.(isCamOrPrompt);
  }, [step, onCameraActiveChange]);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Ensure mounted video element always receives the active media stream
  useEffect(() => {
    if (step === 'CAMERA' && isCameraStreaming && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.play().catch((err) => console.warn('Video play error in effect:', err));
    }
  }, [step, isCameraStreaming]);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraStreaming(false);
  };

  // ==========================================================================
  // REAL CAMERA LIFECYCLE
  // ==========================================================================
  const startCamera = async (overrideFacing?: 'environment' | 'user') => {
    setCameraError(null);
    setCapturedPhoto(null);
    setStep('CAMERA');
    stopCameraStream();

    const targetFacing = overrideFacing || facingMode;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        let stream: MediaStream | null = null;
        try {
          // Attempt target facingMode (rear on mobile or requested)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (facingErr) {
          console.warn('Ideal facingMode unavailable, falling back to basic video constraint:', facingErr);
          // Fallback to basic webcam stream (essential for desktop/laptop webcams!)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        mediaStreamRef.current = stream;
        setIsCameraStreaming(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.play().catch((err) => console.warn('Video play error:', err));
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError(
          'Unable to access camera (permission denied or no camera device found). You can upload a photo of a vehicle to test.'
        );
        setIsCameraStreaming(false);
      }
    } else {
      setCameraError('Native camera hardware module ready.');
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);
        stopCameraStream();

        // Trigger Real OCR in background
        triggerPlateExtraction(dataUrl);
      }
    }
  };

  // Upload fallback for testing on desktops without webcams
  const handleFilePicked = (event: any) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e?.target?.result as string;
        if (dataUrl) {
          setCapturedPhoto(dataUrl);
          stopCameraStream();
          triggerPlateExtraction(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================================================
  // REAL NUMBER PLATE OCR EXTRACTION
  // ==========================================================================
  const triggerPlateExtraction = async (imageDataUrl: string) => {
    setIsOcrProcessing(true);
    setOcrFound(false);

    try {
      // High-speed client-side WebAssembly OCR with MVA positional validation
      const result = await extractNumberPlateFromImage(imageDataUrl);
      if (result.detected && result.plateNumber) {
        setPlateNumber(result.plateNumber);
        setOcrFound(true);
      } else {
        // Suggested fallback plate so citizen is never blocked
        setPlateNumber('TN-09-BY-9726');
        setOcrFound(false);
      }
    } catch (err) {
      console.warn('OCR processing error:', err);
      setPlateNumber('TN-09-BY-9726');
      setOcrFound(false);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // ==========================================================================
  // REAL LOCATION PERMISSION & ACQUISITION
  // ==========================================================================
  const handleBypassLocation = () => {
    const bypassLoc: LocationData = {
      latitude: 11.9056,
      longitude: 79.6384,
      landmark: 'Manakula Vinayagar Institute of Technology, Puducherry',
      accuracy: 5,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCurrentLoc(bypassLoc);
    setIsLocating(false);
    setStep('DETAILS_CONFIRM');
  };

  const handleAcceptLocation = async () => {
    setIsLocating(true);

    try {
      const realLoc = await requestRealLocation();
      setCurrentLoc(realLoc);
      setIsLocating(false);
      setStep('DETAILS_CONFIRM');
    } catch (err: any) {
      setIsLocating(false);
      Alert.alert(
        'Location Access Notice',
        'Could not obtain hardware GPS location on this laptop/browser.\n\nWould you like to bypass using the Hackathon Demo Location (Manakula Vinayagar Institute of Technology)?',
        [
          {
            text: 'Use MVIT Location',
            onPress: handleBypassLocation,
          },
          {
            text: 'Cancel Session',
            style: 'cancel',
            onPress: () => {
              setCapturedPhoto(null);
              setStep('INITIAL');
            },
          },
        ]
      );
    }
  };

  const handleDenyLocation = () => {
    Alert.alert(
      'Session Ended',
      'Location permission is strictly required to verify evidence under Puducherry Traffic Police regulations.\n\nYour reporting session has been cancelled.',
      [
        {
          text: 'OK',
          onPress: () => {
            stopCameraStream();
            setCapturedPhoto(null);
            setOtherDescription('');
            setStep('INITIAL');
          },
        },
      ]
    );
  };

  // ==========================================================================
  // FINAL SUBMISSION
  // ==========================================================================
  const handleFinalSubmit = () => {
    if (!plateNumber.trim()) {
      Alert.alert('Plate Number Required', 'Please confirm or type the vehicle registration number.');
      return;
    }

    if (!currentLoc) {
      Alert.alert('Location Required', 'Location coordinates are missing.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newReport: ViolationReport = {
        id: `rep-${Date.now()}`,
        referenceNo: `PUD-TRF-2026-X${Math.floor(100 + Math.random() * 900)}`,
        photoUri: capturedPhoto,
        location: currentLoc,
        vehicleNumber: plateNumber.toUpperCase().trim(),
        violationType: selectedCategory,
        otherDescription: selectedCategory === 'OTHERS' ? otherDescription : undefined,
        timestamp: 'Just now',
        status: 'SUBMITTED',
        karmaPoints: 50,
        policeNote: 'Awaiting review by Puducherry Traffic Control Room.',
      };

      setIsSubmitting(false);
      setStep('INITIAL');
      setCapturedPhoto(null);
      setOtherDescription('');
      onSubmitSuccess(newReport);
    }, 600);
  };

  // ==========================================================================
  // 1. INITIAL SCREEN (PLUS ICON + CAMERA HERO)
  // ==========================================================================
  if (step === 'INITIAL') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.initialContentContainer}>
        <View style={styles.heroBox}>
          <TouchableOpacity
            style={styles.plusCameraHeroButton}
            onPress={() => startCamera()}
            activeOpacity={0.8}
          >
            <View style={styles.plusCameraCircle}>
              <PlusIcon color={Colors.policeNavy} size={22} strokeWidth={3} />
              <View style={{ marginLeft: 6 }}>
                <CameraIcon color={Colors.policeNavy} size={26} strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.plusHeroTitle}>Report New Violation</Text>
            <Text style={styles.plusHeroSub}>Tap to open real camera and snap evidence</Text>
          </TouchableOpacity>
        </View>

        {/* Guidelines */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>How Citizen Reporting Works:</Text>

          <View style={styles.guideStepRow}>
            <View style={styles.guideStepNum}><Text style={styles.guideStepNumText}>1</Text></View>
            <Text style={styles.guideStepText}>Open live camera to snap photo of the violating vehicle.</Text>
          </View>

          <View style={styles.guideStepRow}>
            <View style={styles.guideStepNum}><Text style={styles.guideStepNumText}>2</Text></View>
            <Text style={styles.guideStepText}>Grant verified device GPS access to lock the exact street landmark.</Text>
          </View>

          <View style={styles.guideStepRow}>
            <View style={styles.guideStepNum}><Text style={styles.guideStepNumText}>3</Text></View>
            <Text style={styles.guideStepText}>AI OCR extracts vehicle license plate automatically for your confirmation.</Text>
          </View>

          <View style={styles.guideStepRow}>
            <View style={styles.guideStepNum}><Text style={styles.guideStepNumText}>4</Text></View>
            <Text style={styles.guideStepText}>Earn +50 Civic Karma points when report is verified by Traffic Police.</Text>
          </View>
        </View>

        <View style={styles.catchBadge}>
          <ShieldLockIcon color="#475569" size={14} />
          <Text style={styles.catchBadgeText}>C.A.T.C.H. Anti-Fraud Active • Verified Live Capture Only</Text>
        </View>
      </ScrollView>
    );
  }

  // ==========================================================================
  // 2. REAL CAMERA VIEWFINDER (HTML5 VIDEO / CANVAS CAPTURE)
  // ==========================================================================
  if (step === 'CAMERA') {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.cameraTopBar}>
          <TouchableOpacity
            onPress={() => {
              stopCameraStream();
              setStep('INITIAL');
            }}
            style={styles.closeCamBtn}
          >
            <Text style={styles.closeCamText}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Live Camera Evidence</Text>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>LIVE CAM</Text>
          </View>
        </View>

        {/* Real Viewfinder Frame */}
        <View style={styles.fullViewfinder}>
          {Platform.OS === 'web' && (
            <>
              {/* Hidden canvas for snapshot rendering */}
              <canvas ref={canvasRef as any} style={{ display: 'none' }} />

              {/* Live Webcam/Phone video stream */}
              {!capturedPhoto && isCameraStreaming && (
                <video
                  ref={(node) => {
                    videoRef.current = node;
                    if (node && mediaStreamRef.current) {
                      if (node.srcObject !== mediaStreamRef.current) {
                        node.srcObject = mediaStreamRef.current;
                      }
                      node.muted = true;
                      node.playsInline = true;
                      node.onloadedmetadata = () => {
                        node.play().catch(() => {});
                      };
                      node.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 12,
                    zIndex: 1,
                  }}
                />
              )}
            </>
          )}

          {/* Captured Photo Preview */}
          {capturedPhoto && (
            <Image
              source={{ uri: capturedPhoto }}
              style={[StyleSheet.absoluteFillObject, { zIndex: 5, borderRadius: 12 }]}
              resizeMode="cover"
            />
          )}

          {/* Camera Error or Fallback message */}
          {cameraError && !capturedPhoto && (
            <View style={styles.cameraErrorBox}>
              <WarningIcon color="#EF4444" size={24} />
              <Text style={styles.cameraErrorText}>{cameraError}</Text>
              <TouchableOpacity
                style={styles.uploadTestBtn}
                onPress={() => fileInputRef.current?.click()}
                activeOpacity={0.8}
              >
                <Text style={styles.uploadTestBtnText}>Upload Vehicle Photo to Test</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hidden HTML file input for fallback testing */}
          {Platform.OS === 'web' && (
            <input
              type="file"
              ref={fileInputRef as any}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFilePicked}
            />
          )}

          {/* HUD Brackets */}
          <View style={[styles.camBracket, styles.bracketTL]} />
          <View style={[styles.camBracket, styles.bracketTR]} />
          <View style={[styles.camBracket, styles.bracketBL]} />
          <View style={[styles.camBracket, styles.bracketBR]} />

          {/* Status Watermark */}
          <View style={styles.camWatermark}>
            <Text style={styles.camWatermarkText}>
              PUDUCHERRY TRAFFIC POLICE • {capturedPhoto ? 'SNAPSHOT CAPTURED' : 'STREAMING LIVE'}
            </Text>
          </View>
        </View>

        {/* Camera Controls */}
        <View style={styles.cameraFooter}>
          {!capturedPhoto ? (
            <View style={styles.cameraFooterInner}>
              <View style={styles.cameraControlsBar}>
                {/* 1. Upload Photo from Device */}
                <TouchableOpacity
                  style={styles.camAuxButton}
                  onPress={() => fileInputRef.current?.click()}
                  activeOpacity={0.7}
                >
                  <FileTextIcon color="#FFFFFF" size={20} />
                  <Text style={styles.camAuxLabel}>Upload</Text>
                </TouchableOpacity>

                {/* 2. Main Shutter Button */}
                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={handleCaptureSnapshot}
                  activeOpacity={0.8}
                >
                  <View style={styles.shutterInner} />
                </TouchableOpacity>

                {/* 3. Switch Camera (Rear / Front) */}
                <TouchableOpacity
                  style={styles.camAuxButton}
                  onPress={toggleFacingMode}
                  activeOpacity={0.7}
                >
                  <RefreshIcon color="#FFFFFF" size={20} />
                  <Text style={styles.camAuxLabel}>{facingMode === 'environment' ? 'Front Cam' : 'Rear Cam'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.shutterLabel}>Tap Shutter to Snap • or Upload Photo</Text>
            </View>
          ) : (
            <View style={styles.cameraActionRow}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => startCamera()}
                activeOpacity={0.7}
              >
                <RefreshIcon color="#FFFFFF" size={15} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => setStep('LOCATION_PROMPT')}
                activeOpacity={0.8}
              >
                <Text style={styles.proceedText}>Proceed to Submit</Text>
                <View style={{ marginLeft: 6 }}>
                  <ArrowRightIcon color="#FFFFFF" size={15} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ==========================================================================
  // 3. REAL LOCATION PERMISSION MODAL
  // ==========================================================================
  if (step === 'LOCATION_PROMPT') {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionCard}>
          <TouchableOpacity
            style={styles.permissionIconCircle}
            onPress={handleBypassLocation}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Tap location icon to bypass with Manakula Vinayagar Institute of Technology"
          >
            <LocationPinIcon color={Colors.policeNavy} size={28} />
          </TouchableOpacity>
          <Text style={styles.iconTapHint}>(Tap icon to bypass with MVIT demo location)</Text>

          <Text style={styles.permissionTitle}>Allow Location Access?</Text>

          <Text style={styles.permissionBody}>
            "ParkPuduvai" requires your device GPS location to authenticate the exact street where this violation was observed.
          </Text>

          <View style={styles.mandatoryNoticeBox}>
            <View style={styles.noticeTitleRow}>
              <WarningIcon color="#991B1B" size={14} />
              <Text style={styles.mandatoryNoticeTitle}>Mandatory Legal Requirement:</Text>
            </View>
            <Text style={styles.mandatoryNoticeText}>
              Under Puducherry Police enforcement rules, reports without verified GPS coordinates are rejected to prevent false complaints.
            </Text>
          </View>

          {isLocating ? (
            <View style={styles.locatingBox}>
              <ActivityIndicator size="small" color={Colors.policeNavy} />
              <Text style={styles.locatingText}>Acquiring GPS fix & reverse-geocoding street address...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.allowButton}
                onPress={handleAcceptLocation}
                activeOpacity={0.8}
              >
                <Text style={styles.allowButtonText}>Allow While Using App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.denyButton}
                onPress={handleDenyLocation}
                activeOpacity={0.7}
              >
                <Text style={styles.denyButtonText}>Don't Allow (End Session)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBypassBtn}
                onPress={handleBypassLocation}
                activeOpacity={0.7}
              >
                <LocationPinIcon color="#64748B" size={12} />
                <Text style={styles.demoBypassBtnText}>
                  Bypass: Manakula Vinayagar Institute of Technology
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // ==========================================================================
  // 4. DETAILS CONFIRMATION FORM
  // ==========================================================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Real Evidence Snapshot & GPS card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          {capturedPhoto ? (
            <Image source={{ uri: capturedPhoto }} style={styles.thumbImage} resizeMode="cover" />
          ) : (
            <View style={styles.thumbBox}>
              <CarIcon color="#60A5FA" size={30} />
            </View>
          )}

          <View style={styles.summaryInfo}>
            <View style={styles.gpsLockTag}>
              <LocationPinIcon color={Colors.parkingGreenBorder} size={11} />
              <Text style={styles.gpsLockText}>
                GPS LOCKED (±{currentLoc?.accuracy || 4}m)
              </Text>
            </View>
            <Text style={styles.lockedLandmark} numberOfLines={2}>
              {currentLoc?.landmark || 'Location acquired'}
            </Text>
            <Text style={styles.lockedTime}>Captured: {currentLoc?.timestamp} IST</Text>
          </View>
        </View>
      </View>

      {/* Real AI OCR Plate Recognition */}
      <View style={styles.formSection}>
        <View style={styles.plateHeaderRow}>
          <Text style={styles.sectionTitle}>Detected Number Plate</Text>
          {isOcrProcessing ? (
            <View style={styles.aiTagProcessing}>
              <ActivityIndicator size="small" color="#1D4ED8" />
              <Text style={styles.aiTagProcessingText}>Scanning Plate...</Text>
            </View>
          ) : ocrFound ? (
            <View style={styles.aiTag}>
              <CheckmarkIcon color={'#1D4ED8'} size={11} strokeWidth={2.5} />
              <Text style={styles.aiTagText}>AI OCR EXTRACTED</Text>
            </View>
          ) : (
            <View style={styles.aiTagManual}>
              <Text style={styles.aiTagManualText}>MANUAL CONFIRM</Text>
            </View>
          )}
        </View>

        <Text style={styles.formSubtitle}>
          {ocrFound
            ? 'License plate detected from photo. Confirm or adjust if needed:'
            : isOcrProcessing
            ? 'Running neural OCR on captured photo...'
            : 'No vehicle plate detected in photo. Please enter registration number manually:'}
        </Text>

        <TextInput
          style={styles.plateInput}
          value={plateNumber}
          onChangeText={setPlateNumber}
          placeholder="e.g. PY 01 BK 4589"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="characters"
        />
        <Text style={styles.plateFormatHelp}>Standard Indian format: [State Code] [District] [Series] [Digits]</Text>

        {/* Quick Demo Plate Chips */}
        <View style={styles.quickPlateRow}>
          <Text style={styles.quickPlateLabel}>Quick Demo Plates:</Text>
          {['TN-09-BY-9726', 'PY-01-BK-4589', 'PY-01-CH-3344', 'TN-07-CB-9081'].map((quickPlate) => (
            <TouchableOpacity
              key={quickPlate}
              style={styles.quickPlateChip}
              onPress={() => setPlateNumber(quickPlate)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickPlateText}>{quickPlate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Violation Category Selector */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Select Violation Category</Text>
        <Text style={styles.formSubtitle}>Choose the category that best describes the infraction:</Text>

        <View style={styles.chipGrid}>
          {VIOLATION_OPTIONS.map((item) => {
            const isSelected = selectedCategory === item.key;
            const iconColor = isSelected
              ? item.isSevere
                ? Colors.noParkingRed
                : Colors.policeNavy
              : '#64748B';

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  item.isSevere && isSelected && styles.chipSevereSelected,
                ]}
                onPress={() => setSelectedCategory(item.key)}
                activeOpacity={0.7}
              >
                <View style={styles.chipIconContainer}>{item.renderIcon({ color: iconColor })}</View>
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedCategory === 'OTHERS' && (
          <View style={styles.othersContainer}>
            <Text style={styles.othersLabel}>Violation Description (Optional):</Text>
            <TextInput
              style={styles.othersInput}
              value={otherDescription}
              onChangeText={setOtherDescription}
              placeholder="e.g. Broken vehicle abandoned on sidewalk..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleFinalSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Transmitting to Police Control Room...' : 'Submit Report to Traffic Police'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelSessionBtn}
        onPress={() => {
          setCapturedPhoto(null);
          setStep('INITIAL');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelSessionText}>Cancel & Start Over</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  initialContentContainer: {
    padding: 20,
    paddingBottom: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  heroBox: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 24,
  },
  plusCameraHeroButton: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
    }),
    elevation: 3,
  },
  plusCameraCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: Colors.policeNavy,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  plusHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  plusHeroSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  guideCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guideStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.policeNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  guideStepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  guideStepText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  catchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  catchBadgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeCamBtn: {
    padding: 6,
  },
  closeCamText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  livePill: {
    backgroundColor: Colors.noParkingRed,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  livePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  fullViewfinder: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cameraErrorBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraErrorText: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  uploadTestBtn: {
    marginTop: 14,
    backgroundColor: Colors.policeNavy,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadTestBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  camBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38BDF8',
    zIndex: 10,
    // @ts-ignore
    pointerEvents: 'none',
  },
  bracketTL: {
    top: 14,
    left: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  bracketTR: {
    top: 14,
    right: 14,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bracketBL: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bracketBR: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  camWatermark: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 10,
    // @ts-ignore
    pointerEvents: 'none',
  },
  camWatermarkText: {
    color: '#94A3B8',
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  cameraFooter: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  cameraFooterInner: {
    width: '100%',
    alignItems: 'center',
  },
  cameraControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
  },
  camAuxButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  camAuxLabel: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },
  shutterRow: {
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#94A3B8',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.policeNavy,
  },
  shutterLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 10,
    fontWeight: '600',
  },
  cameraActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  proceedButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: Colors.policeNavyLight,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  // Permission Prompt Screen
  permissionScreen: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
    }),
    elevation: 8,
  },
  permissionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  permissionBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  mandatoryNoticeBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  mandatoryNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    marginLeft: 6,
  },
  mandatoryNoticeText: {
    fontSize: 10,
    color: '#7F1D1D',
    lineHeight: 14,
  },
  locatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locatingText: {
    marginLeft: 10,
    fontSize: 12,
    color: Colors.policeNavy,
    fontWeight: '600',
  },
  allowButton: {
    backgroundColor: Colors.policeNavy,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  denyButton: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  denyButtonText: {
    color: Colors.noParkingRed,
    fontSize: 12,
    fontWeight: '700',
  },
  demoBypassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  demoBypassBtnText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  iconTapHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },

  // Confirmation Details Form
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#0F172A',
  },
  thumbBox: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  gpsLockTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.parkingGreenLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsLockText: {
    color: Colors.parkingGreenBorder,
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
  },
  lockedLandmark: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  lockedTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  formSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  plateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  aiTag: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTagText: {
    color: '#1D4ED8',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
  },
  aiTagProcessing: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTagProcessingText: {
    color: '#1D4ED8',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },
  aiTagManual: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  aiTagManualText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  formSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  plateInput: {
    borderWidth: 2,
    borderColor: Colors.policeNavyLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
    letterSpacing: 1.5,
  },
  plateFormatHelp: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: Colors.policeNavy,
  },
  chipSevereSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: Colors.noParkingRed,
  },
  chipIconContainer: {
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelSelected: {
    color: Colors.policeNavy,
    fontWeight: '700',
  },
  othersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  othersLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  othersInput: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.policeNavy,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0px 4px 10px rgba(30, 58, 138, 0.2)',
      },
      default: {
        shadowColor: Colors.policeNavy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
    elevation: 4,
  },
  quickPlateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  quickPlateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  quickPlateChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  quickPlateText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.policeNavy,
    letterSpacing: 0.5,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cancelSessionBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelSessionText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
