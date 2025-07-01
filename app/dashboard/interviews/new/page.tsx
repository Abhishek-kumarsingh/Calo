"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link"; // Import Link
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select"; // Added SelectSeparator
import { useToast } from "@/hooks/use-toast";
import {
  Code,
  Database,
  Layers,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Wand2,
  Users, // Changed from UserPlus for clarity for "Assign Candidate"
  Sparkles,
} from "lucide-react";
import { QuestionTypeSelector } from "@/components/interview/question-type-selector";
import { QuestionBankList } from "@/components/interview/question-bank-list";
import { interviewApi, handleApiError, withRetry } from "@/lib/api-utils-updated";
import { cn } from "@/lib/utils";

// --- Constants for Domains, SubDomains, Levels ---
const domains = [
  {
    id: "frontend",
    name: "Frontend",
    description: "Web interfaces, client-side logic",
    icon: Code,
  },
  {
    id: "backend",
    name: "Backend",
    description: "Server-side logic, APIs, databases",
    icon: Database,
  },
  {
    id: "fullstack",
    name: "Full Stack",
    description: "End-to-end application development",
    icon: Layers,
  },
  {
    id: "data_science",
    name: "Data Science",
    description: "Analysis, ML, statistics",
    icon: BarChart3,
  },
];

const subDomains: Record<string, Array<{ id: string; name: string }>> = {
  frontend: [
    { id: "react", name: "React" },
    { id: "angular", name: "Angular" },
    { id: "vuejs", name: "Vue.js" },
    { id: "javascript_fundamentals", name: "JavaScript Fundamentals" },
    { id: "html_css", name: "HTML & CSS" },
    { id: "web_performance", name: "Web Performance" },
  ],
  backend: [
    { id: "nodejs_express", name: "Node.js & Express" },
    { id: "python_django_flask", name: "Python (Django/Flask)" },
    { id: "java_spring", name: "Java (Spring Boot)" },
    { id: "dotnet_core", name: ".NET Core" },
    { id: "sql_databases", name: "SQL Databases" },
    { id: "nosql_databases", name: "NoSQL Databases" },
    { id: "api_design_security", name: "API Design & Security" },
    { id: "system_architecture", name: "System Architecture" },
  ],
  fullstack: [
    { id: "mern_stack", name: "MERN Stack" },
    { id: "mean_stack", name: "MEAN Stack" },
    {
      id: "python_fullstack_django_react",
      name: "Python Full Stack (Django/React)",
    },
    {
      id: "java_fullstack_spring_angular",
      name: "Java Full Stack (Spring/Angular)",
    },
    { id: "cloud_native_applications", name: "Cloud-Native Applications" },
    { id: "devops_cicd", name: "DevOps & CI/CD" },
  ],
  data_science: [
    {
      id: "python_pandas_numpy_sklearn",
      name: "Python (Pandas, NumPy, Scikit-learn)",
    },
    { id: "machine_learning_algorithms", name: "Machine Learning Algorithms" },
    { id: "statistical_modeling", name: "Statistical Modeling" },
    {
      id: "data_visualization",
      name: "Data Visualization (Matplotlib, Seaborn)",
    },
    { id: "big_data_spark_hadoop", name: "Big Data (Spark, Hadoop)" },
  ],
};

const levels = [
  {
    id: "entry-level",
    name: "Entry-Level",
    description: "Foundational concepts, for interns or fresh graduates.",
  },
  {
    id: "junior",
    name: "Junior",
    description: "Basic practical skills, 0-2 years of experience.",
  },
  {
    id: "mid-level",
    name: "Mid-Level",
    description: "Solid experience, 2-5 years, can work independently.",
  },
  {
    id: "senior",
    name: "Senior",
    description: "Deep expertise, 5+ years, architectural skills.",
  },
  {
    id: "principal_staff",
    name: "Principal/Staff",
    description: "Expert level, broad impact, technical vision.",
  },
];
// --- End Constants ---

interface CandidateOption {
  id: string;
  name: string;
  email?: string | null;
}

// Constant for the "None" option in Candidate Select
const NO_CANDIDATE_VALUE = "__NONE_CANDIDATE__";

export default function NewInterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSubDomain, setSelectedSubDomain] = useState<string | null>(
    null
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(levels[1].id); // Default to Junior

  // State to track the current step in the interview creation process
  const [currentStep, setCurrentStep] = useState<'domain' | 'subdomain' | 'level' | 'candidate' | 'questions'>('domain');

  // For Candidate Select:
  // `selectedCandidateId` will store the actual ID or NO_CANDIDATE_VALUE for the "None" item.
  // The Select component's `value` will be this state.
  // The placeholder will show if this state is an empty string "".
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(""); // Initialize to "" for placeholder
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(true); // Start true

  // Question configuration
  const [questionQuantity, setQuestionQuantity] = useState<number>(5);
  const [questionTypes, setQuestionTypes] = useState({
    text: true,
    multipleChoice: false,
    coding: false,
    codeCorrection: false
  });
  const [questionTypeDistribution, setQuestionTypeDistribution] = useState({
    text: 100,
    multipleChoice: 0,
    coding: 0,
    codeCorrection: 0
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>("setup"); // "setup" or "bank"
  const [interviewDuration, setInterviewDuration] = useState<number>(60);
  const [isLoadingAPI, setIsLoadingAPI] = useState(false); // For createInterview API call
  const [formError, setFormError] = useState<string | null>(null);

  // Effect to manage step transitions based on selections
  useEffect(() => {
    if (!selectedDomain) {
      // If domain is cleared, go back to domain selection
      setCurrentStep('domain');
      setSelectedSubDomain(null);
    } else if (selectedDomain && !selectedSubDomain) {
      // If domain is selected but no subdomain, go to subdomain selection
      setCurrentStep('subdomain');
    }
  }, [selectedDomain, selectedSubDomain]);

  // We'll remove the automatic step transitions to give the user more control
  // This ensures they can navigate through each step sequentially

  const fetchCandidates = useCallback(async () => {
    if (sessionStatus !== "authenticated") return;
    setLoadingCandidates(true);
    try {
      const fetchedCandidates: CandidateOption[] = await withRetry(() =>
        interviewApi.getAllCandidates()
      );
      setCandidates(fetchedCandidates || []);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Failed to load candidates",
        description: handleApiError(error, () => {}),
        variant: "destructive",
      });
    } finally {
      setLoadingCandidates(false);
    }
  }, [sessionStatus, toast]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleCreateInterview = async () => {
    if (!session?.user?.id) {
      setFormError("Authentication required. Please log in.");
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to create an interview.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDomain || !selectedSubDomain || !selectedLevel) {
      setFormError(
        "Please complete all selections: Domain, Sub-Domain, and Level."
      );
      toast({
        title: "Missing Selections",
        description: "Ensure domain, sub-domain, and level are chosen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingAPI(true);
    setFormError(null);

    const domainObj = domains.find((d) => d.id === selectedDomain);
    const subDomainObj = subDomains[selectedDomain]?.find(
      (sd) => sd.id === selectedSubDomain
    );
    const levelObj = levels.find((l) => l.id === selectedLevel);
    const candidateObj = candidates.find((c) => c.id === selectedCandidateId);

    const interviewTitle = `AI Interview: ${
      subDomainObj?.name || selectedSubDomain
    } (${levelObj?.name || selectedLevel})${
      candidateObj ? ` for ${candidateObj.name}` : ""
    }`;

    const payload: Record<string, any> = {
      title: interviewTitle,
      domain: selectedDomain,
      subDomain: selectedSubDomain,
      level: selectedLevel,
      type: "ai_generated",
      status: "pending_ai_generation",
      userId: session.user.id,
      duration: interviewDuration,
      questionQuantity: questionQuantity,
      questionTypes: questionTypes,
      questionTypeDistribution: questionTypeDistribution
    };

    // Only include candidateId if a valid candidate (not the "None" option) is selected
    if (
      selectedCandidateId &&
      selectedCandidateId !== NO_CANDIDATE_VALUE &&
      selectedCandidateId !== ""
    ) {
      payload.candidateId = selectedCandidateId;
    }

    try {
      console.log("Creating interview with payload:", payload);

      // Check if token exists in localStorage or sessionStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
      console.log(`Token available before API call: ${token ? 'Yes' : 'No'}`);

      // Use withRetry to attempt the API call multiple times if it fails
      const newInterview = await withRetry(() => interviewApi.createInterview(payload), 2, 1000);
      console.log("Interview created successfully:", newInterview);

      toast({
        title: "Interview Created 🎉",
        description: `"${
          newInterview.title || "Your AI interview"
        }" is ready for setup.`,
        className: "bg-green-600 text-white dark:bg-green-700",
      });

      router.push(`/dashboard/interviews/${newInterview.id}/setup`);
    } catch (error: any) {
      console.error("Error creating interview:", error);

      // More detailed error logging
      if (error.status) {
        console.error(`HTTP Status: ${error.status}`);
      }
      if (error.responseData) {
        console.error("Response data:", error.responseData);
      }

      let errorMessage = handleApiError(error, setFormError);

      // Provide more helpful error messages based on common issues
      if (error.status === 401) {
        errorMessage = "Authentication failed. Please try logging out and back in.";
      } else if (error.status === 500) {
        errorMessage = "Server error. This might be due to invalid data or a temporary server issue.";
      }

      toast({
        title: "Creation Failed",
        description: errorMessage || "Could not create the interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAPI(false);
    }
  };

  const currentSubDomains = selectedDomain
    ? subDomains[selectedDomain] || []
    : [];

  // Handle page loading state (session and initial candidate fetch)
  if (
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" &&
      loadingCandidates &&
      candidates.length === 0)
  ) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading setup...</p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">
          Access Denied
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You need to be logged in to create an interview.
        </p>
        <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-5xl">
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/interviews")}
          className="mb-4 -ml-3 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to All Interviews
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Craft Your AI Interview
        </h1>
        <p className="text-md md:text-lg text-muted-foreground">
          Tailor the interview by selecting a domain, sub-topic, and difficulty.
        </p>
      </div>

      {formError && (
        <Alert variant="destructive" className="mb-6 shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hold Up!</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="setup">Interview Setup</TabsTrigger>
          <TabsTrigger value="bank">Question Bank</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-0">
          <div className="space-y-8 md:space-y-10">
            {/* Dynamic Step Card - Shows only one step at a time */}
            <Card className="shadow-lg border dark:border-slate-700">
              {/* Domain Selection Step */}
              {currentStep === 'domain' && (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">
                        1
                      </span>
                      Choose Domain
                    </CardTitle>
                    <CardDescription className="pl-10">
                      Select the primary technical area for the interview.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {domains.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={selectedDomain === item.id}
                            className={cn(
                              "p-4 border dark:border-slate-700 rounded-lg text-left transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:focus-visible:ring-offset-slate-900",
                              selectedDomain === item.id
                                ? "bg-primary/10 border-primary ring-2 ring-primary dark:border-primary shadow-md"
                                : "hover:bg-accent hover:border-accent-foreground/30 dark:hover:bg-slate-800 dark:hover:border-slate-600"
                            )}
                            onClick={() => setSelectedDomain(item.id)}
                          >
                            <Icon className="h-5 w-5 text-primary mb-2" />
                            <h3 className="font-semibold text-md mb-1">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </>
              )}

              {/* Sub-Domain Selection Step */}
              {currentStep === 'subdomain' && (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">
                        2
                      </span>
                      Specify Sub-Domain
                    </CardTitle>
                    <CardDescription className="pl-10">
                      Narrow down the focus within {domains.find((d) => d.id === selectedDomain)?.name || 'the selected domain'}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs"
                        onClick={() => {
                          setSelectedDomain(null);
                          setCurrentStep('domain');
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Back to Domains
                      </Button>
                      <div className="ml-3 text-sm font-medium text-muted-foreground">
                        Selected: <span className="text-foreground">{domains.find(d => d.id === selectedDomain)?.name}</span>
                      </div>
                    </div>

                    {currentSubDomains.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {currentSubDomains.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={selectedSubDomain === item.id}
                            className={cn(
                              "p-3 border dark:border-slate-700 rounded-md text-left transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:focus-visible:ring-offset-slate-900",
                              selectedSubDomain === item.id
                                ? "bg-primary/10 border-primary ring-2 ring-primary dark:border-primary font-semibold"
                                : "hover:bg-accent hover:border-accent-foreground/30 dark:hover:bg-slate-800 dark:hover:border-slate-600"
                            )}
                            onClick={() => setSelectedSubDomain(item.id)}
                          >
                            <h3 className="text-sm">{item.name}</h3>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No specific sub-domains configured for{" "}
                        {domains.find((d) => d.id === selectedDomain)?.name}. The AI
                        will use general{" "}
                        {domains.find((d) => d.id === selectedDomain)?.name}{" "}
                        knowledge.
                      </p>
                    )}

                    {selectedSubDomain && (
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={() => setCurrentStep('level')}
                          className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Continue to Difficulty Level
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Level Selection Step */}
              {currentStep === 'level' && (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">
                        3
                      </span>
                      Determine Difficulty Level
                    </CardTitle>
                    <CardDescription className="pl-10">
                      Set the complexity of the questions to be generated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs"
                        onClick={() => {
                          setCurrentStep('subdomain');
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Back to Sub-Domains
                      </Button>
                      <div className="ml-3 text-sm font-medium text-muted-foreground">
                        Selected: <span className="text-foreground">
                          {domains.find(d => d.id === selectedDomain)?.name} / {currentSubDomains.find(sd => sd.id === selectedSubDomain)?.name}
                        </span>
                      </div>
                    </div>

                    <Tabs
                      value={selectedLevel}
                      onValueChange={setSelectedLevel}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 h-auto p-1 bg-muted dark:bg-slate-800 rounded-lg">
                        {levels.map((level) => (
                          <TabsTrigger
                            key={level.id}
                            value={level.id}
                            className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2.5 h-auto data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700"
                          >
                            {level.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {levels.map((level) => (
                        <TabsContent
                          key={level.id}
                          value={level.id}
                          className="mt-3 p-4 border-t dark:border-slate-700 rounded-b-md"
                        >
                          <h3 className="font-semibold text-md mb-1.5">
                            {level.name} Questions
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {level.description}
                          </p>
                        </TabsContent>
                      ))}
                    </Tabs>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setCurrentStep('candidate')}
                        className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Continue to Candidate Selection
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Candidate & Duration Selection Step */}
              {currentStep === 'candidate' && (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">
                        4
                      </span>
                      Assign Candidate & Set Duration
                    </CardTitle>
                    <CardDescription className="pl-10">
                      Optionally link a candidate and specify the interview duration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs"
                        onClick={() => {
                          setCurrentStep('level');
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Back to Difficulty Level
                      </Button>
                      <div className="ml-3 text-sm font-medium text-muted-foreground">
                        Selected: <span className="text-foreground">
                          {levels.find(l => l.id === selectedLevel)?.name} Level
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label
                            htmlFor="candidateSelect"
                            className="text-sm font-medium flex items-center mb-1.5"
                          >
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            Assign Candidate (Optional)
                          </Label>
                          <Select
                            value={selectedCandidateId}
                            onValueChange={(value) => {
                              setSelectedCandidateId(
                                value === NO_CANDIDATE_VALUE ? "" : value
                              );
                            }}
                            disabled={loadingCandidates}
                          >
                            <SelectTrigger id="candidateSelect" className="text-sm">
                              <SelectValue
                                placeholder={
                                  loadingCandidates
                                    ? "Loading candidates..."
                                    : "Select a candidate or leave unassigned"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NO_CANDIDATE_VALUE}>
                                <em>-- Unassigned --</em>
                              </SelectItem>
                              {candidates.length > 0 && <SelectSeparator />}
                              {candidates.map((candidate) => (
                                <SelectItem key={candidate.id} value={candidate.id}>
                                  {candidate.name}{" "}
                                  {candidate.email ? `(${candidate.email})` : ""}
                                </SelectItem>
                              ))}
                              {!loadingCandidates && candidates.length === 0 && (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No candidates available.{" "}
                                  <Link
                                    href="/dashboard/candidates/new"
                                    className="text-primary hover:underline"
                                  >
                                    Add one?
                                  </Link>
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigning a candidate helps in tracking.
                          </p>
                        </div>
                        <div>
                          <Label
                            htmlFor="duration"
                            className="text-sm font-medium flex items-center mb-1.5"
                          >
                            Interview Duration (minutes)
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            value={interviewDuration}
                            onChange={(e) =>
                              setInterviewDuration(
                                Math.max(10, parseInt(e.target.value, 10) || 60)
                              )
                            }
                            min="10"
                            max="180"
                            step="5"
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Typical AI interviews are 30-90 minutes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setCurrentStep('questions')}
                        className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Continue to Question Configuration
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Question Configuration Step */}
              {currentStep === 'questions' && (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">
                        5
                      </span>
                      Configure Questions
                    </CardTitle>
                    <CardDescription className="pl-10">
                      Customize the number and types of questions for this interview.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-xs"
                        onClick={() => {
                          setCurrentStep('candidate');
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Back to Candidate & Duration
                      </Button>
                      <div className="ml-3 text-sm font-medium text-muted-foreground">
                        Selected: <span className="text-foreground">
                          {selectedCandidateId && selectedCandidateId !== NO_CANDIDATE_VALUE
                            ? candidates.find(c => c.id === selectedCandidateId)?.name + " | "
                            : ""}
                          {interviewDuration} minutes duration
                        </span>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                      <h3 className="text-sm font-medium mb-2">Current Question Configuration:</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="text-xs px-2 py-1 bg-primary/10 rounded-full text-primary font-medium">
                          {questionQuantity} Questions
                        </div>
                        {questionTypes.text && (
                          <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                            Text Questions: {questionTypeDistribution.text}%
                          </div>
                        )}
                        {questionTypes.multipleChoice && (
                          <div className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                            Multiple Choice: {questionTypeDistribution.multipleChoice}%
                          </div>
                        )}
                        {questionTypes.coding && (
                          <div className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                            Coding: {questionTypeDistribution.coding}%
                          </div>
                        )}
                        {questionTypes.codeCorrection && (
                          <div className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                            Code Correction: {questionTypeDistribution.codeCorrection}%
                          </div>
                        )}
                      </div>
                    </div>

                    <QuestionTypeSelector
                      onQuantityChange={setQuestionQuantity}
                      onTypesChange={setQuestionTypes}
                      onDistributionChange={setQuestionTypeDistribution}
                      initialQuantity={questionQuantity}
                      initialTypes={questionTypes}
                      initialDistribution={questionTypeDistribution}
                    />

                    <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4">
                      <p className="text-xs text-muted-foreground text-center sm:text-right flex-grow order-2 sm:order-1">
                        Review selections carefully.
                        <br /> AI questions will be generated in the next step.
                      </p>
                      <Button
                        size="lg"
                        onClick={handleCreateInterview}
                        disabled={isLoadingAPI || sessionStatus !== "authenticated"}
                        className="w-full sm:w-auto min-w-[240px] text-base py-3 order-1 sm:order-2"
                      >
                        {isLoadingAPI ? (
                          <Loader2 className="h-5 w-5 mr-2.5 animate-spin" />
                        ) : (
                          <Wand2 className="h-5 w-5 mr-2.5" />
                        )}
                        {isLoadingAPI ? "Processing..." : "Create & Proceed to Setup"}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bank">
          <QuestionBankList
            onExport={(questionBank) => {
              toast({
                title: "Export Successful",
                description: `Exported ${questionBank.title} successfully`,
              });
            }}
            onDelete={(questionBankId) => {
              toast({
                title: "Question Bank Deleted",
                description: "The question bank has been deleted successfully",
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
