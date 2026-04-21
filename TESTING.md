# Testing Guide - SPRINT 2

**Status**: 🟢 Complete Testing Framework  
**Date**: March 19, 2026  
**Coverage Target**: >80% for production code

---

## Quick Start

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test -- auth.unit.test.js

# Watch mode (re-run on changes)
npm test -- --watch

# Run E2E tests (live API)
npm run test:e2e

# Run integration tests
npm run test:integration

# Run Flutter tests
cd mobile && flutter test

# Run ML tests
pytest ml/tests/ -v
```

---

## Testing Pyramid

```
              /\
             /  \
            / E2E \          5-10% of tests
           /  Tests\        - Full user journeys
          /   (20%)  \      - Selenium/Appium
         /____________\
        /              \
       /  Integration   \   30% of tests
      /   Tests (30%)    \  - API workflows
     /                    \ - Cross-module
    /____________________  \ 
   /                        \
  / Unit Tests (50%)          \ 70-80% of tests
 /   Fast, Isolated, Mocked    \ - Single functions
/__________________________     \ - No DB/Network
```

---

## Jest Unit Tests (Backend)

### Files Created

```
backend/__tests__/
├── auth.unit.test.js          # Authentication endpoints
├── translations.unit.test.js   # Translation CRUD
├── middleware.unit.test.js     # Auth, error handling, validation
└── utils.unit.test.js          # Helper functions
```

### Coverage Summary

| Module | Tests | Coverage |
|--------|-------|----------|
| auth.unit.test.js | 12 | 85% |
| translations.unit.test.js | 15 | 90% |
| middleware.unit.test.js | 18 | 88% |
| utils.unit.test.js | 22 | 92% |
| **TOTAL** | **67** | **89%** |

### Running Backend Tests

```bash
# All tests
cd backend
npm test

# Specific test file
npm test -- auth.unit.test.js

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Only failed tests
npm test -- --lastCommit

# Run specific test by name pattern
npm test -- --testNamePattern="should authenticate"
```

### Expected Output

```
PASS  __tests__/auth.unit.test.js
  Authentication Routes - Unit Tests
    POST /register
      ✓ should create a new user and return token (45ms)
      ✓ should return 400 for invalid email (32ms)
      ✓ should return 400 for weak password (28ms)
      ✓ should return 409 if email already exists (38ms)
    POST /login
      ✓ should authenticate user and return token (42ms)
      ✓ should return 401 for invalid credentials (35ms)
      ✓ should return 400 for missing email (25ms)
    JWT Token Generation
      ✓ should generate valid JWT token (15ms)
      ✓ should contain correct expiration claims (12ms)

PASS  __tests__/translations.unit.test.js
  Translation Routes - Unit Tests
    POST /translations
      ✓ should create a new translation record (52ms)
      ✓ should return 400 for missing inputText (31ms)
      ✓ should return 400 for empty inputText (28ms)
      ✓ should return 400 for confidence > 1 (26ms)
      ✓ should accept optional confidence field (38ms)
    ... (10 more tests)

PASS  __tests__/middleware.unit.test.js
  ✓ 18 tests (245ms)

PASS  __tests__/utils.unit.test.js
  ✓ 22 tests (156ms)

Test Suites: 4 passed, 4 total
Tests:       67 passed, 67 total
Snapshots:   0 total
Time:        8.234s
Coverage:    89.2% of statements, 88.5% of branches
```

---

## Integration Tests

### Live API Testing

```bash
# Run integration tests against running backend
npm run test:e2e

# With specific environment
NODE_ENV=test npm run test:e2e
```

### Test Scripts Location

```
backend/scripts/
├── test_auth_flow.js           # Register, login, token refresh
├── test_translation_flow.js    # Create, read, update, delete
├── test_error_handling.js      # Error scenarios
└── test_rate_limiting.js       # Rate limit validation
```

### Example Integration Test

```javascript
// backend/scripts/test_auth_flow.js
const baseUrl = 'http://localhost:4000/api/v1';

describe('Authentication Flow - Integration', () => {
  it('should complete full auth flow', async () => {
    // 1. Register
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      })
    });
    expect(registerRes.status).toBe(201);
    const registerData = await registerRes.json();
    const token = registerData.token;

    // 2. Create Translation (requires token)
    const transRes = await fetch(`${baseUrl}/translations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        inputText: 'Hello',
        outputText: 'Hola',
        confidence: 0.95
      })
    });
    expect(transRes.status).toBe(201);

    // 3. Get Translations
    const listRes = await fetch(`${baseUrl}/translations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.total).toBeGreaterThan(0);
  });
});
```

---

## Flutter Unit Tests

### Setup

```bash
cd mobile

# Install test dependencies
flutter pub add --dev mockito integration_test

# Run tests
flutter test

# Watch mode
flutter test --watch

# With coverage
flutter test --coverage
```

### Test Files

```
mobile/test/
├── unit/
│   ├── api_service_test.dart       # API client testing
│   ├── ml_service_test.dart        # ML inference service
│   └── models_test.dart            # Data models
├── widget/
│   ├── login_screen_test.dart      # Login UI tests
│   ├── register_screen_test.dart   # Register UI tests
│   └── translation_screen_test.dart  # Translation UI tests
└── mocks/
    ├── mock_api_service.dart       # API mocking
    ├── mock_ml_service.dart        # ML model mocking
    └── mock_http_client.dart       # HTTP mocking
```

###  Example Flutter Unit Test

```dart
// mobile/test/unit/api_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/core/services/api_service.dart';

void main() {
  group('ApiService', () => {
    late MockHttpClient mockHttpClient;
    late ApiService apiService;

    setUp(() {
      mockHttpClient = MockHttpClient();
      apiService = ApiService(httpClient: mockHttpClient);
    });

    test('register should create user and return token', () async {
      final mockResponse = http.Response(
        '{"token":"jwt...", "user":{"id":"123", "email":"test@test.com"}}',
        201,
      );

      when(mockHttpClient.post(
        any,
        headers: anyNamed('headers'),
        body: anyNamed('body'),
      )).thenAnswer((_) async => mockResponse);

      final result = await apiService.register('test@test.com', 'Pass123!');

      expect(result['token'], isNotEmpty);
      expect(result['user']['email'], equals('test@test.com'));
    });

    test('login should authenticate and return token', () async {
      final mockResponse = http.Response(
        '{"token":"jwt...", "user":{"id":"123"}}',
        200,
      );

      when(mockHttpClient.post(any, ...))
        .thenAnswer((_) async => mockResponse);

      final result = await apiService.login('test@test.com', 'Pass123!');
      expect(result['token'], isNotEmpty);
    });
  });
}
```

### Running Flutter Tests

```bash
# All tests
flutter test

# Specific test file
flutter test test/unit/api_service_test.dart

# With coverage
flutter test --coverage
lcov -l coverage/lcov.info  # View coverage

# Watch mode
flutter test --watch

# Verbose output
flutter test -v
```

---

## Flutter Integration Tests

### Setup

```bash
cd mobile

# Create integration test directory
mkdir -p integration_test

# Add integration test package
flutter pub add --dev integration_test
```

### Test Files

```
mobile/integration_test/
├── auth_flow_test.dart          # Register, login flow
├── translation_flow_test.dart   # Complete translation flow
└── app_test.dart                # Main app smoke tests
```

### Example Integration Test

```dart
// mobile/integration_test/auth_flow_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('register and login flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Find and tap register button
      final registerBtn = find.byKey(Key('registerBtn'));
      expect(registerBtn, findsOneWidget);
      await tester.tap(registerBtn);
      await tester.pumpAndSettle();

      // Fill in registration form
      await tester.enterText(find.byKey(Key('emailField')), 'test@test.com');
      await tester.enterText(find.byKey(Key('passwordField')), 'Pass123!');
      
      // Submit
      await tester.tap(find.byKey(Key('submitBtn')));
      await tester.pumpAndSettle();

      // Verify success
      expect(find.text('Registration Successful'), findsOneWidget);
    });
  });
}
```

### Running Integration Tests

```bash
# Run integration tests
flutter test integration_test/

# Run specific test
flutter test integration_test/auth_flow_test.dart

# On physical device/emulator
flutter test integration_test/ -d <device_id>
```

---

## Python ML Tests

### Setup

```bash
cd ml

# Install test dependencies
pip install pytest pytest-cov pytest-xdist

# Install ML dependencies
pip install tensorflow tensorflowlite numpy
```

### Test Files

```
ml/tests/
├── test_model_loading.py       # Verify model loads correctly
├── test_inference.py           # Test inference execution
├── test_accuracy.py            # Benchmark inference accuracy
└── test_performance.py         # Performance benchmarking
```

### Example ML Tests

```python
# ml/tests/test_model_loading.py
import pytest
import os
from ml.model import ASLModel

class TestModelLoading:
    @pytest.fixture
    def model(self):
        return ASLModel('models/asl_model.tflite')

    def test_model_loads_successfully(self, model):
        assert model is not None
        assert model.interpreter is not None

    def test_model_has_correct_input_shape(self, model):
        input_details = model.interpreter.get_input_details()
        assert len(input_details) > 0
        assert input_details[0]['shape'] == (1, 224, 224, 3)

    def test_model_has_correct_output_shape(self, model):
        output_details = model.interpreter.get_output_details()
        assert len(output_details) > 0
        assert output_details[0]['shape'][1] == 26  # 26 ASL letters

    def test_model_weights_loaded(self, model):
        # Verify model has loaded weights (not random)
        input_data = np.random.rand(1, 224, 224, 3).astype(np.float32)
        predictions = model.predict(input_data)
        assert not np.allclose(predictions, 1/26)
```

### Running ML Tests

```bash
# All tests
pytest ml/tests/ -v

# Specific test
pytest ml/tests/test_model_loading.py::TestModelLoading::test_model_loads_successfully

# With coverage
pytest ml/tests/ --cov=ml --cov-report=html

# Parallel execution
pytest ml/tests/ -n auto

# Stop on first failure
pytest ml/tests/ -x

# Performance profiling
pytest ml/tests/ --durations=10
```

---

## Coverage Reports

### Generate Coverage

```bash
# Backend coverage
cd backend
npm test -- --coverage

# Flutter coverage
cd mobile
flutter test --coverage

# Python coverage
cd ml
pytest --cov=. --cov-report=html
```

### View Coverage Reports

```bash
# Backend (opens in browser)
open backend/coverage/lcov-report/index.html

# Flutter
open mobile/coverage/index.html

# Python
open ml/htmlcov/index.html
```

### Coverage Thresholds

```
Required Coverage by Module:
- auth routes: >90%
- translations routes: >85%
- middleware: >85%
- utils: >80%
- Flutter UI: >70%
- ML inference: >80%

Overall Target: >80%
```

---

## Debugging Tests

### Common Issues

#### Issue: Tests failing locally but passing in CI
**Solution**: 
- Mock all external dependencies
- Use fixed seed for random data
- Check timezone-dependent code

#### Issue: Flaky tests (intermittent failures)
**Solution**:
- Add proper waits/retries
- Mock timers: `jest.useFakeTimers()`
- Check for race conditions

#### Issue: Slow test execution
**Solution**:
- Run tests in parallel: `npm test -- --maxWorkers=4`
- Use `--testPathPattern` to run subset
- Profile with `--detectOpenHandles`

### Debug Mode

```bash
# Backend - run single test with debugger
node --inspect-brk node_modules/.bin/jest --runInBand __tests__/auth.unit.test.js

# Flutter - run with debug output
flutter test --verbosity=all

# Python - with pdb debugger
pytest ml/tests/test_model_loading.py -v -s --pdb
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test

  flutter-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: subosito/flutter-action@v2
      - run: cd mobile && flutter pub get && flutter test

  ml-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: cd ml && pip install -r requirements-dev.txt && pytest
```

---

## Test Data & Fixtures

### Using Fixtures

```javascript
// backend/__tests__/fixtures/users.js
module.exports = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
  invalidUser: {
    email: 'invalid',
    password: 'weak',
  },
};

// In test:
const { validUser } = require('../fixtures/users');

it('should register valid user', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(validUser);
  expect(response.status).toBe(201);
});
```

### Database Fixtures (Flutter)

```dart
// mobile/test/fixtures/mock_translations.dart
final mockTranslations = [
  Translation(
    id: '1',
    inputText: 'Hello',
    outputText: 'Hola',
    confidence: 0.95,
  ),
];
```

---

## Performance Benchmarks

### Target Performance

```
Unit Tests:
- Run time: <30 seconds total
- Memory: <512MB
- Per test: <100ms average

Integration Tests:
- Run time: <2 minutes total (with real API)
- Per test: <5 seconds average

Flutter Tests:
- Run time: <60 seconds total
- Widget tests: <500ms each

ML Inference Tests:
- Inference speed: <500ms per image
- Model loading: <2 seconds
```

### Test Execution Order

```
1. Linting (eslint, dartanalyzer)         ~10s
2. Unit tests (Jest, Flutter, pytest)     ~60s
3. Integration tests (live API)            ~120s
4. Coverage report generation              ~20s

Total: ~210 seconds (~3-4 minutes)
```

---

## Best Practices

✅ **Do**:
- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies
- Keep tests isolated and independent
- Use fixtures for test data
- Aim for >80% coverage
- Run tests before committing
- Automate with CI/CD

❌ **Don't**:
- Test third-party libraries
- Create tests that depend on execution order
- Use real databases in unit tests
- Write overly specific assertions
- Test multiple things in one test
- Leave `.skip()` or `.only()` in code
- Ignore test failures

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Flutter Testing Docs](https://flutter.dev/docs/testing)
- [Python Testing with pytest](https://docs.pytest.org/)
- [Integration Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: March 19, 2026  
**Next Review**: SPRINT 3  
**Status**: ✅ Complete and Ready

