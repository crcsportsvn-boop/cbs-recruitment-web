export const dictionary = {
    vi: {
    home: {
      title: "Cổng Thông Tin Tuyển Dụng",
      tabInput: "Phễu Đầu Vào",
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
      colNew: "Mới",
      colScreening: "TA Duyệt",
      colInterview: "Phỏng vấn V1",
      colInterview2: "Phỏng vấn V2",
      colOffer: "Offer / Hired",
      colRejected: "Đã Loại",
      actionMove: "Chuyển trạng thái",
      actionDetail: "Xem chi tiết",
      actionDecline: "Loại ứng viên (Reject)",
      actionWithdraw: "Withdraw (Quay lại)",
      modalDeclineTitle: "Xác nhận Loại Ứng Viên",
      labelForReason: "Lý do từ chối / thất bại:",
      selectReasonPlaceholder: "Chọn lý do...",
      placeholderReason: "Hoặc nhập lý do khác...",
      btnCancel: "Hủy",
      btnConfirmDecline: "Xác nhận Loại",
      btnSendInvite: "Gửi Invite & Cập Nhật",
      modalInterviewTitle: "Lên Lịch Phỏng Vấn",
      toggleRejected: "Hiển Thị Đã Loại",
      reasons: {
        screening: ["Không phù hợp JD", "Kinh nghiệm chưa đủ", "CV trùng lặp", "Blacklist", "Other"],
        interview: ["Chuyên môn chưa đạt", "Không phù hợp văn hóa", "Fail Tiếng Anh", "Lương kỳ vọng cao", "Không tham gia PV", "Other"],
        offer: ["Từ chối Offer", "Đã nhận việc nơi khác", "Không đạt thỏa thuận lương", "Ghosted", "Other"]
      }
    },
    form: {
      pageTitle: "Nhập Liệu Ứng Viên",
      sourceLabel: "Nguồn Ứng Tuyển",
      sourcePlaceholder: "Chọn nguồn",
      jobLabel: "Vị Trí Ứng Tuyển",
      jobPlaceholder: "Chọn nhanh...",
      jobInputPlaceholder: "Nhập tên vị trí (VD: Marketing Executive...)",
      reqLabel: "Yêu cầu công việc (Ghi chú)",
      reqPlaceholder: "- Yêu cầu 1...",
      cvLabel: "File CV (PDF/Word/Image)",
      uploadBox: "Kéo thả file vào đây hoặc click để chọn",
      uploadFormat: "Hỗ trợ PDF, DOCX, JPG (Max 10MB)",
      btnSubmit: "Xác nhận & Upload",
      btnLoading: "Đang xử lý...",
      btnDelete: "Xóa",
      btnAddCv: "Tải thêm CV",
      successTitle: "Thành công!",
      successDesc: "Đã thêm hồ sơ vào hệ thống.",
      errorTitle: "Lỗi",
      errorMissing: "Vui lòng điền đủ thông tin",
      newUpload: "Thêm ứng viên khác"
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
      colInterview: "Interview Round 1",
      colInterview2: "Interview Round 2",
      colOffer: "Offer / Hired",
      colRejected: "Rejected/Failed", 
      actionMove: "Move Status",
      actionDetail: "View Details",
      actionDecline: "Decline Candidate",
      actionWithdraw: "Withdraw (Go Back)",
      modalDeclineTitle: "Confirm Candidate Rejection",
      labelForReason: "Reason for rejection / failure:",
      selectReasonPlaceholder: "Select reason...",
      placeholderReason: "Or type other reason...",
      btnCancel: "Cancel",
      btnConfirmDecline: "Confirm Reject",
      btnSendInvite: "Send Invite & Update",
      modalInterviewTitle: "Schedule Interview",
      toggleRejected: "Show Rejected",
      reasons: {
        screening: ["Not suitable", "Experience mismatch", "Duplicate", "Blacklist", "Other"],
        interview: ["Technical mismatch", "Cultural mismatch", "English fail", "High salary expectation", "No Show", "Other"],
        offer: ["Declined Offer", "Accepted another job", "Salary negotiation failed", "Ghosted", "Other"]
      }
    },
    form: {
      pageTitle: "Candidate Data Entry",
      sourceLabel: "Source",
      sourcePlaceholder: "Select source",
      jobLabel: "Applied Position",
      jobPlaceholder: "Quick select...",
      jobInputPlaceholder: "Enter position name...",
      reqLabel: "Job Requirements (Notes)",
      reqPlaceholder: "- Requirement 1...",
      cvLabel: "CV File (PDF/Word/Image)",
      uploadBox: "Drag & drop or click to select",
      uploadFormat: "PDF, DOCX, JPG (Max 10MB)",
      btnSubmit: "Confirm & Upload",
      btnLoading: "Processing...",
      btnDelete: "Remove",
      btnAddCv: "Add CV",
      successTitle: "Success!",
      successDesc: "Candidate profile added.",
      errorTitle: "Error",
      errorMissing: "Please fill all details",
      newUpload: "Add another"
    }
  }
};

export type LangType = 'vi' | 'en';
