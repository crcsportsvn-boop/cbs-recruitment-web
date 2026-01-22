
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface RehireModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  availableJobCodes: string[];
  onConfirm: (jobCode: string) => Promise<void>;
}

export default function RehireModal({ isOpen, onClose, candidate, availableJobCodes, onConfirm }: RehireModalProps) {
  const [selectedJob, setSelectedJob] = useState("");

  useEffect(() => {
    if (isOpen && candidate) {
        setSelectedJob(candidate.jobCode || "");
    }
  }, [isOpen, candidate]);

  const handleConfirm = async () => {
    if (!selectedJob) {
        alert("Please select a job code");
        return;
    }
    await onConfirm(selectedJob);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rehire Candidate</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
                You are about to rehire <strong>{candidate?.fullName || candidate?.name}</strong>. 
                Please select the Job Code for this new process.
            </p>
            
            <div className="space-y-2">
                <Label>Select Job Code</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Job Code" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Suggest Current Job */}
                        {candidate?.jobCode && (
                             <SelectItem value={candidate.jobCode} className="font-semibold text-blue-600">
                                {candidate.jobCode} (Current)
                             </SelectItem>
                        )}
                        
                        {/* Other Jobs */}
                        {availableJobCodes
                            .filter(code => code !== candidate?.jobCode)
                            .map(code => (
                                <SelectItem key={code} value={code}>{code}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
                Rehire
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
