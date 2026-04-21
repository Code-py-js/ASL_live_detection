part of 'results_bloc.dart';

abstract class ResultsEvent extends Equatable {
  const ResultsEvent();

  @override
  List<Object?> get props => [];
}

class ResultsRequested extends ResultsEvent {}
