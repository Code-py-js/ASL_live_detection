# CI/CD Pipeline & Code Quality Setup

**Status**: ✅ COMPLETE - SPRINT 3 Phase 1  
**Date**: March 19, 2026  
**Version**: 1.0.0

---

## Overview

This document describes the complete Continuous Integration/Continuous Deployment (CI/CD) pipeline and code quality checks for the ASL Live Detection project.

---

## 1. GitHub Actions Workflows

### 1.1 Backend CI/CD Pipeline (`ci.yml`)

**Trigger**: Push to `main`/`develop` or PR with backend changes

**Jobs**:
1. **Checkout Code** - Clone repository
2. **Setup Node.js** - Install Node 18.x & 20.x (matrix)
3. **Install Dependencies** - `npm ci` for production-grade install
4. **ESLint** - Static code analysis
5. **Jest Tests** - Run unit tests with coverage
6. **Coverage Report** - Generate and upload to Codecov
7. **PR Comment** - Add coverage metrics to pull request
8. **Coverage Check** - Fail if below 80%

**Expected Output**:
- ✅ Tests pass
- ✅ Coverage ≥ 80%
- ✅ No linting errors
- ✅ Success/Failure notification

**Run Time**: ~3 minutes

```bash
# Local equivalent
cd backend
npm install
npm run lint
npm test -- --coverage
npm run format:check
```

---

### 1.2 Flutter CI/CD Pipeline (`flutter.yml`)

**Trigger**: Push to `main`/`develop` or PR with mobile changes

**Jobs**:
1. **Setup Flutter SDK** - Flutter 3.19.x
2. **Install Dependencies** - `flutter pub get`
3. **Analyze** - `flutter analyze`
4. **Unit Tests** - Run with coverage
5. **Build APK** - Android debug APK
6. **Upload Artifacts** - Store APK for testing
7. **PR Comment** - Add test results

**Expected Output**:
- ✅ Analyzer passes
- ✅ All tests pass
- ✅ Debug APK built
- ✅ Artifact stored (7-day retention)

**Run Time**: ~5 minutes

```bash
# Local equivalent
cd mobile
flutter pub get
flutter analyze
flutter test --coverage
flutter build apk --debug
```

---

### 1.3 Python ML CI/CD Pipeline (`ml.yml`)

**Trigger**: Push to `main`/`develop` or PR with ml changes

**Jobs**:
1. **Setup Python** - Python 3.9, 3.10, 3.11 (matrix)
2. **Install Dependencies** - `pip install -r requirements.txt`
3. **Black Formatter** - Code formatting check
4. **Flake8 Linting** - Style validation
5. **Pytest** - Run tests with coverage
6. **Model Loading** - Test TensorFlow Lite import
7. **Inference Benchmark** - Performance check
8. **Upload Coverage** - Codecov

**Expected Output**:
- ✅ Black format OK
- ✅ Flake8 lint OK
- ✅ All tests pass
- ✅ Model loads successfully
- ✅ Inference: ~2ms per frame

**Run Time**: ~4 minutes (per Python version)

```bash
# Local equivalent
cd ml
pip install -r requirements.txt
black --check .
flake8 .
pytest --cov=. --cov-report=xml
python -c "import tensorflow as tf"
```

---

### 1.4 Deployment Pipeline (`deploy.yml`)

**Trigger**: Push to `main` branch (manual trigger available)

**Environment**: Production

**Jobs**:
1. **Build All Components** - Backend, Flutter, ML
2. **Run Full Test Suite** - All 3 workflows
3. **Deploy Backend** - To Heroku/AWS/DigitalOcean
4. **Deploy Mobile** - To Firebase App Distribution
5. **Send Slack Notification** - Success/failure status

**Expected Output**:
- ✅ All tests pass
- ✅ Backend deployed to production
- ✅ APK distributed to testers
- ✅ Slack notification sent

**Run Time**: ~10 minutes

**Prerequisites**:
- `HEROKU_API_KEY` secret configured
- `HEROKU_APP_NAME` secret configured
- `FIREBASE_TOKEN` secret configured
- `FIREBASE_APP_ID` secret configured
- `SLACK_WEBHOOK` secret configured

---

## 2. Code Quality Tools

### 2.1 ESLint Configuration (Backend)

**File**: `.eslintrc.json`

**Rules**:
- ✅ No unused variables (warn)
- ✅ No console logs (warn, except console.warn/error)
- ✅ Strict equality (`==` → `===`)
- ✅ 2-space indentation
- ✅ Single quotes
- ✅ Semicolons required
- ✅ Trailing commas in multiline
- ✅ No trailing whitespace

**Run**:
```bash
npm run lint          # Check only
npm run lint:fix      # Auto-fix issues
```

---

### 2.2 Prettier Configuration (All)

**File**: `.prettierrc.json`

**Settings**:
- Semi: true
- Trailing Comma: all
- Single Quote: true
- Print Width: 80
- Tab Width: 2
- Line Ending: LF (Unix)

**Run**:
```bash
npm run format         # Format all files
npm run format:check   # Check without modifying
```

---

### 2.3 Flutter Analysis (Mobile)

**File**: `mobile/analysis_options.yaml`

**Rules Enabled**: 80+ Dart linting rules including:
- ✅ Avoid print in production
- ✅ Use const constructors
- ✅ Proper type annotations
- ✅ Void check consistency
- ✅ Avoid null checks in equality
- ✅ Prefer single quotes
- ✅ Use const literals

**Run**:
```bash
cd mobile
flutter analyze
```

---

### 2.4 Dependabot Security Scanning

**File**: `.github/dependabot.yml`

**Scans**:
- ✅ Node.js dependencies (weekly, Monday 3 AM)
- ✅ Python dependencies (weekly, Monday 4 AM)
- ✅ GitHub Actions (weekly, Monday 5 AM)

**Features**:
- Auto-creates PRs with updates
- Requires review before merge
- Tracks CVEs
- Rebase strategy: auto

**Configuration**:
- Max 10 open PRs per ecosystem
- Commit prefix: `chore(deps)`
- Reviewers: assigned to salah

---

## 3. Setting Up GitHub Secrets

For automatic deployment, configure these secrets in GitHub:

```
Repository Settings → Secrets and Variables → Actions
```

**Required Secrets**:

| Secret | Purpose | Example |
|--------|---------|---------|
| `HEROKU_API_KEY` | Deploy token for Heroku | `1a2b3c4d5e6f7g8h` |
| `HEROKU_APP_NAME` | Heroku app identifier | `asl-live-detection-prod` |
| `FIREBASE_TOKEN` | Firebase CLI token | `[Firebase token]` |
| `FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:android:abcd1234` |
| `SLACK_WEBHOOK` | Slack notification URL | `https://hooks.slack.com/...` |

---

## 4. Branch Protection Rules

To enable automatic enforcement of CI checks:

```
Repository Settings → Branches → Add rule
```

**Configure**:
1. ✅ Require status checks to pass:
   - Require: `test (18.x)`, `test (20.x)`
   - Require: `Flutter tests`
   - Require: `Python ML tests (3.9, 3.10, 3.11)`

2. ✅ Require code reviews:
   - Require 1 approval before merge

3. ✅ Dismiss stale pull request approvals:
   - Enable (auto-re-request after new commits)

4. ✅ Prevent force pushes:
   - Enable (protect against accidental overwrites)

5. ✅ Require branch to be up to date:
   - Enable (require rebase before merge)

---

## 5. Workflow Logs & Debugging

### View Workflow Runs
```
GitHub Repository → Actions tab → Click workflow run
```

### Common Failures & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `npm: command not found` | Node.js not installed | Running on wrong runner or Node.js setup failed |
| `jest timeout` | Tests taking >10s | Increase timeout in jest.config.js |
| `Coverage below 80%` | New code not tested | Add unit tests for new functionality |
| `Lint errors` | Code style violations | Run `npm run lint:fix` locally |
| `Deploy failed` | Secrets not configured | Add missing GitHub secrets |
| `Flutter build failed` | Dependencies not resolved | Run `flutter clean && flutter pub get` |
| `Python import error` | Missing package | Check `ml/requirements.txt` |

### Enable Debug Logging

Add to workflow step:
```yaml
- name: Debug
  run: npm test -- --verbose
```

---

## 6. Manual Workflow Triggers

Run workflows manually without pushing code:

```
GitHub Repository → Actions → Select workflow → Run workflow
```

**Available for manual run**:
- CI (Backend tests)
- Flutter tests
- ML tests
- Deploy (production deployment)

---

## 7. Artifacts & Retention

**Default Retention**: 30 days

**Artifacts Stored**:
- Flutter APK (~100MB)
- Test reports (JSON, XML)
- Coverage reports (HTML)

**Manual Download**:
```
Actions run → Artifacts section → Download
```

**Extend Retention**:
```yaml
- name: Upload Artifact
  uses: actions/upload-artifact@v3
  with:
    retention-days: 90  # Override 30-day default
```

---

## 8. Coverage Monitoring

### View Coverage Locally
```bash
# Generate coverage report
npm test -- --coverage

# Open HTML report
open backend/coverage/lcov-report/index.html
```

### Codecov Integration

Coverage automatically uploaded to [codecov.io](https://codecov.io)

**Badge**: Add to README:
```markdown
[![codecov](https://codecov.io/gh/USERNAME/asl-live-detection/branch/main/graph/badge.svg?token=TOKEN)](https://codecov.io/gh/USERNAME/asl-live-detection)
```

---

## 9. Performance Benchmarks

**Expected CI Times**:
| Workflow | Time |
|----------|------|
| Backend CI | ~3 min |
| Flutter CI | ~5 min |
| ML CI | ~4 min (per Python version) |
| Deploy | ~10 min |
| Total | ~22 min (parallel) |

**Optimization Tips**:
1. Use `npm ci` instead of `npm install` (faster)
2. Cache dependencies (already configured)
3. Parallel job execution (GitHub does this automatically)
4. Skip coverage for draft PRs

---

## 10. Next Steps

- [x] GitHub Actions workflows created
- [x] ESLint & Prettier configured
- [x] Flutter analysis enabled
- [x] Dependabot security scanning configured
- [ ] Push to GitHub & enable branch protection
- [ ] Configure GitHub secrets
- [ ] Test first deployment
- [ ] Monitor workflow runs
- [ ] Create team notifications

---

## Documentation References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Flutter Analysis](https://dart.dev/guides/language/analysis-options)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

