"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ACTIVE_JOBS, RECRUITMENT_SOURCES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Upload } from "lucide-react";

// Form Schema Validation - Updated for Flexibility
const formSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  jobTitle: z.string().min(1, "Vui lòng nhập vị trí ứng tuyển"),
  requirements: z.string().optional(),
  source: z.string().min(1, "Vui lòng chọn nguồn"),
  file: z.any().refine((files) => files?.length === 1, "Vui lòng upload 1 file CV"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CandidateInputForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      requirements: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const file = data.file[0];
      
      // Try to match job title to existing ID for cleaner file naming, else use "OTHER"
      const matchedJob = ACTIVE_JOBS.find(
        (j) => j.name.toLowerCase() === data.jobTitle.toLowerCase()
      );
      const jobCode = matchedJob ? matchedJob.id : "OTHER";
      const positionId = matchedJob ? matchedJob.positionId : "N/A";

      // 1. Rename Logic: YYYY-MM-DD - JobCode - PositionName - CandidateName.pdf
      const dateStr = new Date().toISOString().split("T")[0];
      const extension = file.name.split(".").pop();
      // Sanitize inputs for filename
      const safeJobName = data.jobTitle.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
      const safeUserName = data.fullName.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
      
      const newFileName = `${dateStr} - ${jobCode} - ${safeJobName} - ${safeUserName}.${extension}`;

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", newFileName);
      formData.append("jobId", jobCode);
      formData.append("positionId", positionId);
      formData.append("source", data.source);
      formData.append("requirements", data.requirements || "");

      // 3. Call API to Upload to Drive
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.details || "Upload failed");
      }

      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi upload: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJobSelect = (value: string) => {
    const job = ACTIVE_JOBS.find((j) => j.id === value);
    if (job) {
      setValue("jobTitle", job.name);
      setValue("requirements", job.requirements.join("\n"));
    }
  };

  const handleSourceChange = (value: string) => {
    setValue("source", value);
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          {success ? (
            <CheckCircle className="text-green-500 h-8 w-8" />
          ) : (
            <Upload className="text-primary h-8 w-8" />
          )}
          Thêm Ứng Viên Mới
        </CardTitle>
        <CardDescription>
          Nhập thông tin và upload CV để hệ thống AI tự động xử lý.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và Tên Ứng Viên <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName.message}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Nguồn Ứng Tuyển <span className="text-red-500">*</span></Label>
              <Select onValueChange={handleSourceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  {RECRUITMENT_SOURCES.map((src) => (
                    <SelectItem key={src} value={src}>
                      {src}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-red-500 text-sm">{errors.source.message}</p>
              )}
            </div>

            {/* Job Position - Hybrid Input */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                 <Label htmlFor="jobTitle">Vị Trí Ứng Tuyển <span className="text-red-500">*</span></Label>
                 <Select onValueChange={handleQuickJobSelect}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Chọn nhanh..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_JOBS.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              
              <Input
                id="jobTitle"
                placeholder="Nhập tên vị trí (VD: Kế toán trưởng)..."
                {...register("jobTitle")}
              />
              {errors.jobTitle && (
                <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>
              )}
            </div>

            {/* Application Requirements (Editable) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="requirements">Yêu cầu công việc (Ghi chú)</Label>
              <Textarea
                id="requirements"
                placeholder="- Yêu cầu 1..."
                className="h-32"
                {...register("requirements")}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="file">File CV (PDF/Word/Image) <span className="text-red-500">*</span></Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  id="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  {...register("file")}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-400">
                    Hỗ trợ PDF, DOCX, JPG (Max 10MB)
                  </p>
                </div>
              </div>
               {errors.file && (
                <p className="text-red-500 text-sm">{errors.file.message as string}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
             <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận & Upload"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
