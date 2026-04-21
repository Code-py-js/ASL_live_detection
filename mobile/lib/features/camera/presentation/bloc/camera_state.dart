part of 'camera_bloc.dart';

enum CameraStatus { initial, loading, ready, error }

class CameraState extends Equatable {
  final CameraStatus status;

  const CameraState._({required this.status});

  const CameraState.initial() : this._(status: CameraStatus.initial);
  const CameraState.loading() : this._(status: CameraStatus.loading);
  const CameraState.ready() : this._(status: CameraStatus.ready);
  const CameraState.error() : this._(status: CameraStatus.error);

  @override
  List<Object?> get props => [status];
}
