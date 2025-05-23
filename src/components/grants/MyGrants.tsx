import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { File, Plus, FileText, FileEdit, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGrantsData } from "@/hooks/useGrantsData";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-800 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  modifications_requested: "bg-orange-50 text-orange-700 border-orange-200",
  active: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
};

const MyGrants: React.FC = () => {
  const { user } = useAuth();
  const { grants, loading, fetchGrants } = useGrantsData();
  const [selectedGrant, setSelectedGrant] = useState<any>(null);
  const [showGrantDetails, setShowGrantDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Remove the duplicate useEffect that causes infinite loop
  // The data is already fetched by the useGrantsData hook

  const startNewApplication = () => {
    navigate("/grant-application");
  };

  const continueApplication = (grantId: string) => {
    navigate(`/grant-application?id=${grantId}`);
  };

  const handleSubmitGrant = async (grantId: string) => {
    try {
      setSubmitting(true);
      // In a real application, you would call an API to update the grant status
      // For this demo, we'll simulate a delay and update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Grant application submitted successfully");
      fetchGrants(); // Refresh the grants list
    } catch (error) {
      console.error("Error submitting grant:", error);
      toast.error("Failed to submit grant application");
    } finally {
      setSubmitting(false);
    }
  };

  const getTabCounts = () => {
    const counts = {
      draft: 0,
      active: 0,
      completed: 0,
      all: grants.length
    };

    grants.forEach(grant => {
      if (grant.status === "draft") {
        counts.draft++;
      } else if (["approved", "active"].includes(grant.status)) {
        counts.active++;
      } else if (grant.status === "completed") {
        counts.completed++;
      }
    });

    return counts;
  };

  const tabCounts = getTabCounts();

  const handleViewGrant = (grant: any) => {
    setSelectedGrant(grant);
    setShowGrantDetails(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Add a safe formatter function to handle potentially undefined values
  const safeFormatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return "$0";
    }
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading grant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Grants</h1>
        <Button onClick={startNewApplication}>
          <Plus className="h-4 w-4 mr-2" />
          Start New Application
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">
            All Grants <Badge className="ml-2 bg-slate-200 text-slate-800">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts & Pending <Badge className="ml-2 bg-slate-200 text-slate-800">{tabCounts.draft}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active <Badge className="ml-2 bg-slate-200 text-slate-800">{tabCounts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge className="ml-2 bg-slate-200 text-slate-800">{tabCounts.completed}</Badge>
          </TabsTrigger>
        </TabsList>

        {["all", "draft", "active", "completed"].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === "all" && "All Grants"}
                  {tab === "draft" && "Draft & Pending Applications"}
                  {tab === "active" && "Active Grants"}
                  {tab === "completed" && "Completed Grants"}
                </CardTitle>
                <CardDescription>
                  {tab === "all" && "All your grant applications and awards"}
                  {tab === "draft" && "Applications in progress or awaiting review"}
                  {tab === "active" && "Currently funded and ongoing grants"}
                  {tab === "completed" && "Past grants that have been completed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                    <div className="col-span-5">Project</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Dates</div>
                    <div className="col-span-3">Actions</div>
                  </div>
                  
                  {grants.length > 0 ? (
                    grants
                      .filter(grant => 
                        tab === "all" ? true : 
                        tab === "draft" ? ["draft", "submitted", "under_review", "rejected", "modifications_requested"].includes(grant.status) :
                        tab === "active" ? ["approved", "active"].includes(grant.status) :
                        tab === "completed" ? grant.status === "completed" : false
                      )
                      .map(grant => (
                        <div 
                          key={grant.id}
                          className="grid grid-cols-12 p-3 text-sm border-t hover:bg-muted/50 transition-colors"
                        >
                          <div className="col-span-5 font-medium flex items-center gap-2">
                            {grant.status === "draft" ? (
                              <FileEdit className="h-4 w-4 text-slate-500" />
                            ) : grant.status === "completed" ? (
                              <FileText className="h-4 w-4 text-teal-600" />
                            ) : (
                              <File className="h-4 w-4 text-[#cf2e2e]" />
                            )}
                            <div>
                              <div className="font-medium">{grant.title}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">
                                  {grant.category.charAt(0).toUpperCase() + grant.category.slice(1)} • 
                                  {grant.fundingSource === "internal" ? " Internal" : " External"} funding
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={statusColors[grant.status]}
                                >
                                  {grant.status.replace(/_/g, " ").split(" ")
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center">
                            {safeFormatNumber(grant.amount)}
                          </div>
                          <div className="col-span-2 flex flex-col justify-center">
                            <div className="text-xs">
                              {grant.startDate ? formatDate(grant.startDate) : 'N/A'} - 
                            </div>
                            <div className="text-xs">
                              {grant.endDate ? formatDate(grant.endDate) : 'N/A'}
                            </div>
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            {grant.status === 'draft' ? (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => continueApplication(grant.id)}
                                >
                                  Continue
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={submitting} 
                                  onClick={() => handleSubmitGrant(grant.id)}
                                >
                                  {submitting ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : null}
                                  Submit
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleViewGrant(grant)}>
                                  View
                                </Button>
                                {['approved', 'active'].includes(grant.status) && (
                                  <Button variant="outline" size="sm">
                                    Submit Report
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <File className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Grants Found</h3>
                      <p className="text-center text-muted-foreground max-w-md mx-auto">
                        You haven't created any grant applications yet. Click the "Start New Application" button to begin.
                      </p>
                      <Button className="mt-4" onClick={startNewApplication}>
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Application
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Grant Details Dialog */}
      <Dialog open={showGrantDetails} onOpenChange={setShowGrantDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedGrant?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedGrant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={statusColors[selectedGrant.status]}
                  >
                    {selectedGrant.status.replace(/_/g, " ").split(" ")
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p className="font-medium">{safeFormatNumber(selectedGrant.amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p>{selectedGrant.category.charAt(0).toUpperCase() + selectedGrant.category.slice(1)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Funding Source</h3>
                  <p>{selectedGrant.fundingSource.charAt(0).toUpperCase() + selectedGrant.fundingSource.slice(1)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                  <p>{selectedGrant.department || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Submitted Date</h3>
                  <p>{selectedGrant.submittedDate ? formatDate(selectedGrant.submittedDate) : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Project Start</h3>
                  <p>{selectedGrant.startDate ? formatDate(selectedGrant.startDate) : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Project End</h3>
                  <p>{selectedGrant.endDate ? formatDate(selectedGrant.endDate) : 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Project Description</h3>
                <p className="text-sm">{selectedGrant.description}</p>
              </div>

              {selectedGrant.reviewComments && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Review Comments</h3>
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    {selectedGrant.reviewComments}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reviewed on {selectedGrant.reviewedDate ? formatDate(selectedGrant.reviewedDate) : "N/A"}
                  </div>
                </div>
              )}

              {['approved', 'active'].includes(selectedGrant.status) && (
                <div className="pt-4 flex justify-end">
                  <Button>
                    Submit Progress Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyGrants;
