part of 'home_bloc.dart';

enum HomeStatus { initial, loading, loaded, error }

class HomeState extends Equatable {
  final HomeStatus status;

  const HomeState._({required this.status});

  const HomeState.initial() : this._(status: HomeStatus.initial);
  const HomeState.loading() : this._(status: HomeStatus.loading);
  const HomeState.loaded() : this._(status: HomeStatus.loaded);
  const HomeState.error() : this._(status: HomeStatus.error);

  @override
  List<Object?> get props => [status];
}
