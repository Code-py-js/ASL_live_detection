import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:asl_live_detection/core/services/api_service.dart';

import 'api_service_test.mocks.dart';

@GenerateMocks([http.Client, FlutterSecureStorage])
void main() {
  late ApiService apiService;
  late MockClient mockHttpClient;
  late MockFlutterSecureStorage mockSecureStorage;

  setUp(() {
    mockHttpClient = MockClient();
    mockSecureStorage = MockFlutterSecureStorage();
    apiService = ApiService(
      httpClient: mockHttpClient,
      secureStorage: mockSecureStorage,
    );
  });

  group('ApiService Auth', () {
    const tEmail = 'test@example.com';
    const tPassword = 'password123';
    const tBaseUrl = 'http://localhost:4000/api/v1';

    test('login should store tokens on success', () async {
      // arrange
      final tResponse = {
        'accessToken': 'access_token',
        'refreshToken': 'refresh_token',
        'user': {'id': '123', 'email': tEmail},
        'expiresIn': 3600
      };

      when(mockHttpClient.post(
        Uri.parse('$tBaseUrl/auth/login'),
        headers: anyNamed('headers'),
        body: anyNamed('body'),
      )).thenAnswer((_) async => http.Response(jsonEncode(tResponse), 200));

      when(mockSecureStorage.write(
        key: anyNamed('key'),
        value: anyNamed('value'),
      )).thenAnswer((_) async => {});

      // act
      final result = await apiService.login(email: tEmail, password: tPassword);

      // assert
      expect(result['accessToken'], 'access_token');
      verify(mockSecureStorage.write(key: 'access_token', value: 'access_token'));
      verify(mockSecureStorage.write(key: 'refresh_token', value: 'refresh_token'));
    });

    test('login should throw ApiException on 401', () async {
      // arrange
      when(mockHttpClient.post(
        any,
        headers: anyNamed('headers'),
        body: anyNamed('body'),
      )).thenAnswer((_) async => http.Response('Unauthorized', 401));

      // act & assert
      expect(
        () => apiService.login(email: tEmail, password: tPassword),
        throwsA(isA<ApiException>()),
      );
    });
  });

  group('ApiService Translations', () {
    test('getTranslations should throw ApiException if not authenticated', () async {
      expect(
        () => apiService.getTranslations(),
        throwsA(isA<ApiException>()),
      );
    });
  });
}
