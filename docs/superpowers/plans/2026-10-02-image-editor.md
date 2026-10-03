# Clinical Image Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent, non-destructive editor for every image attachment with crop, rotation, annotations, undo/redo, reset, and edited download while preserving the original file.

**Architecture:** Store normalized edit metadata on `Attachment`, render it over the unchanged source with a focused canvas/SVG component, and export a flattened copy only on demand. Keep the editing state local until the user saves, then persist through the existing patient/cloud synchronization.

**Tech Stack:** React 18, TypeScript, SVG pointer interactions, browser Canvas API, Zustand, existing IndexedDB/Supabase file storage.

**Spec:** `docs/superpowers/specs/2026-10-02-image-editor-design.md`

## Global Constraints

- Never overwrite or recompress the stored original attachment.
- Apply editing only to MIME types beginning with `image/`; PDFs remain view-only.
- Store annotation and crop coordinates normalized from 0 to 1.
- Existing attachments without edit metadata must remain valid without migration.
- Save patient data only after **Salvar edições**; cancel discards the draft.
- Restore removes only image-edit metadata and preserves all attachment metadata and the original blob.
- Add no new production dependency.

## Review Focus

- Pointer coordinates after rotation/crop must map to the same clinical point when the editor is reopened.
- Empty or nearly-zero crop rectangles must be rejected without changing the saved image.
- Switching/closing with unsaved changes must confirm before discarding the draft.
- SVG/GIF exports must create a static PNG/JPEG copy without changing the original MIME or blob.
- Old attachments and PDFs must open exactly as before when `imageEdits` is absent.

---

### Task 1: Edit metadata and pure command core

**Files:**
- Create: `prontuario/src/lib/imageEdits.ts`
- Modify: `prontuario/src/lib/types.ts`
- Modify: `prontuario/scripts/verify.mjs`

**Interfaces:**
- Produces: `ImageEdits`, `ImageAnnotation`, `ImageEditorCommand`, `emptyImageEdits()`, `normalizeImageEdits(edits)`, `applyImageCommand(edits, command)`, and `hasImageEdits(edits)`.
- Consumes: only TypeScript primitives and existing `ID`.

- [ ] **Step 1: Write failing core tests**

Add literal assertions to `verify.mjs` covering: rotation wraps to `0`, crop clamps to `[0,1]`, tiny crop is ignored, empty text is ignored, freehand/arrow/ellipse/rectangle/text annotations are created and removed by id, undo inputs remain immutable, and reset returns no edits. Include an old attachment fixture without `imageEdits`.

```js
const base = emptyImageEdits();
assert.equal(applyImageCommand(base, { type: "rotate", degrees: 450 }).rotation, 90);
assert.deepEqual(applyImageCommand(base, { type: "crop", crop: { x: -.2, y: .1, width: 1.4, height: .8 } }).crop, { x: 0, y: .1, width: 1, height: .8 });
assert.equal(hasImageEdits(applyImageCommand(base, { type: "reset" })), false);
```

- [ ] **Step 2: Run the suite and verify RED**

Run: `cd prontuario && npm test`

Expected: FAIL because the image-edit types/functions do not exist.

- [ ] **Step 3: Add the data types**

Extend `Attachment` with `imageEdits?: ImageEdits`. Define normalized points, crop, annotation unions, visual settings, and `updatedAt`. Annotation kinds are exactly `freehand | arrow | ellipse | rectangle | text`.

- [ ] **Step 4: Implement pure commands**

Implement immutable normalization and commands in `imageEdits.ts`. Rotation is normalized to `0 | 90 | 180 | 270`; crops below `0.01` on either dimension are removed; blank text commands do not append an annotation; reset returns `emptyImageEdits()`.

- [ ] **Step 5: Run tests and commit**

Run: `cd prontuario && npm test`

Expected: all groups pass, including the new image-edit group.

```bash
git add prontuario/src/lib/types.ts prontuario/src/lib/imageEdits.ts prontuario/scripts/verify.mjs
git commit -m "Add non-destructive image edit model"
```

### Task 2: Shared rendered image and editor interactions

**Files:**
- Create: `prontuario/src/components/image-editor/ImageCanvas.tsx`
- Create: `prontuario/src/components/image-editor/ImageEditor.tsx`
- Modify: `prontuario/src/pages/patient/ImagesTab.tsx`
- Modify: `prontuario/scripts/verify.mjs`

**Interfaces:**
- Consumes: `ImageEdits`, `ImageAnnotation`, `applyImageCommand`, image URL, natural width/height.
- Produces: `<ImageCanvas src edits mode tool onDraftAnnotation />` and `<ImageEditor attachment src onSave onCancel />`.

- [ ] **Step 1: Write failing interaction-state tests**

Test pure exported helpers from `ImageEditor.tsx` or `imageEdits.ts`: viewport-to-normalized point conversion with letterboxing, rotated point conversion for 0/90/180/270, annotation draft finalization, and history transition `{past,present,future}` for undo/redo.

```js
assert.deepEqual(toNormalizedPoint({ x: 150, y: 100 }, { left: 50, top: 0, width: 200, height: 200 }), { x: .5, y: .5 });
assert.deepEqual(rotateNormalizedPoint({ x: .2, y: .7 }, 90), { x: .3, y: .2 });
```

- [ ] **Step 2: Run tests and verify RED**

Run: `cd prontuario && npm test`

Expected: FAIL because coordinate/history helpers do not exist.

- [ ] **Step 3: Build `ImageCanvas`**

Render the cropped/rotated source inside a measured container and an aligned SVG overlay. Render freehand polylines, arrows with marker end, ellipses, rectangles, and text. In view mode, use `pointer-events: none` for annotations. In edit mode, emit normalized pointer points and selected annotation ids.

- [ ] **Step 4: Build `ImageEditor`**

Add toolbar controls for crop, pen, arrow, circle, rectangle, text, color, and stroke width. Add rotate, select/delete, undo, redo, reset, save, and cancel. Keep `{past,present,future}` locally and call `onSave(present)` only from **Salvar edições**. Confirm cancellation if `present` differs from the initial edits.

- [ ] **Step 5: Connect the editor from `Viewer`**

Add **Editar imagem** for image MIME types only. On save, update only the matching attachment with normalized edits and `updatedAt`; preserve id/name/category/MIME/size/date/tooth/note. Apply saved rotation/crop/filters/annotations in normal view.

- [ ] **Step 6: Run tests/build and commit**

Run: `cd prontuario && npm test && npm run build`

Expected: all tests and TypeScript build pass.

```bash
git add prontuario/src/components/image-editor prontuario/src/pages/patient/ImagesTab.tsx prontuario/scripts/verify.mjs
git commit -m "Add clinical image editing interface"
```

### Task 3: Non-destructive crop and flattened export

**Files:**
- Create: `prontuario/src/lib/imageExport.ts`
- Modify: `prontuario/src/pages/patient/ImagesTab.tsx`
- Modify: `prontuario/scripts/verify.mjs`

**Interfaces:**
- Consumes: `Blob`, `ImageEdits`.
- Produces: `editedImageDimensions(width, height, edits)` and `exportEditedImage(blob, edits): Promise<Blob>`.

- [ ] **Step 1: Write failing export-geometry tests**

Test literal dimensions for no crop, normalized crop, 90/270 rotation, clamped crop, and one-pixel minimum output. Test that annotation geometry is mapped into the cropped output coordinate system.

```js
assert.deepEqual(editedImageDimensions(1200, 800, { rotation: 90, crop: { x: .25, y: .25, width: .5, height: .5 } }), { width: 400, height: 600 });
```

- [ ] **Step 2: Run tests and verify RED**

Run: `cd prontuario && npm test`

Expected: FAIL because export geometry is missing.

- [ ] **Step 3: Implement Canvas export**

Load the original blob into an `ImageBitmap` or `HTMLImageElement`, compute the cropped/rotated output canvas, apply brightness/contrast/invert, draw the original once, then draw every annotation in order. Export PNG for SVG/GIF/transparency and JPEG at quality `0.94` otherwise. Revoke temporary URLs in `finally`.

- [ ] **Step 4: Split the download action**

Replace the single download button with a small menu containing **Baixar original** and, when edits exist, **Baixar versão editada**. Export failure shows `toast.error` and leaves the viewer/state untouched.

- [ ] **Step 5: Run tests/build and commit**

Run: `cd prontuario && npm test && npm run build && git diff --check`

Expected: zero failures and clean diff check.

```bash
git add prontuario/src/lib/imageExport.ts prontuario/src/pages/patient/ImagesTab.tsx prontuario/scripts/verify.mjs
git commit -m "Export edited clinical images safely"
```

### Task 4: Restore, help text, compatibility, and production verification

**Files:**
- Modify: `prontuario/src/pages/patient/ImagesTab.tsx`
- Modify: `prontuario/src/components/HelpCenter.tsx`
- Modify: `prontuario/scripts/verify.mjs`

**Interfaces:**
- Consumes: editor/export interfaces from Tasks 1–3.
- Produces: completed user flow and release evidence.

- [ ] **Step 1: Write failing preservation tests**

Create an attachment fixture with every metadata field and `imageEdits`. Assert that saving changes only `imageEdits`; restoring removes only `imageEdits`; PDF fixtures never report editor availability.

- [ ] **Step 2: Run tests and verify RED**

Run: `cd prontuario && npm test`

Expected: FAIL until preservation/availability helpers are present.

- [ ] **Step 3: Add restore and guidance**

Add **Restaurar original** behind a confirmation dialog. Update Images help with the exact editing, saving, download, and original-preservation flow. Add concise labels/tooltips suitable for an older user.

- [ ] **Step 4: Run complete verification**

Run: `cd prontuario && npm test && npm run build && git diff --check`

Expected: complete suite passes, import/original-protection checks pass, TypeScript/Vite build passes, diff is clean.

- [ ] **Step 5: Commit, push, and validate production**

```bash
git add prontuario/src/pages/patient/ImagesTab.tsx prontuario/src/components/HelpCenter.tsx prontuario/scripts/verify.mjs
git commit -m "Finish safe image editing workflow"
git push origin claude/gracious-thompson-ipp6zk
```

Wait for `Vercel – mizaelprontuario` success. In demonstration mode: open an image, add each annotation type, crop, rotate, save, close/reopen, compare the saved result, download original and edited versions, restore, and confirm the original reappears. Exit demonstration without touching real records.
