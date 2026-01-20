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
  CardFooter,
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, Upload } from "lucide-react";

// Form Schema Validation
const formSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  jobId: z.string().min(1, "Vui lòng chọn vị trí"),
  source: z.string().min(1, "Vui lòng chọn nguồn"),
  file: z.any().refine((files) => files?.length === 1, "Vui lòng upload 1 file CV"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CandidateInputForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedJob, setSelectedJob] = useState(ACTIVE_JOBS[0]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const file = data.file[0];
      const job = ACTIVE_JOBS.find((j) => j.id === data.jobId);
      if (!job) throw new Error("Job not found");

      // 1. Rename Logic: YYYY-MM-DD - JobCode - PositionName - CandidateName.pdf
      const dateStr = new Date().toISOString().split("T")[0];
      const extension = file.name.split(".").pop();
      const newFileName = `${dateStr} - ${job.id} - ${job.name} - ${data.fullName}.${extension}`;

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", newFileName);
      formData.append("jobId", job.id);
      formData.append("positionId", job.positionId);
      formData.append("source", data.source);

      // 3. Call API to Upload to Drive
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi upload CV!");
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (value: string) => {
    setValue("jobId", value);
    const job = ACTIVE_JOBS.find((j) => j.id === value);
    if (job) setSelectedJob(job);
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

            {/* Job Position */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jobId">Vị Trí Ứng Tuyển <span className="text-red-500">*</span></Label>
              <Select onValueChange={handleJobChange} defaultValue={ACTIVE_JOBS[0].id}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_JOBS.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name} ({job.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobId && (
                <p className="text-red-500 text-sm">{errors.jobId.message}</p>
              )}
            </div>

            {/* Auto-filled Requirements (ReadOnly) */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-muted-foreground">Yêu cầu công việc (Tham khảo)</Label>
              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                <ul className="list-disc pl-5 space-y-1">
                  {selectedJob?.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
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
                  Đang upload và xử lý...
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
