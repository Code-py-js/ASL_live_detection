import 'package:bloc/bloc.dart';

/// Simple BlocObserver that logs state transitions.
class AppBlocObserver extends BlocObserver {
  @override
  void onEvent(Bloc bloc, Object? event) {
    super.onEvent(bloc, event);
    // ignore: avoid_print
    print('[Bloc] ${bloc.runtimeType} event: $event');
  }

  @override
  void onChange(BlocBase bloc, Change change) {
    super.onChange(bloc, change);
    // ignore: avoid_print
    print('[Bloc] ${bloc.runtimeType} change: $change');
  }

  @override
  void onError(BlocBase bloc, Object error, StackTrace stackTrace) {
    super.onError(bloc, error, stackTrace);
    // ignore: avoid_print
    print('[Bloc] ${bloc.runtimeType} error: $error');
  }
}
