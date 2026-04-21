part of 'settings_bloc.dart';

enum SettingsStatus { initial, loading, loaded, error }

class SettingsState extends Equatable {
  final SettingsStatus status;

  const SettingsState._({required this.status});

  const SettingsState.initial() : this._(status: SettingsStatus.initial);
  const SettingsState.loading() : this._(status: SettingsStatus.loading);
  const SettingsState.loaded() : this._(status: SettingsStatus.loaded);
  const SettingsState.error() : this._(status: SettingsStatus.error);

  @override
  List<Object?> get props => [status];
}
