# Project Roadmap

This roadmap outlines the planned phases and major milestones for the SignConnect project.

## Phase 0 – Foundation & Repository Scaffold
- Establish repository structure and documentation
- Create basic audit tracking (bugs, reports, corrections)

## Phase 1 – Mobile Frontend Baseline
- Scaffold Flutter app in `mobile/`
- Implement placeholder screens and BLoC wiring
- Validate build/run on target platforms

## Phase 2 – ML Inference Pipeline Prototype
- Implement MediaPipe keypoint extraction
- Create TFLite inference stub and sample data
- Provide runnable validation script

## Phase 3 – Backend API & Persistence
- Scaffold backend API and database layer
- Implement auth and sign-processing endpoints
- Add healthcheck, basic end-to-end flow

## Phase 4 – Integration & End-to-End Prototype
- Wire mobile app to backend and ML pipeline
- Verify offline inference + backend sync
- Document data contracts and integration points

## Phase 5 – Testing & CI Automation
- Add unit/integration tests
- Configure CI pipeline (GitHub Actions, etc.)
- Ensure linting and static analysis pass
