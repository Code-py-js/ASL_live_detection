import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'app.dart';
import 'core/bloc/app_bloc_observer.dart';

void main() {
  Bloc.observer = AppBlocObserver();
  runApp(const App());
}
