import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'results_event.dart';
part 'results_state.dart';

class ResultsBloc extends Bloc<ResultsEvent, ResultsState> {
  ResultsBloc() : super(const ResultsState.initial()) {
    on<ResultsRequested>((event, emit) {
      emit(const ResultsState.loaded());
    });
  }
}
