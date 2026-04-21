part of 'results_bloc.dart';

enum ResultsStatus { initial, loading, loaded, error }

class ResultsState extends Equatable {
  final ResultsStatus status;

  const ResultsState._({required this.status});

  const ResultsState.initial() : this._(status: ResultsStatus.initial);
  const ResultsState.loading() : this._(status: ResultsStatus.loading);
  const ResultsState.loaded() : this._(status: ResultsStatus.loaded);
  const ResultsState.error() : this._(status: ResultsStatus.error);

  @override
  List<Object?> get props => [status];
}
