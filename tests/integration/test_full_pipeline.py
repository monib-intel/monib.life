"""
Integration tests for the full reading services pipeline.

These tests verify the end-to-end integration between reading-assistant
and syntopical-reading-assistant services.

Test Scenarios:
1. Three books on same topic → comparison → library → gaps
2. Two related books → comparison
3. Single book → library connection

Note: These tests require the services to be properly initialized and
the dependencies (reading-bot#56 Stage 8 and syntopical#86 Bridge Adapter)
to be implemented.
"""

import subprocess
import sys
from pathlib import Path
from typing import List, Optional

import pytest


class TestFullPipeline:
    """Integration tests for the complete reading services pipeline."""

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.requires_services
    def test_service_availability(
        self, reading_assistant_path: Path, syntopical_assistant_path: Path
    ):
        """Test that both services are available and initialized."""
        # Check if services exist and are non-empty
        if not reading_assistant_path.exists():
            pytest.skip(
                "reading-assistant service not found. "
                "Run: git submodule update --init --recursive"
            )
        if not syntopical_assistant_path.exists():
            pytest.skip(
                "syntopical-reading-assistant service not found. "
                "Run: git submodule update --init --recursive"
            )

        # Check if services have content (not empty directories)
        reading_files = list(reading_assistant_path.iterdir())
        syntopical_files = list(syntopical_assistant_path.iterdir())

        if len(reading_files) == 0:
            pytest.skip(
                "reading-assistant service appears empty. "
                "Submodule may not be initialized. "
                "Run: git submodule update --init --recursive"
            )
        if len(syntopical_files) == 0:
            pytest.skip(
                "syntopical-reading-assistant service appears empty. "
                "Submodule may not be initialized. "
                "Run: git submodule update --init --recursive"
            )

    @pytest.mark.integration
    @pytest.mark.requires_services
    def test_unified_cli_exists(self, unified_cli_path: Path):
        """Test that the unified CLI exists and is executable."""
        assert unified_cli_path.exists(), "Unified CLI not found at cli/unified.py"

        # Try to run help command
        result = subprocess.run(
            [sys.executable, str(unified_cli_path), "--help"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, f"CLI help failed: {result.stderr}"
        assert "reading" in result.stdout.lower()

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) and syntopical#86 (Bridge Adapter) "
        "to be implemented"
    )
    def test_three_books_full_pipeline(
        self, sample_books_dir: Path, temp_output_dir: Path
    ):
        """
        Test Scenario 1: Three books on same topic → comparison → library → gaps.

        This test verifies:
        1. Reading Assistant can process three EPUB files
        2. Syntopical Reader can compare the three analyses
        3. Library connection works with the comparison
        4. Gap analysis identifies missing perspectives

        Prerequisites:
        - Sample EPUB files in fixtures/sample_books/
        - Reading Assistant Stage 8 implemented
        - Syntopical Bridge Adapter implemented
        """
        # Sample books should exist in fixtures
        book1 = sample_books_dir / "book1_design.epub"
        book2 = sample_books_dir / "book2_design.epub"
        book3 = sample_books_dir / "book3_design.epub"

        # Skip if sample books don't exist yet
        if not all([book1.exists(), book2.exists(), book3.exists()]):
            pytest.skip("Sample EPUB files not yet created in fixtures")

        # Step 1: Run full syntopical pipeline
        result = self._run_unified_cli(
            ["analyze-syntopical", str(book1), str(book2), str(book3)]
        )

        assert result.returncode == 0, f"Pipeline failed: {result.stderr}"

        # Step 2: Verify outputs were created
        # Note: Actual output paths will depend on service implementation
        self._verify_pipeline_outputs(result.stdout)

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) and syntopical#86 (Bridge Adapter) "
        "to be implemented"
    )
    def test_two_books_comparison(
        self, sample_books_dir: Path, temp_output_dir: Path
    ):
        """
        Test Scenario 2: Two related books → comparison.

        This test verifies:
        1. Reading Assistant can process two EPUB files
        2. Syntopical Reader can compare two analyses
        3. Comparison identifies agreements and disagreements

        Prerequisites:
        - Sample EPUB files in fixtures/sample_books/
        - Reading Assistant Stage 8 implemented
        - Syntopical Bridge Adapter implemented
        """
        book1 = sample_books_dir / "book1_design.epub"
        book2 = sample_books_dir / "book2_design.epub"

        if not all([book1.exists(), book2.exists()]):
            pytest.skip("Sample EPUB files not yet created in fixtures")

        # Step 1: Analyze both books
        analysis1_result = self._run_unified_cli(["analyze", str(book1)])
        analysis2_result = self._run_unified_cli(["analyze", str(book2)])

        assert analysis1_result.returncode == 0
        assert analysis2_result.returncode == 0

        # Extract output file paths from results
        output1 = self._extract_output_path(analysis1_result.stdout)
        output2 = self._extract_output_path(analysis2_result.stdout)

        # Step 2: Compare the analyses
        compare_result = self._run_unified_cli(["compare", output1, output2])

        assert compare_result.returncode == 0, f"Comparison failed: {compare_result.stderr}"

        # Verify comparison output
        comparison_output = self._extract_output_path(compare_result.stdout)
        assert Path(comparison_output).exists(), "Comparison output file not created"

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) and syntopical#86 (Bridge Adapter) "
        "to be implemented"
    )
    def test_single_book_library_connection(
        self, sample_books_dir: Path, temp_output_dir: Path
    ):
        """
        Test Scenario 3: Single book → library connection.

        This test verifies:
        1. Reading Assistant can process a single EPUB
        2. Analysis can be connected to user's library
        3. Related books are identified

        Prerequisites:
        - Sample EPUB file in fixtures/sample_books/
        - Sample library data in fixtures/
        - Reading Assistant Stage 8 implemented
        """
        book = sample_books_dir / "book1_design.epub"

        if not book.exists():
            pytest.skip("Sample EPUB file not yet created in fixtures")

        # Step 1: Analyze the book
        analysis_result = self._run_unified_cli(["analyze", str(book)])
        assert analysis_result.returncode == 0

        # Extract output path
        analysis_output = self._extract_output_path(analysis_result.stdout)

        # Step 2: Connect to library
        # Note: This assumes the syntopical service can work with a single book
        library_result = self._run_unified_cli(["library-connect", analysis_output])

        assert library_result.returncode == 0, f"Library connection failed: {library_result.stderr}"

    @pytest.mark.integration
    @pytest.mark.requires_services
    def test_bridge_adapter_transformation(
        self, mock_analytical_reading_output: Path, temp_output_dir: Path
    ):
        """
        Test that the bridge adapter correctly transforms Reading Assistant
        output to Syntopical Reader format.

        This test verifies:
        1. Bridge adapter can parse Reading Assistant output
        2. Transformation to Agent 1 format is correct
        3. Required fields are mapped properly

        Prerequisites:
        - Bridge Adapter (syntopical#86) implemented
        - Mock analytical reading output available
        """
        pytest.skip("Requires syntopical#86 (Bridge Adapter) to be implemented")

    @pytest.mark.integration
    @pytest.mark.requires_services
    def test_cli_error_handling(self, unified_cli_path: Path):
        """Test that the CLI handles errors gracefully."""
        # Test with non-existent file
        result = subprocess.run(
            [sys.executable, str(unified_cli_path), "analyze", "nonexistent.epub"],
            capture_output=True,
            text=True,
        )

        # Should fail with helpful error message
        assert result.returncode != 0
        # Check both stdout and stderr for error messages
        output = (result.stdout + result.stderr).lower()
        assert "not found" in output or "error" in output

    # Helper methods

    def _run_unified_cli(self, args: List[str]) -> subprocess.CompletedProcess:
        """Run the unified CLI with the given arguments."""
        cli_path = Path(__file__).parent.parent.parent / "cli" / "unified.py"
        cmd = [sys.executable, str(cli_path)] + args
        return subprocess.run(cmd, capture_output=True, text=True)

    def _extract_output_path(self, stdout: str) -> str:
        """Extract the output file path from CLI stdout."""
        # Parse the output to find the generated file path
        # This will depend on the actual CLI output format
        for line in stdout.split("\n"):
            if line.strip().endswith(".md"):
                return line.strip()
        return ""

    def _verify_pipeline_outputs(self, stdout: str):
        """Verify that all expected pipeline outputs were created."""
        # Check for key indicators in the output
        assert "complete" in stdout.lower() or "success" in stdout.lower()


class TestServiceIntegration:
    """Tests for service-to-service integration without CLI."""

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) to be implemented"
    )
    def test_reading_assistant_output_format(self, sample_books_dir: Path):
        """
        Test that Reading Assistant output matches expected format for
        Syntopical Reader consumption.

        Verifies:
        1. Output includes required sections
        2. Metadata is properly formatted
        3. Structure matches expected schema
        """
        pass

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires syntopical#86 (Bridge Adapter) to be implemented"
    )
    def test_syntopical_input_validation(self, mock_analytical_reading_output: Path):
        """
        Test that Syntopical Reader properly validates input from Reading Assistant.

        Verifies:
        1. Input validation works correctly
        2. Missing required fields are detected
        3. Helpful error messages are provided
        """
        pass


class TestDataFlow:
    """Tests for data flow between services."""

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(reason="Requires both services and bridge adapter to be implemented")
    def test_analytical_to_syntopical_flow(
        self, mock_analytical_reading_output: Path
    ):
        """
        Test the data flow from Reading Assistant to Syntopical Reader.

        Verifies:
        1. Data is correctly passed between services
        2. No data loss in transformation
        3. Format conversion is bidirectional (if needed)
        """
        pass

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(reason="Requires services to be implemented")
    def test_multiple_books_aggregation(self, sample_books_dir: Path):
        """
        Test that multiple book analyses are correctly aggregated.

        Verifies:
        1. Multiple analyses can be combined
        2. Comparison logic handles varying numbers of books
        3. Results are properly merged
        """
        pass


class TestBatchProcessing:
    """Tests for batch/parallel processing functionality."""

    @pytest.mark.integration
    def test_batch_analyze_command_exists(self, unified_cli_path: Path):
        """Test that batch-analyze command is available."""
        result = subprocess.run(
            [sys.executable, str(unified_cli_path), "batch-analyze", "--help"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, f"batch-analyze help failed: {result.stderr}"
        assert "workers" in result.stdout.lower()
        assert "progress" in result.stdout.lower()

    @pytest.mark.integration
    def test_batch_pipeline_command_exists(self, unified_cli_path: Path):
        """Test that batch-pipeline command is available."""
        result = subprocess.run(
            [sys.executable, str(unified_cli_path), "batch-pipeline", "--help"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, f"batch-pipeline help failed: {result.stderr}"
        assert "workers" in result.stdout.lower()
        assert "synthesize" in result.stdout.lower()
        assert "progress" in result.stdout.lower()

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) to be implemented"
    )
    def test_batch_analyze_parallel_processing(
        self, sample_books_dir: Path, temp_output_dir: Path
    ):
        """
        Test that batch-analyze processes multiple books in parallel.

        Verifies:
        1. Multiple books are processed
        2. Parallel processing works correctly
        3. Results are collected for all books
        4. Failed books don't stop the batch
        """
        book1 = sample_books_dir / "book1_design.epub"
        book2 = sample_books_dir / "book2_design.epub"
        book3 = sample_books_dir / "book3_design.epub"

        if not all([book1.exists(), book2.exists(), book3.exists()]):
            pytest.skip("Sample EPUB files not yet created in fixtures")

        # Run batch analysis
        result = self._run_unified_cli(
            ["batch-analyze", str(book1), str(book2), str(book3), "--workers", "2", "--progress"]
        )

        # Should complete successfully
        assert result.returncode == 0, f"Batch analysis failed: {result.stderr}"

        # Check output for progress indicators
        output = result.stdout.lower()
        assert "batch" in output
        assert "complete" in output or "success" in output

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) and syntopical#86 (Bridge Adapter) "
        "to be implemented"
    )
    def test_batch_pipeline_with_synthesis(
        self, sample_books_dir: Path, temp_output_dir: Path
    ):
        """
        Test that batch-pipeline processes books and runs synthesis.

        Verifies:
        1. Books are analyzed in parallel
        2. Synthesis runs after analysis (if --synthesize flag is used)
        3. Final comparison output is generated
        """
        book1 = sample_books_dir / "book1_design.epub"
        book2 = sample_books_dir / "book2_design.epub"

        if not all([book1.exists(), book2.exists()]):
            pytest.skip("Sample EPUB files not yet created in fixtures")

        # Run batch pipeline with synthesis
        result = self._run_unified_cli(
            [
                "batch-pipeline",
                str(book1),
                str(book2),
                "--workers",
                "2",
                "--synthesize",
                "--progress",
            ]
        )

        assert result.returncode == 0, f"Batch pipeline failed: {result.stderr}"

        # Check for synthesis steps in output
        output = result.stdout.lower()
        assert "synthesis" in output or "comparison" in output

    @pytest.mark.integration
    @pytest.mark.requires_services
    @pytest.mark.skip(
        reason="Requires reading-bot#56 (Stage 8) to be implemented"
    )
    def test_batch_graceful_error_handling(
        self, sample_books_dir: Path, temp_output_dir: Path
    ):
        """
        Test that batch processing continues when individual books fail.

        Verifies:
        1. Failed books are reported
        2. Processing continues with remaining books
        3. Summary shows successful vs failed counts
        """
        book1 = sample_books_dir / "book1_design.epub"
        book2 = "nonexistent_book.epub"  # This should fail
        book3 = sample_books_dir / "book3_design.epub"

        if not book1.exists() or not book3.exists():
            pytest.skip("Sample EPUB files not yet created in fixtures")

        # Run batch analysis with one invalid file
        result = self._run_unified_cli(
            ["batch-analyze", str(book1), book2, str(book3), "--workers", "2", "--progress"]
        )

        # Check output for error handling
        output = result.stdout + result.stderr
        assert "failed" in output.lower() or "error" in output.lower()

    @pytest.mark.integration
    def test_batch_worker_count_validation(self, unified_cli_path: Path):
        """Test that worker count parameter is properly validated."""
        # Valid worker count
        result = subprocess.run(
            [
                sys.executable,
                str(unified_cli_path),
                "batch-analyze",
                "test.epub",
                "--workers",
                "3",
            ],
            capture_output=True,
            text=True,
        )
        # Will fail due to missing service, but should accept the worker count
        # (error should be about service, not about worker count)
        assert "workers" not in result.stderr.lower() or "worker" not in result.stderr.lower()

    # Helper methods

    def _run_unified_cli(self, args: List[str]) -> subprocess.CompletedProcess:
        """Run the unified CLI with the given arguments."""
        cli_path = Path(__file__).parent.parent.parent / "cli" / "unified.py"
        cmd = [sys.executable, str(cli_path)] + args
        return subprocess.run(cmd, capture_output=True, text=True)
