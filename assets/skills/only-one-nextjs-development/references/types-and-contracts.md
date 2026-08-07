# Types & Contracts Reference

## Quy chuẩn Định nghĩa Type & Interface

- ✅ **Vị trí & Barrel Export**:
  - Nằm trong thư mục `types/` của feature và re-export qua `types/index.ts`.
  - Tất cả các folder `types/`, `enums/`, `components/`, `utils/` BẮT BUỘC có `index.ts` re-export.
  - Nơi khác import ngắn gọn từ folder: `import type { WashMode } from "./types"`.
- ✅ **Quy tắc Sắp xếp thuộc tính (Property Ordering)**:
  - **Required properties** khai báo trước.
  - **Optional properties (`?`)** khai báo sau.
  - Trong cùng một nhóm (cùng required hoặc cùng optional), các thuộc tính được **sắp xếp theo độ dài dòng từ ngắn đến dài** (tính theo số ký tự trên dòng).
- ✅ **AbstractRecord Extension Pattern**:
  - Tất cả **Entity Model** (dữ liệu trả về từ API) BẮT BUỘC kế thừa `AbstractRecord` từ `@/common` (đã bao gồm các thuộc tính dùng chung như `id`, `createdAt`, `updatedAt`,...):
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
- ✅ **Nghiêm ngặt TypeScript**:
  - Tuyệt đối KHÔNG sử dụng kiểu dữ liệu `any`. Định nghĩa kiểu dữ liệu chặt chẽ cho props, form values (`FormValues`), payloads và API responses.
- ✅ **Các Type chính của một Feature**:
  - **Entity Model**: Type kế thừa `AbstractRecord` đại diện cho dữ liệu trả về từ API (ví dụ: `WashMode`, `Banner`).
  - **FormValues**: Type/Interface đại diện cho dữ liệu form nhập liệu (ví dụ: `WashModeFormValues`, `BannerFormValues`).
  - **Request Query / Filter Params**: Interface bộ lọc tìm kiếm.

