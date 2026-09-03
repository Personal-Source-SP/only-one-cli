---
status: done
slug: consolidate-skills-lock-into-installed-json
started_at: 2026-09-03
completed_at: 2026-09-03
pr_url: ~
branch: ~
---

# Plan: Hợp nhất skills-lock.json vào installed.json (Unified Asset Lockfile)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

### 1.1. Hiện trạng Codebase
- **Sự phân mảnh Lockfile**:
  - Tại [src/core/assets/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/lockfile.ts), hệ thống duy trì `only-one/installed.json` để quản lý phiên bản toàn bộ assets (`workflows`, `rules`, `skills`, `mcps`, `packages`, `combos`, `git`).
  - Tại [src/core/skill/remote/lockfile.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/skill/remote/lockfile.ts), hệ thống duy trì thêm file thứ hai `only-one/skills-lock.json` chuyên biệt cho các remote GitHub skills để lưu `source`, `branch`, `skillPath`, `computedHash`.
- **Cấu trúc `InstalledAssetRecord` hiện tại ([src/core/assets/types.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/src/core/assets/types.ts))**:
  ```ts
  export interface InstalledAssetRecord {
      version: string;
      installedAt: string;
  }
  ```
  Cấu trúc này chưa hỗ trợ lưu trữ metadata nguồn remote cho skills tải từ GitHub, dẫn đến việc phải duy trì file `skills-lock.json` riêng lẻ.

### 1.2. Invariants (Các Hành vi Bắt buộc Phải Giữ Nguyên)
1. **Zero Breaking Changes cho Callers**: Các API công khai `readSkillsLockfile`, `saveSkillToLockfile`, `removeSkillFromLockfile` giữ nguyên chữ ký (signature) để các module như `src/commands/skill/command.ts` và `src/core/skill/remote/inspector.ts` hoạt động bình thường mà không cần sửa đổi.
2. **Single Source of Truth**: Sau khi hoàn thành, mọi hoạt động cài đặt remote skills chỉ sinh ra và cập nhật file `only-one/installed.json`. File `skills-lock.json` không còn được tạo mới.
3. **Transparent Fallback**: Nếu một dự án cũ có `skills-lock.json` và chưa kịp chuyển đổi, hàm `readSkillsLockfile` vẫn đọc được thông tin cũ nếu `installed.json` chưa chứa remote metadata.

---

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)

### 2.1. Schema Hợp nhất trong `src/core/assets/types.ts`
```ts
export interface RemoteSkillLockMeta {
    source: string;
    sourceType: 'github';
    branch?: string;
    skillPath: string;
    computedHash: string;
    updatedAt?: string;
}

export interface InstalledAssetRecord {
    version: string;
    installedAt: string;
    remote?: RemoteSkillLockMeta;
}
```

### 2.2. Cơ chế Hoạt động của `src/core/skill/remote/lockfile.ts`
- **`saveSkillToLockfile(projectDir, skillName, meta)`**:
  - Đọc `installed.json` bằng `readInstalledLockfile(projectDir)`.
  - Khởi tạo hoặc cập nhật `installed.skills[skillName]`:
    - `version`: Giữ nguyên version hiện tại hoặc fallback `'0.0.1'`.
    - `installedAt`: Giữ nguyên hoặc lấy thời điểm hiện tại.
    - `remote`: Lưu đầy đủ `{ source, sourceType, branch, skillPath, computedHash, updatedAt }`.
  - Ghi atomic lại vào `only-one/installed.json`.
- **`readSkillsLockfile(projectDir)`**:
  - Đọc `installed.json`. Quét toàn bộ `installed.skills` có trường `remote`.
  - Trả về cấu trúc `SkillsLockfile` tương thích ngược:
    ```ts
    {
      version: 1,
      skills: {
        [skillName]: {
          name: skillName,
          ...record.remote,
          installedAt: record.installedAt,
        }
      }
    }
    ```
- **`removeSkillFromLockfile(projectDir, skillName)`**:
  - Gọi `removeInstalledAsset(projectDir, 'skills', skillName)`.

---

## Section 3. Implementation Architecture & Machine-Readable Task Matrix

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/core/assets/types.ts` | `RemoteSkillLockMeta`, `InstalledAssetRecord` | None | `None` | `npx vitest run test/core/assets/lockfile.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `src/core/skill/remote/lockfile.ts` | `saveSkillToLockfile`, `readSkillsLockfile`, `removeSkillFromLockfile` | `src/core/assets/lockfile.ts` | `Order 1` | `npx vitest run test/core/skill-lockfile.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `test/core/skill-lockfile.test.ts` | Unit tests asserting `only-one/installed.json` integration | None | `Order 2` | `npx vitest run test/core/skill-lockfile.test.ts` |

---

## Section 4. Implementation Code Examples (Mẫu Code Triển khai)

### Order 1: [MODIFY] `src/core/assets/types.ts`
- **Purpose**: Thêm kiểu `RemoteSkillLockMeta` và mở rộng `InstalledAssetRecord`.
- **Depends on**: None

```ts
// [TARGET SEAM] src/core/assets/types.ts
export interface RemoteSkillLockMeta {
    source: string;
    sourceType: 'github';
    branch?: string;
    skillPath: string;
    computedHash: string;
    updatedAt?: string;
}

export interface InstalledAssetRecord {
    version: string;
    installedAt: string;
    remote?: RemoteSkillLockMeta;
}
```

---

### Order 2: [MODIFY] `src/core/skill/remote/lockfile.ts`
- **Purpose**: Đọc và ghi remote skill meta trực tiếp vào `only-one/installed.json`.
- **Depends on**: Order 1

```ts
// [TARGET SEAM] src/core/skill/remote/lockfile.ts
import { readInstalledLockfile, resolveInstalledLockfilePath, removeInstalledAsset } from '@/core/assets/lockfile.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function saveSkillToLockfile(projectDir: string, skillName: string, meta: RemoteSkillMeta): Promise<void> {
    const lock = await readInstalledLockfile(projectDir);
    const now = new Date().toISOString();
    const existing = lock.installed.skills?.[skillName];

    if (!lock.installed.skills) {
        lock.installed.skills = {};
    }

    lock.installed.skills[skillName] = {
        version: existing?.version || '0.0.1',
        installedAt: existing?.installedAt || now,
        remote: {
            source: meta.source,
            sourceType: meta.sourceType,
            branch: meta.branch,
            skillPath: meta.skillPath,
            computedHash: meta.computedHash,
            updatedAt: meta.updatedAt || now,
        },
    };
    lock.updatedAt = now;

    const lockPath = resolveInstalledLockfilePath(projectDir);
    await mkdir(dirname(lockPath), { recursive: true });
    await writeFile(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
}
```

---

## Section 5. Test Cases (Kịch bản Kiểm thử & Nghiệm thu)

### Test Case 1: Unified Lockfile Save
- **Objective**: Xác nhận khi lưu remote skill, dữ liệu được ghi vào `only-one/installed.json` và chứa trường `remote`.
- **Target File**: `test/core/skill-lockfile.test.ts`
- **Gherkin Scenario**:
  ```gherkin
  Scenario: Saving remote skill writes to unified installed.json
    Given a project directory
    When saveSkillToLockfile is called for "test-skill" with GitHub metadata
    Then "only-one/installed.json" is created
    And the skill entry contains the "remote.computedHash"
    And "only-one/skills-lock.json" does not exist
  ```

### Test Case 2: Unified Lockfile Read Compatibility
- **Objective**: Đảm bảo `readSkillsLockfile` trả về đúng định dạng `SkillsLockfile` chuẩn cho các caller hiện hữu.
- **Target File**: `test/core/skill-lockfile.test.ts`
- **Gherkin Scenario**:
  ```gherkin
  Scenario: Reading remote skills from unified installed.json
    Given "only-one/installed.json" containing a skill with remote metadata
    When readSkillsLockfile is called
    Then it returns the skill with name, source, and computedHash
  ```

---

## Section 6. Technical English Key Patterns

### 1. Unified Schema Consolidation
- **Meaning (VI)**: Quá trình quy chuẩn hóa và hợp nhất các lược đồ dữ liệu phân mảnh vào một lược đồ duy nhất.
- **Grammar / Usage**: `Noun phrase`.
- **Engineering Example**: *"Unified schema consolidation avoids data drift by keeping version history and remote provenance within the same record."*

### 2. Backward-Compatible Adapter Layer
- **Meaning (VI)**: Tầng chuyển đổi tương thích ngược giúp giữ nguyên API hiện tại cho các callers mà không phải sửa đổi mã nguồn ở nhiều nơi.
- **Grammar / Usage**: `Adjective + Noun phrase`.
- **Engineering Example**: *"The lockfile functions serve as a backward-compatible adapter layer, abstracting the underlying single lockfile format."*
