import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/home_bloc.dart';

class HomePage extends StatefulWidget {
  static const routeName = '/';

  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    context.read<HomeBloc>().add(HomeStarted());

    _controller = AnimationController(
      duration: const Duration(milliseconds: 950),
      vsync: this,
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SignConnect'),
        centerTitle: true,
      ),
      body: FadeTransition(
        opacity: _fade,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Welcome to SignConnect',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text(
                'Choose a feature to get started. The app is designed for fast offline inference and clean navigation.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  children: [
                    _FeatureCard(
                      label: 'ASL Translator',
                      icon: Icons.camera_alt,
                      onTap: () => Navigator.pushNamed(context, '/camera'),
                    ),
                    _FeatureCard(
                      label: 'History',
                      icon: Icons.text_snippet,
                      onTap: () => Navigator.pushNamed(context, '/results'),
                    ),
                    _FeatureCard(
                      label: 'Settings',
                      icon: Icons.settings,
                      onTap: () => Navigator.pushNamed(context, '/settings'),
                    ),
                    _FeatureCard(
                      label: 'About',
                      icon: Icons.info,
                      onTap: () => showAboutDialog(
                        context: context,
                        applicationName: 'SignConnect',
                        applicationVersion: '0.1.0',
                        children: const [
                          Text('A prototype for real-time ASL ↔ speech translation.'),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      borderRadius: BorderRadius.circular(16),
      color: Theme.of(context).colorScheme.primary.withOpacity(0.12),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 42, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 12),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
