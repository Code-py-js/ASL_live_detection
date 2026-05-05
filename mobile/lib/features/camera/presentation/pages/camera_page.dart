import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:video_player/video_player.dart';

class CameraPage extends StatefulWidget {
  static const routeName = '/camera';
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  // Camera
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  bool _hasPermission = false;
  bool _isCameraOn = false;

  // Avatar video
  late VideoPlayerController _videoController;
  bool _videoReady = false;

  // Mic
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    _initVideo();
    _checkPermission();
  }

  // ── Video ────────────────────────────────────────────────────────────────

  Future<void> _initVideo() async {
    _videoController = VideoPlayerController.asset('assets/videos/avatar_idle.mp4');
    await _videoController.initialize();
    _videoController.setLooping(true);
    _videoController.play();
    if (mounted) setState(() => _videoReady = true);
  }

  // ── Camera ───────────────────────────────────────────────────────────────

  Future<void> _checkPermission() async {
    final status = await Permission.camera.status;
    setState(() => _hasPermission = status.isGranted);
  }

  Future<void> _toggleCamera() async {
    if (_isCameraOn) {
      await _cameraController?.dispose();
      _cameraController = null;
      setState(() => _isCameraOn = false);
      return;
    }

    // Request permission if needed
    if (!_hasPermission) {
      final status = await Permission.camera.request();
      if (!status.isGranted) return;
      setState(() => _hasPermission = true);
    }

    _cameras = await availableCameras();
    if (_cameras.isEmpty) return;

    _cameraController = CameraController(
      _cameras.first,
      ResolutionPreset.high,
      enableAudio: false,
    );

    await _cameraController!.initialize();
    if (mounted) setState(() => _isCameraOn = true);
  }

  // ── Dialogs ──────────────────────────────────────────────────────────────

  void _showTextInputDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Type to Translate'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Enter text in English...',
            filled: true,
            fillColor: const Color(0xFFF1F5F9),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF14B8A6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              // Avatar just keeps looping — placeholder behaviour
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Translating: "${controller.text}"'),
                  backgroundColor: const Color(0xFF14B8A6),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              );
            },
            child: const Text('Translate', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _toggleMic() {
    setState(() => _isListening = !_isListening);
    if (_isListening) {
      // Just visual feedback — no real mic logic yet
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _isListening = false);
      });
    }
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // ── Top bar ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Spacer(),
                  const Text(
                    'ASL Translator',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  const SizedBox(width: 48), // balance the back button
                ],
              ),
            ),

            // ── Camera (top 50%) ─────────────────────────────────────────
            Expanded(
              child: _buildCameraHalf(),
            ),

            // ── Divider ──────────────────────────────────────────────────
            Container(
              height: 2,
              color: const Color(0xFF14B8A6),
            ),

            // ── Avatar (bottom 50%) ──────────────────────────────────────
            Expanded(
              child: _buildAvatarHalf(),
            ),

            // ── Action buttons ───────────────────────────────────────────
            _buildBottomBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildCameraHalf() {
    if (_isCameraOn && _cameraController != null && _cameraController!.value.isInitialized) {
      return ClipRect(
        child: OverflowBox(
          alignment: Alignment.center,
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _cameraController!.value.previewSize!.height,
              height: _cameraController!.value.previewSize!.width,
              child: CameraPreview(_cameraController!),
            ),
          ),
        ),
      );
    }

    return Container(
      color: const Color(0xFF1E1E2E),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.videocam_off_rounded, size: 56, color: Colors.white.withOpacity(0.3)),
            const SizedBox(height: 12),
            Text(
              'Camera is off',
              style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(
              'Tap the camera button below to start',
              style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarHalf() {
    return Container(
      color: const Color(0xFF0F172A),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Video
          if (_videoReady)
            FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _videoController.value.size.width,
                height: _videoController.value.size.height,
                child: VideoPlayer(_videoController),
              ),
            )
          else
            Center(
              child: CircularProgressIndicator(color: const Color(0xFF14B8A6)),
            ),

          // Label overlay
          Positioned(
            top: 10,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF14B8A6).withOpacity(0.85),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'ASL Avatar',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      color: const Color(0xFF0F172A),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Camera toggle
          _ActionButton(
            icon: _isCameraOn ? Icons.videocam_rounded : Icons.videocam_off_rounded,
            label: _isCameraOn ? 'Stop' : 'Camera',
            active: _isCameraOn,
            onTap: _toggleCamera,
          ),

          // Text input
          _ActionButton(
            icon: Icons.keyboard_alt_outlined,
            label: 'Type',
            active: false,
            onTap: _showTextInputDialog,
          ),

          // Mic
          _ActionButton(
            icon: _isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
            label: _isListening ? 'Listening...' : 'Speak',
            active: _isListening,
            onTap: _toggleMic,
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _videoController.dispose();
    super.dispose();
  }
}

// ── Reusable action button ────────────────────────────────────────────────────

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF14B8A6) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(30),
          boxShadow: active
              ? [BoxShadow(color: const Color(0xFF14B8A6).withOpacity(0.4), blurRadius: 12, spreadRadius: 2)]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 22),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}