// Используем существующий AddPlanForm из предыдущего ответа.
// Убедитесь, что он находится в components/add-plan-form.tsx
// No changes needed to this file from the previous response if it's already created.
// For brevity, I'm not repeating the code here. Assume it exists.
"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Plan } from "@/lib/types"

interface AddPlanFormProps {
  onPlanAdded: (newPlan: Plan) => void
  onCancel: () => void
}

export default function AddPlanForm({ onPlanAdded, onCancel }: AddPlanFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"spending" | "saving" | "fund">("saving")
  const [currentBalance, setCurrentBalance] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !type || currentBalance === "") {
      setError("Name, Type, and Current Balance are required.")
      return
    }

    const planData: Omit<Plan, "id" | "parentId"> = {
      // parentId can be added later
      name,
      type,
      currentBalance: Number.parseFloat(currentBalance),
      description,
      ...(type === "saving" && targetAmount && { targetAmount: Number.parseFloat(targetAmount) }),
      ...(type === "saving" && targetDate && { targetDate }),
    }

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add plan")
      }

      const newPlan = await response.json()
      onPlanAdded(newPlan)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred.")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Plan Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="type">Plan Type</Label>
        <Select value={type} onValueChange={(value: "spending" | "saving" | "fund") => setType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select plan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saving">Saving (Накопление)</SelectItem>
            <SelectItem value="spending">Spending (Трата)</SelectItem>
            <SelectItem value="fund">Fund (Фонд)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="currentBalance">Current Balance</Label>
        <Input
          id="currentBalance"
          type="number"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(e.target.value)}
          required
        />
      </div>
      {type === "saving" && (
        <>
          <div>
            <Label htmlFor="targetAmount">Target Amount</Label>
            <Input
              id="targetAmount"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="targetDate">Target Date</Label>
            <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Plan</Button>
      </div>
    </form>
  )
}
