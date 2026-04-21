import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'camera_event.dart';
part 'camera_state.dart';

class CameraBloc extends Bloc<CameraEvent, CameraState> {
  CameraBloc() : super(const CameraState.initial()) {
    on<CameraStarted>((event, emit) {
      emit(const CameraState.ready());
    });
  }
}
