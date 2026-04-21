import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class CameraPage extends StatefulWidget {
  static const routeName = '/camera';

  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  bool _hasPermission = false;
  bool _requesting = false;

  @override
  void initState() {
    super.initState();
    _checkPermission();
  }

  Future<void> _checkPermission() async {
    final status = await Permission.camera.status;
    setState(() => _hasPermission = status.isGranted);
  }

  Future<void> _requestPermission() async {
    setState(() => _requesting = true);
    final status = await Permission.camera.request();
    setState(() {
      _requesting = false;
      _hasPermission = status.isGranted;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Camera'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Camera Preview (placeholder)',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Theme.of(context).colorScheme.onBackground.withOpacity(0.05),
                ),
                child: Center(
                  child: _hasPermission
                      ? const Text('Camera permission granted. Future camera preview goes here.')
                      : const Text('Camera permission is required to start the preview.'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _requesting ? null : _requestPermission,
              icon: const Icon(Icons.camera_alt),
              label: Text(_hasPermission ? 'Permission Granted' : 'Request Camera Permission'),
            ),
            const SizedBox(height: 8),
            const Text(
              'In Phase 2, this screen will display a live camera feed with MediaPipe keypoint capture.',
              style: TextStyle(color: Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}
