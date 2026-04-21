import 'package:flutter/material.dart';

class ResultsPage extends StatelessWidget {
  static const routeName = '/results';

  const ResultsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Results'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Translated Output',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05),
                ),
                child: const Center(
                  child: Text(
                    '''Results will appear here after running inference.

In Phase 2, this will show the predicted phrase and confidence.''',
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                // Placeholder action
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Run inference placeholder')),
                );
              },
              icon: const Icon(Icons.play_arrow),
              label: const Text('Run Inference'),
            ),
          ],
        ),
      ),
    );
  }
}
