export const dictionary = {
  vi: {
    home: {
      title: "Cổng Thông Tin Tuyển Dụng",
      tabInput: "Phễu Đầu Vào (Input)",
      tabProcess: "Quy Trình Tuyển Dụng",
      tabReport: "Báo Cáo",
      tabConfig: "Cấu Hình",
      adminDash: "Dashboard Quản Trị",
      footer: "© 2026 CBS Vietnam - Recruitment Portal"
    },
    kanban: {
      searchPlaceholder: "Tìm kiếm ứng viên...",
      filterScore: "Lọc theo điểm",
      filterAll: "Tất cả điểm",
      colNew: "Mới (New)",
      colScreening: "TA Duyệt (Screening)",
      colInterview: "Phỏng vấn (Interview)",
      colOffer: "Offer / Hired",
      colRejected: "Tất Cả",
      actionMove: "Chuyển trạng thái",
      actionDetail: "Xem chi tiết",
      actionDecline: "Loại ứng viên (Screen Fail/Reject)",
      modalDeclineTitle: "Xác nhận Loại Ứng Viên",
      labelForReason: "Lý do từ chối / thất bại:",
      btnCancel: "Hủy",
      btnConfirmDecline: "Xác nhận Loại",
      btnSendInvite: "Gửi Invite & Cập Nhật",
      modalInterviewTitle: "Lên Lịch Phỏng Vấn",
    },
    form: {
      pageTitle: "Nhập Liệu Ứng Viên",
      dragDrop: "Kéo thả file vào đây, hoặc click để chọn",
      uploading: "Đang tải lên...",
      success: "Upload thành công!",
      error: "Có lỗi xảy ra, vui lòng thử lại.",
    }
  },
  en: {
    home: {
      title: "Recruitment Portal",
      tabInput: "Candidate Input",
      tabProcess: "Recruitment Process",
      tabReport: "Reports",
      tabConfig: "Settings",
      adminDash: "Admin Dashboard",
      footer: "© 2026 CBS Vietnam - All rights reserved"
    },
    kanban: {
      searchPlaceholder: "Search candidates...",
      filterScore: "Filter by Score",
      filterAll: "All Scores",
      colNew: "New",
      colScreening: "Screening",
      colInterview: "Interview",
      colOffer: "Offer / Hired",
      colRejected: "All", 
      actionMove: "Move Status",
      actionDetail: "View Details",
      actionDecline: "Decline Candidate",
      modalDeclineTitle: "Confirm Candidate Rejection",
      labelForReason: "Reason for rejection / failure:",
      btnCancel: "Cancel",
      btnConfirmDecline: "Confirm Reject",
      btnSendInvite: "Send Invite & Update",
      modalInterviewTitle: "Schedule Interview",
    },
    form: {
      pageTitle: "Candidate Data Entry",
      dragDrop: "Drag & drop files here, or click to select",
      uploading: "Uploading...",
      success: "Upload successful!",
      error: "An error occurred, please try again.",
    }
  }
};

export type LangType = 'vi' | 'en';
