'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Company } from "../hooks/useCompaniesData"

interface DeleteCompanyDialogProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
  onDeleteCompany: (companyId: string) => void
}

export function DeleteCompanyDialog({ company, isOpen, onClose, onDeleteCompany }: DeleteCompanyDialogProps) {
  const handleDelete = () => {
    if (company) {
      onDeleteCompany(company._id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {company?.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
