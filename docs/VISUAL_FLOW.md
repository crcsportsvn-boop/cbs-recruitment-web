# Sơ Đồ Luồng Xử Lý Tuyển Dụng (CBS Recruitment/End-User Flow)

```mermaid
flowchart TD
    %% Global Styles - Màu sắc hiện đại, nhẹ nhàng
    classDef input fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1,rx:5,ry:5;
    classDef datapool fill:#fffde7,stroke:#fbc02d,stroke-width:2px,color:#f57f17,rx:5,ry:5;
    classDef process fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20,rx:5,ry:5;
    classDef outcome fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,color:#4a148c,rx:5,ry:5;
    classDef stock fill:#eceff1,stroke:#546e7a,stroke-width:2px,stroke-dasharray: 5 5,color:#37474f,rx:5,ry:5;
    classDef action fill:#ffffff,stroke:#333333,stroke-width:1px,stroke-dasharray: 5 5,color:#333;

    %% --- PHÂN VÙNG: NGUỒN ỨNG VIÊN ---
    subgraph S_INPUT [🔍 NGUỒN ĐẦU VÀO]
        direction TB
        Input_Auto([📧 Email Tự Động<br/>(Auto Capture)])
        Input_Manual([✍️ Nhập Tay<br/>(Manual Input)])
    end

    %% --- PHÂN VÙNG: XỬ LÝ DỮ LIỆU ---
    subgraph S_DATAPOOL [📂 KHO DỮ LIỆU TẬP TRUNG]
        direction TB
        DP_Core[("Datapool<br/>---------------<br/>✨ AI Chấm điểm<br/>📝 AI Tóm tắt")]
    end

    %% --- PHÂN VÙNG: QUY TRÌNH TUYỂN DỤNG ---
    subgraph S_PROCESS [🚀 QUY TRÌNH PHỎNG VẤN (KANBAN)]
        direction TB
        P_New(New) --> P_Screen(Test / Screen)
        P_Screen --> P_HR(HR Interview)
        P_HR --> P_M1(Manager L1)
        P_M1 --> P_M2(Manager L2)
        P_M2 --> P_Offer(Offer)
    end

    %% --- PHÂN VÙNG: KẾT QUẢ ---
    subgraph S_OUTCOME [🏆 KẾT QUẢ TUYỂN DỤNG]
        O_Hired{{🎉 HIRED<br/>(Tuyển thành công)}}
        O_Rejected{{❌ REJECTED<br/>(Từ chối/Loại)}}
    end

    %% --- PHÂN VÙNG: QUẢN LÝ JOB & STOCK ---
    subgraph S_STOCK [📦 QUẢN LÝ JOB & STOCK]
        Stock_Pool[("Kho Stock<br/>(Ứng viên Job dừng tuyển)")]
        Action_Stop[⛔ Dừng Tuyển (Stop Job)]
        Action_Rehire[🔄 Tái Tuyển (Rehire)]
    end

    %% --- LIÊN KẾT LUỒNG (FLOW) ---

    %% Input vào Datapool
    Input_Auto --> DP_Core
    Input_Manual --> DP_Core

    %% Datapool xử lý
    DP_Core -->|Duyệt| P_New
    DP_Core -->|Loại ngay| O_Rejected

    %% Quy trình phỏng vấn & Kết quả
    P_Offer -->|Chấp nhận| O_Hired
    P_Offer -->|Từ chối| O_Rejected
    P_Screen -->|Fail| O_Rejected
    P_HR -->|Fail| O_Rejected
    P_M1 -->|Fail| O_Rejected
    P_M2 -->|Fail| O_Rejected

    %% Logic Stock / Dừng tuyển
    Action_Stop -.->|Đóng băng Job| Stock_Pool
    P_New -.->|Nếu Job bị Stop| Stock_Pool
    Stock_Pool -.->|Chọn ứng viên tiềm năng| Action_Rehire
    Action_Rehire -->|Gán vào Job mới| P_New

    %% --- GÁN STYLE ---
    class Input_Auto,Input_Manual input;
    class DP_Core datapool;
    class P_New,P_Screen,P_HR,P_M1,P_M2,P_Offer process;
    class O_Hired,O_Rejected outcome;
    class Stock_Pool,Action_Stop,Action_Rehire stock;
```
