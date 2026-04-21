import 'package:flutter_test/flutter_test.dart';
import 'package:asl_live_detection/core/models/user.dart';

void main() {
  group('User Model', () {
    final tUserJson = {
      '_id': '123',
      'email': 'test@example.com',
      'createdAt': '2026-03-19T14:00:00.000Z',
      'updatedAt': '2026-03-19T15:00:00.000Z',
    };

    final tUser = User(
      id: '123',
      email: 'test@example.com',
      createdAt: DateTime.parse('2026-03-19T14:00:00.000Z'),
      updatedAt: DateTime.parse('2026-03-19T15:00:00.000Z'),
    );

    test('should return a valid model from JSON', () {
      final result = User.fromJson(tUserJson);
      expect(result, tUser);
    });

    test('should return a JSON map containing proper data', () {
      final result = tUser.toJson();
      expect(result['_id'], tUser.id);
      expect(result['email'], tUser.email);
    });
  });

  group('AuthResponse Model', () {
    final tAuthResponseJson = {
      'accessToken': 'access_token',
      'refreshToken': 'refresh_token',
      'user': {
        '_id': '123',
        'email': 'test@example.com',
        'createdAt': '2026-03-19T14:00:00.000Z',
      },
      'expiresIn': 3600,
    };

    test('should return a valid model from JSON', () {
      final result = AuthResponse.fromJson(tAuthResponseJson);
      expect(result.accessToken, 'access_token');
      expect(result.user.id, '123');
    });
  });
}
