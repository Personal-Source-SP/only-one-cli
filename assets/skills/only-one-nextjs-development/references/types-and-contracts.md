# Types & Contracts Reference

## Type and Interface Design Standards

- ✅ **Location & Barrel Exports**:
  - Encapsulate type definitions inside the `types/` folder of the feature and re-export via `types/index.ts`.
  - All supporting subdirectories (`types/`, `enums/`, `components/`, `utils/`) MUST provide an `index.ts` barrel.
  - Consumers import directly from directory barrels: `import type { WashMode, WashModeFormValues } from "./types"`.
  - ❌ **NEVER** declare domain/entity/form `type` or `interface` definitions directly inside `index.tsx`, `components/`, or `hooks/` files (only `type <ComponentName>Props` is allowed directly inside component files).

- 🛑 **Zero Anonymous Inline Types Invariant (Anti-Inline-Object)**:
  - ❌ **NEVER** define nested anonymous object shapes `{}` directly within parent types or interfaces.
  - Every nested property representing a structured object MUST be extracted into a dedicated **Named Type / Interface** inside `types/<name>.type.ts` and re-exported via `types/index.ts`.

  ```typescript
  // ❌ ANTI-PATTERN (DON'T): Anonymous inline object shape
  // File: src/pages/product/types/product.type.ts
  export type ProductDetail = AbstractRecord & {
    name: string;
    pricing: {
      basePrice: number;
      discountPercent?: number;
    };
  };
  ```

  ```typescript
  // ✅ STANDARD MULTI-FILE PATTERN (DO):

  // File: src/pages/product/types/product-pricing.type.ts
  export type ProductPricingConfig = {
    basePrice: number;
    discountPercent?: number;
  };

  // File: src/pages/product/types/product-detail.type.ts
  import type { AbstractRecord } from "@/common";
  import type { ProductPricingConfig } from "./product-pricing.type";

  export type ProductDetail = AbstractRecord & {
    name: string;
    pricing: ProductPricingConfig;
  };

  // File: src/pages/product/types/index.ts
  export * from "./product-pricing.type";
  export * from "./product-detail.type";
  ```

- ✅ **Component Props Typing Convention**:
  - Component Props MUST always be typed using `type <ComponentName>Props = { ... }`. Never use `interface` for component props.

- ✅ **Property Ordering & Formatting Rules**:
  - Declare all **Required properties** first.
  - Declare all **Optional properties (`?`)** after required properties (separated by a blank line).
  - Exception: The optional `id?: string` field in `FormValues` is placed at the very top to identify existing records during edit actions.
  - Within each group (required or optional), sort property lines **from shortest to longest** (character count).
- ✅ **AbstractRecord Extension Pattern for Entity Models**:
  - All **Entity Models** (data structures returned from API queries) MUST extend `AbstractRecord` from `@/common` (which provides base attributes such as `id`, `createdAt`, `updatedAt`):
    ```typescript
    import type { AbstractRecord } from "@/common";

    export type Banner = AbstractRecord & {
    	sortOrder: number;
    	isActive: boolean;

    	title?: string;
    	imageUrl?: string;
    	linkTarget?: string;
    	linkType?: BannerLinkType;
    };
    ```
- ✅ **FormValues Type Pattern for Form & Drawer Inputs**:
  - Dedicated `FormValues` types model the shape of form inputs for `<CustomDrawerForm>` and `<CustomModalForm>`:
    ```typescript
    export type WashModeFormValues = {
    	id?: string;
    	code: WashPackageCode;
    	name: string;
    	isActive: boolean;

    	imageUrl?: string;
    	subtitle?: string;
    	basePrice?: number;
    	isPopular?: boolean;
    	description?: string;
    	estimatedDurationSec?: number;
    	features?: WashModeFeature[];
    };
    ```
- ✅ **Strict TypeScript Typing**:
  - NEVER use `any`. Specify strict type definitions for component props, form values (`FormValues`), mutation payloads, and API response contracts.
- ✅ **Primary Feature Types Breakdown**:
  - **Entity Model**: Type extending `AbstractRecord` representing the API domain record (e.g., `WashMode`, `Banner`).
  - **FormValues**: Type modeling drawer/modal form input state (e.g., `WashModeFormValues`, `BannerFormValues`).
  - **Request Query / Filter Params**: Interface modeling URL and table search filter parameters (e.g., `WashModeFilterParams`).
