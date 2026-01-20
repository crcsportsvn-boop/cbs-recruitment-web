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

import { dictionary, LangType } from "@/lib/dictionary";

// ... previous imports ...

// Form Schema Validation - Updated for Flexibility
const formSchema = z.object({
  jobTitle: z.string().min(1, "Vui lòng nhập vị trí ứng tuyển"),
  requirements: z.string().optional(),
  source: z.string().min(1, "Vui lòng chọn nguồn"),
  file: z.any().refine((files) => files?.length >= 1, "Vui lòng upload ít nhất 1 file CV"),
});

type FormValues = z.infer<typeof formSchema>;

interface CandidateInputFormProps {
  lang?: LangType;
}

export default function CandidateInputForm({ lang = 'vi' }: CandidateInputFormProps) {
  const t = dictionary[lang].form;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });


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
    setSuccess(false);
    try {
      const files = Array.from(data.file);
      setUploadProgress({ current: 0, total: files.length });
      
      // Try to match job title to existing ID for cleaner file naming
      const matchedJob = ACTIVE_JOBS.find(
        (j) => j.name.toLowerCase() === data.jobTitle.toLowerCase()
      );
      const jobCode = matchedJob ? matchedJob.id : "OTHER";
      const positionId = matchedJob ? matchedJob.positionId : "N/A";

      // Upload each file with progress tracking
      let completed = 0;
      const uploadPromises = files.map(async (file: any) => {
        // Prepare FormData (use original filename)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", file.name); // Use original filename
        formData.append("jobTitle", data.jobTitle);
        formData.append("source", data.source);
        formData.append("requirements", data.requirements || "");

        // Call API to Upload to Drive
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const resData = await response.json();
          
          // If not authenticated, redirect to OAuth login
          if (response.status === 401 && resData.redirect) {
            window.location.href = resData.redirect;
            return;
          }
          
          throw new Error(resData.details || "Upload failed");
        }

        completed++;
        setUploadProgress({ current: completed, total: files.length });
        return response.json();
      });

      await Promise.all(uploadPromises);

      setSuccess(true);
      reset();
      setUploadProgress({ current: 0, total: 0 });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi upload: ${error.message}`);
      setUploadProgress({ current: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJobSelect = (value: string) => {
    const job = ACTIVE_JOBS.find((j) => j.id === value);
    if (job) {
      setValue("jobTitle", `${job.name} (${job.id}_${job.positionId})`);
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
                placeholder="Nhập tên vị trí (VD: Marketing Executive (HO - 000173_NYS-DYS-HO-135-310))..."
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
              
              {!watch("file")?.[0] ? (
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
              ) : (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{watch("file")[0].name}</p>
                      <p className="text-xs text-green-700">
                        {(watch("file")[0].size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("file", null)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    Xóa
                  </Button>
                </div>
              )}
              
               {errors.file && (
                <p className="text-red-500 text-sm">{errors.file.message as string}</p>
              )}
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {/* Upload Progress Bar */}
            {loading && uploadProgress.total > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                ></div>
                <p className="text-xs text-center mt-1 text-gray-500">
                  Đang tải lên {uploadProgress.current}/{uploadProgress.total} file...
                </p>
              </div>
            )}

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
