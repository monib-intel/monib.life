# Admin Dashboard Testing Guide

This document describes the comprehensive test suite for the monib.life admin dashboard.

## Overview

The test suite covers both backend (Python/FastAPI) and frontend (TypeScript/React) components with comprehensive unit, integration, and end-to-end tests.

### Coverage Summary

- **Backend Coverage**: 90% (Target: >80%)
- **Frontend Coverage**: 72% (Target: >70%)
- **Total Tests**: 97 tests
- **Test Execution Time**: ~14 seconds

## Backend Tests (Python/pytest)

### Location
```
admin-api/tests/
├── __init__.py
├── test_api.py              # Basic API tests
├── test_api_integration.py  # Comprehensive API integration tests
├── test_job_manager.py      # JobManager unit tests
└── test_storage.py          # JobStorage unit tests
```

### Running Backend Tests

```bash
cd admin-api

# Install dependencies (if not already installed)
pip install -e ".[dev]"

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=term-missing --cov-report=html

# Run specific test file
pytest tests/test_job_manager.py -v

# Run specific test
pytest tests/test_job_manager.py::TestJobCreation::test_create_analyze_job -v
```

### Backend Test Categories

#### 1. JobManager Unit Tests (`test_job_manager.py`)
Tests the core job management functionality:

- **Job Creation**: Creating analyze and syntopical jobs
- **State Transitions**: Job lifecycle from QUEUED → RUNNING → COMPLETED/FAILED
- **Timeout Detection**: Jobs running >30 minutes marked as STUCK
- **CLI Command Building**: Correct command construction for different job types
- **Progress Tracking**: Parsing progress from subprocess output
- **Error Handling**: Non-zero exit codes, timeouts, exceptions
- **Job Cancellation**: Cancelling running jobs and cleanup

Example:
```python
def test_job_timeout_marks_as_stuck(self, job_manager):
    """Test that timed out jobs are marked as STUCK."""
    job_manager.timeout_seconds = 0.1
    job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
    # ... test implementation
```

#### 2. JobStorage Unit Tests (`test_storage.py`)
Tests the persistence layer:

- **CRUD Operations**: Create, read, update, delete jobs
- **Job Filtering**: Filter by status, limit results
- **Job Listing**: Sort by creation time, pagination
- **Old Job Cleanup**: Delete jobs older than N days
- **Persistence**: Data survives across storage instances
- **Error Handling**: Corrupted storage files

#### 3. API Integration Tests (`test_api_integration.py`)
Tests all API endpoints:

- **Health Endpoint**: GET /health
- **Upload Endpoint**: POST /api/upload
  - Valid EPUB files
  - Invalid file types
  - File size validation
  - Multiple files with same name
- **Job Creation**: POST /api/jobs/analyze, /api/jobs/analyze-syntopical
  - Valid requests
  - Missing files
  - Insufficient files for syntopical
- **Job Management**: 
  - GET /api/jobs (list with filters)
  - GET /api/jobs/{job_id}
  - DELETE /api/jobs/{job_id} (cancel)
  - GET /api/jobs/status
- **End-to-End Workflows**: Upload → Create → Monitor
- **Concurrent Operations**: Multiple simultaneous jobs
- **Error Handling**: Invalid inputs, missing resources

## Frontend Tests (TypeScript/Vitest)

### Location
```
admin-ui/src/test/
├── setup.ts              # Test setup and configuration
├── App.test.tsx          # Main app component tests
├── ApiService.test.ts    # API service unit tests
└── Integration.test.tsx  # Integration and workflow tests
```

### Running Frontend Tests

```bash
cd admin-ui

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test:coverage

# Run with UI
npm test:ui

# Run specific test file
npm test -- src/test/App.test.tsx
```

### Frontend Test Categories

#### 1. Component Tests (`App.test.tsx`)
Tests individual UI components and interactions:

- **Dashboard Rendering**: Title, sections display correctly
- **System Status**: Displays job counts and statistics
- **Upload Form**: File input, drag-and-drop
- **Job List**: Displays jobs with different statuses
- **Progress Indicators**: Running jobs show progress bars
- **Error Messages**: Display and dismissal
- **Job Selection**: Selecting jobs for log viewing

Example:
```typescript
it('handles file upload', async () => {
  const file = new File(['dummy content'], 'test.epub', { 
    type: 'application/epub+zip' 
  });
  const input = screen.getByLabelText(/Choose EPUB files/i);
  await user.upload(input, file);
  
  await waitFor(() => {
    expect(ApiService.uploadFile).toHaveBeenCalledWith(file);
  });
});
```

#### 2. API Service Tests (`ApiService.test.ts`)
Tests the API client layer:

- **File Upload**: uploadFile()
- **Job Creation**: createAnalyzeJob(), createSyntopicalJob()
- **System Status**: getSystemStatus()
- **Error Handling**: Network errors, API errors
- **URL Construction**: Correct endpoints

#### 3. Integration Tests (`Integration.test.tsx`)
Tests complete workflows:

- **Upload → Create → Monitor**: Full job creation flow
- **Syntopical Workflow**: Multiple file upload and analysis
- **Multiple Concurrent Jobs**: Displaying multiple jobs
- **Job Cancellation**: Cancel running jobs
- **Error Handling**: Upload failures, job creation failures
- **UI State Management**: Loading states, uploading indicators

## Test Infrastructure

### Dependencies

**Backend**:
- `pytest>=7.0.0` - Test framework
- `pytest-asyncio>=0.21.0` - Async test support
- `pytest-cov>=7.0.0` - Coverage reporting
- `httpx>=0.25.0` - HTTP client for API testing

**Frontend**:
- `vitest>=2.1.8` - Test framework
- `@testing-library/react>=16.1.0` - React testing utilities
- `@testing-library/jest-dom>=6.6.3` - DOM matchers
- `@testing-library/user-event>=14.5.2` - User interaction simulation
- `jsdom>=25.0.1` - DOM environment
- `@vitest/coverage-v8>=2.1.8` - Coverage reporting

### Continuous Integration

Tests run automatically on:
- Pull requests to main branch
- Push to main branch
- Manual workflow dispatch

## Test Patterns and Best Practices

### Backend

1. **Use Fixtures**: Create reusable test fixtures
```python
@pytest.fixture
def job_manager(storage):
    return JobManager(storage=storage, timeout_seconds=60)
```

2. **Mock External Dependencies**: Use `unittest.mock` for CLI, processes
```python
with patch('asyncio.create_subprocess_exec') as mock_exec:
    mock_process = AsyncMock()
    mock_exec.return_value = mock_process
```

3. **Test Async Code**: Use `@pytest.mark.asyncio`
```python
@pytest.mark.asyncio
async def test_start_job(self, job_manager):
    success = await job_manager.start_job(job_id)
```

### Frontend

1. **Mock API Calls**: Mock ApiService for isolated tests
```typescript
vi.mock('../services/api', () => ({
  ApiService: {
    uploadFile: vi.fn(),
    createAnalyzeJob: vi.fn(),
  },
}));
```

2. **Use Testing Library**: Query by role, label, text
```typescript
const button = screen.getByRole('button', { name: /Analyze Books/i });
await user.click(button);
```

3. **Wait for Async Updates**: Use `waitFor` for async state changes
```typescript
await waitFor(() => {
  expect(screen.getByText(/Uploaded Files/i)).toBeInTheDocument();
});
```

## Coverage Reports

### Viewing Coverage

**Backend**:
```bash
cd admin-api
pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

**Frontend**:
```bash
cd admin-ui
npm test:coverage
# Open coverage/index.html in browser
```

### Coverage Targets

- Backend: >80% (Current: 90%)
- Frontend: >70% (Current: 72%)

## Adding New Tests

### Backend Test

1. Create test file in `admin-api/tests/`
2. Import necessary fixtures and modules
3. Group related tests in classes
4. Use descriptive test names

```python
class TestNewFeature:
    def test_feature_works(self, fixture):
        """Test that feature works as expected."""
        result = feature.do_something()
        assert result == expected
```

### Frontend Test

1. Create test file in `admin-ui/src/test/`
2. Import React Testing Library utilities
3. Mock dependencies
4. Test user interactions

```typescript
describe('NewComponent', () => {
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<NewComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(/* assertion */);
  });
});
```

## Troubleshooting

### Backend

**Issue**: Tests fail with "Event loop is closed"
- This is a known asyncio issue, can be ignored in warnings

**Issue**: Tests fail with import errors
- Run `pip install -e ".[dev]"` to install dev dependencies

### Frontend

**Issue**: Tests timeout
- Increase `waitFor` timeout: `waitFor(() => {...}, { timeout: 5000 })`
- Check that mocks are properly set up

**Issue**: "Invalid URL" errors
- Ensure API base URL is mocked or relative paths are used

## Performance

- Backend tests: ~12 seconds
- Frontend tests: ~2 seconds
- Total: ~14 seconds (well under 5-minute target)

## Future Improvements

- [ ] Add E2E tests with real browser (Playwright)
- [ ] Add load/stress tests for concurrent jobs
- [ ] Add visual regression tests
- [ ] Increase coverage to 95%+
- [ ] Add mutation testing
- [ ] Add performance benchmarks
