'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Company } from "../hooks/useCompaniesData"

interface UpdateQuotaDialogProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
  onUpdateQuota: (companyId: string, newQuota: number) => void
}

export function UpdateQuotaDialog({ company, isOpen, onClose, onUpdateQuota }: UpdateQuotaDialogProps) {
  const [newQuota, setNewQuota] = useState("")

  useEffect(() => {
    if (company) {
      setNewQuota(company.interviewQuota.toString())
    }
  }, [company])

  const handleUpdate = () => {
    if (company && newQuota && !isNaN(Number(newQuota))) {
      onUpdateQuota(company._id, Number(newQuota))
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Quota</DialogTitle>
          <DialogDescription>
            Update the interview quota for {company?.companyName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quota" className="text-right">
              New Quota
            </Label>
            <Input
              id="quota"
              value={newQuota}
              onChange={(e) => setNewQuota(e.target.value)}
              className="col-span-3"
              type="number"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleUpdate}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
