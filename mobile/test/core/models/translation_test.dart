import 'package:flutter_test/flutter_test.dart';
import 'package:asl_live_detection/core/models/translation.dart';

void main() {
  group('Translation Model', () {
    final tTranslationJson = {
      '_id': 't1',
      'userId': 'u1',
      'signText': 'HELLO',
      'translatedText': 'Bonjour',
      'confidence': 0.95,
      'createdAt': '2026-03-19T14:00:00.000Z',
    };

    test('should return a valid model from JSON', () {
      final result = Translation.fromJson(tTranslationJson);
      expect(result.id, 't1');
      expect(result.confidence, 0.95);
    });

    test('should return a JSON map containing proper data', () {
      final model = Translation.fromJson(tTranslationJson);
      final result = model.toJson();
      expect(result['_id'], 't1');
      expect(result['confidence'], 0.95);
    });
  });

  group('TranslationsResponse Model', () {
    final tResponseJson = {
      'translations': [
        {
          '_id': 't1',
          'userId': 'u1',
          'signText': 'HELLO',
          'translatedText': 'Bonjour',
          'confidence': 0.95,
          'createdAt': '2026-03-19T14:00:00.000Z',
        }
      ],
      'page': 1,
      'limit': 10,
      'total': 1,
      'totalPages': 1,
    };

    test('should return a valid model from JSON', () {
      final result = TranslationsResponse.fromJson(tResponseJson);
      expect(result.translations.length, 1);
      expect(result.total, 1);
    });
  });
}
