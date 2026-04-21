import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/pages/register_page.dart';
import 'features/auth/presentation/pages/welcome_page.dart';
import 'features/camera/presentation/pages/camera_page.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/home/presentation/pages/home_page.dart';
import 'features/results/presentation/pages/results_page.dart';
import 'features/settings/presentation/pages/settings_page.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => HomeBloc(),
      child: MaterialApp(
        title: 'SignConnect',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        initialRoute: WelcomePage.routeName,
        routes: {
          WelcomePage.routeName: (_) => const WelcomePage(),
          RegisterPage.routeName: (_) => const RegisterPage(),
          LoginPage.routeName: (_) => const LoginPage(),
          HomePage.routeName: (_) => const HomePage(),
          CameraPage.routeName: (_) => const CameraPage(),
          ResultsPage.routeName: (_) => const ResultsPage(),
          SettingsPage.routeName: (_) => const SettingsPage(),
        },
      ),
    );
  }
}
