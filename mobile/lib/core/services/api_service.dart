import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static final String _baseUrl = kIsWeb 
      ? 'http://localhost:4000/api/v1' 
      : (Platform.isAndroid ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1');
      
  static const String _accessTokenKey = 'access_token';

  final http.Client _httpClient;
  final FlutterSecureStorage _secureStorage;

  String? _accessToken;

  ApiService({
    http.Client? httpClient,
    FlutterSecureStorage? secureStorage,
  })  : _httpClient = httpClient ?? http.Client(),
        _secureStorage = secureStorage ?? const FlutterSecureStorage();

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? nickname,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$_baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'nickname': nickname,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return data;
      } else {
        throw ApiException(
          code: data['code'] ?? 'ERROR',
          message: data['message'] ?? 'Registration failed',
        );
      }
    } on SocketException {
      throw ApiException(code: 'NETWORK_ERROR', message: 'Cannot reach server. Check your connection.');
    } on FormatException {
      throw ApiException(code: 'PARSE_ERROR', message: 'Bad response from server.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(code: 'UNKNOWN', message: e.toString());
    }
  }

  Future<Map<String, dynamic>> verifyEmail({
    required String email,
    required String code,
  }) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$_baseUrl/auth/verify-email'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'code': code}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        await _secureStorage.write(key: _accessTokenKey, value: data['token']);
        _accessToken = data['token'];
        return data;
      } else {
        throw ApiException(code: data['code'] ?? 'ERROR', message: data['message'] ?? 'Verification failed');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(code: 'UNKNOWN', message: e.toString());
    }
  }

  void dispose() => _httpClient.close();
}

class ApiException implements Exception {
  final String code;
  final String message;
  ApiException({required this.code, required this.message});
  @override
  String toString() => message;
}
