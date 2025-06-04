// This will be our Dashboard page
"use client"

import { useEffect, useState } from "react"
import type { Plan } from "@/lib/types"
import PlanCard from "@/components/plan-card" // Assuming PlanCard is in components/plan-card.tsx
import AddPlanForm from "@/components/add-plan-form" // Assuming AddPlanForm is in components/add-plan-form.tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"

export default function DashboardPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchPlans() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/plans")
        if (!response.ok) {
          throw new Error("Failed to fetch plans")
        }
        const data = await response.json()
        setPlans(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred.")
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const handlePlanAdded = (newPlan: Plan) => {
    setPlans((prevPlans) => [...prevPlans, newPlan])
    setIsAddPlanDialogOpen(false)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard: My Plans</h1>
        <Dialog open={isAddPlanDialogOpen} onOpenChange={setIsAddPlanDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Financial Plan</DialogTitle>
            </DialogHeader>
            <AddPlanForm onPlanAdded={handlePlanAdded} onCancel={() => setIsAddPlanDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading plans...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && plans.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No plans yet. Start by adding a new plan!</p>
        </div>
      )}

      {!isLoading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </>
  )
}
