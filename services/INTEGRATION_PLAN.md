# Integration Plan: Reading Assistant + Syntopical Reader

## Assessment: Reuse Existing Code ✅

**Syntopical agents 2-4 are already implemented:**
- ✅ Agent 2 (Comparator) - `comparator.py` with full implementation
- ✅ Agent 3 (Connector) - `connector.py` with library scanning
- ✅ Agent 4 (Gap Finder) - `gap_finder.py` with gap analysis

**Agent 1 (Extractor) exists but will be replaced by Reading Assistant**

## Implementation Strategy

### Phase 1: Enhance Reading Assistant
**Add Stage 8 to make output syntopical-compatible**

### Phase 2: Create Bridge Adapter
**Transform Reading Assistant output → Agent 1 format**

### Phase 3: Integration Testing
**Test the full pipeline with real books**

---

## Issues to File

### Reading Assistant Issues

#### Issue 1: Add Stage 8 - Scope Boundaries
**Priority:** High
**Component:** Reading Assistant - Extractor

**Description:**
Add Stage 8 to extract scope boundaries from books to enable syntopical comparison.

**Requirements:**
- Create `prompts/stage8_scope_boundaries.md`
- Add `_extract_scope_boundaries()` method to `extractor.py`
- Update `InspectionalReading` model to include `scope_boundaries` field
- Add field to output generator

**Scope boundaries should extract:**
- Domain/field addressed
- Timeframe considered
- Intended audience
- Explicit exclusions or limitations

**Files to modify:**
- `prompts/stage8_scope_boundaries.md` (new)
- `src/epub_to_obsidian/extractor.py`
- `src/epub_to_obsidian/models.py`
- `src/epub_to_obsidian/generator.py`

---

#### Issue 2: Add Argument Architecture to Structure Stage
**Priority:** Medium
**Component:** Reading Assistant - Stage 3

**Description:**
Enhance Stage 3 (Structure) to extract argument architecture:
- How author builds toward thesis
- Logical dependencies between parts
- Methods or approaches used
- Evidence types relied upon

This makes the structure output more compatible with syntopical comparison.

**Files to modify:**
- `prompts/stage3_structure.md`
- `src/epub_to_obsidian/models.py` (add fields to StructureSection)

---

#### Issue 3: Rename "Inspectional Reading" to "Analytical Reading"
**Priority:** Low (cosmetic)
**Component:** Reading Assistant - All

**Description:**
The service actually performs Analytical Reading (stages 1-3 are Inspectional, 4-8 are Analytical).

Update:
- Model names: `InspectionalReading` → `AnalyticalReading`
- Output filenames: `*_InspectionalReading.md` → `*_AnalyticalReading.md`
- Documentation references

**Files to modify:**
- `src/epub_to_obsidian/models.py`
- `src/epub_to_obsidian/extractor.py`
- `src/epub_to_obsidian/generator.py`
- `README.md`

---

### Syntopical Reader Issues

#### Issue 4: Create Bridge Adapter
**Priority:** High
**Component:** Syntopical Reader - New Component

**Description:**
Create an adapter to transform Reading Assistant outputs into Agent 1 (Structural Extractor) format.

**Mapping:**
```
Reading Assistant → Agent 1 Format

Classification & Thesis → Central Question + Diagnosis + Thesis
Key Terms → Key Terms table
Structure → Argument Architecture
Scope Boundaries (Stage 8) → Scope Boundaries
Problems & Solutions → Dependencies & Assumptions (partial)
```

**Implementation:**
```python
# services/syntopical-reading-assistant/adapter/reading_assistant_adapter.py

class ReadingAssistantAdapter:
    def transform(self, reading_assistant_output: Path) -> str:
        """Transform Reading Assistant markdown to Agent 1 structure format."""
        pass
```

**Files to create:**
- `adapter/reading_assistant_adapter.py`
- `adapter/tests/test_adapter.py`
- `adapter/README.md`

---

#### Issue 5: Update Agent 2 to Accept Reading Assistant Format
**Priority:** High
**Component:** Syntopical Reader - Agent 2

**Description:**
Modify Agent 2 (Comparator) to either:
1. Accept Reading Assistant format directly (preferred), OR
2. Accept outputs from the bridge adapter

Update prompt and code to handle the richer analytical data from Reading Assistant.

**Files to modify:**
- `agents/agent2_comparator/comparator.py`
- `agents/agent2_comparator/prompt.md`
- `agents/agent2_comparator/tests/`

---

#### Issue 6: Remove Agent 1 Dependency
**Priority:** Medium
**Component:** Syntopical Reader - Agent 1

**Description:**
Since Reading Assistant replaces Agent 1:
- Mark Agent 1 as deprecated
- Update documentation to show Reading Assistant as the entry point
- Keep Agent 1 for backward compatibility or legacy use

**Files to modify:**
- `agents/agent1_extractor/README.md` (add deprecation notice)
- `AGENTS.md` (update architecture diagram)
- `README.md` (update workflows)

---

#### Issue 7: Create Unified CLI
**Priority:** Medium
**Component:** Integration - New Component

**Description:**
Create a unified command-line interface that orchestrates both services.

**Commands:**
```bash
# Full pipeline
reading analyze-syntopical book1.epub book2.epub book3.epub

# Stages explicitly
reading analyze book1.epub  # Reading Assistant (8 stages)
reading compare output1.md output2.md output3.md  # Syntopical (stages 1-3)
reading library-connect comparison.md
reading find-gaps comparison.md
```

**Files to create:**
- `cli/unified.py`
- `cli/README.md`

---

#### Issue 8: Integration Testing
**Priority:** High
**Component:** Testing

**Description:**
Create end-to-end integration tests for the full pipeline.

**Test scenarios:**
1. Three books on same topic → comparison → library → gaps
2. Two related books → comparison
3. Single book → library connection

**Files to create:**
- `tests/integration/test_full_pipeline.py`
- `tests/fixtures/sample_books/` (test data)

---

## Implementation Order

1. **Issue 1** - Add Stage 8 to Reading Assistant ⭐ START HERE
2. **Issue 4** - Create Bridge Adapter
3. **Issue 5** - Update Agent 2 to accept new format
4. **Issue 8** - Integration testing
5. **Issue 7** - Unified CLI
6. **Issue 2** - Enhance Structure stage (optional improvement)
7. **Issue 6** - Deprecate Agent 1 (cleanup)
8. **Issue 3** - Rename to Analytical (cosmetic)

---

## Code Reuse Summary

### ✅ Reuse (Already Implemented)
- Agent 2 (Comparator) - Full implementation
- Agent 3 (Connector) - Full implementation
- Agent 4 (Gap Finder) - Full implementation
- Prompt templates for agents 2-4
- Output templates for agents 2-4
- Testing infrastructure

### 🆕 New Code Needed
- Stage 8 in Reading Assistant (~100 lines)
- Bridge Adapter (~200 lines)
- Integration tests (~300 lines)
- Unified CLI (optional, ~150 lines)

### 📝 Modifications Needed
- Agent 2 comparator to handle Reading Assistant format
- Documentation updates

**Total new code estimate:** ~750 lines
**Existing code reused:** ~2000+ lines

## Decision: REUSE ✅

The syntopical infrastructure is solid. We just need:
1. One new stage in reading-assistant
2. A small adapter layer
3. Minor updates to agent 2

This is far better than rebuilding from scratch.
