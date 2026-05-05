'use client';
import { useState } from "react";
import { Laptop, Bell, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import { useHomeData } from "@/hooks/useHomeData";
import { newsService } from "@/services/newsService";
import trainingService from "@/services/trainingService";
import AssignmentDetailModal from "@/components/training/AssignmentDetailModal";
import MyVoiceModal from "@/components/suggestions/MyVoiceModal";
import BoardLetterModal from "@/components/suggestions/BoardLetterModal";
import PendingActionsBlock from "@/components/home/PendingActionsBlock";
import OnboardingTour from "@/components/common/OnboardingTour";

import GreetingHeader          from "@/components/home/GreetingHeader";
import ProfileCard             from "@/components/home/ProfileCard";
import VacationTrackerCard     from "@/components/home/VacationTrackerCard";
import WhoIsOutToday           from "@/components/home/WhoIsOutToday";
import NewsCarousel            from "@/components/home/NewsCarousel";
import NewsDetailModal         from "@/components/home/NewsDetailModal";
import ActionCard              from "@/components/home/ActionCard";
import MyTasksOverview         from "@/components/home/MyTasksOverview";
import TrainingProgressSection from "@/components/home/TrainingProgressSection";
import TeamVacationBalance     from "@/components/home/TeamVacationBalance";
import EnterpriseSystemsHub    from "@/components/home/EnterpriseSystemsHub";

export default function PersonalArea() {
  const { account }  = useAuth();
  const { darkMode } = useTheme();
  const toast        = useToast();

  // All data-fetching centralised in one hook
  const {
    latestNews,
    myTrainings, loadingTrainings, hasPendingTrainings,
    getPendingTrainings, getTrainingStats, reloadTrainings,
    userDetails, userRole,
    vacationData, loadingVacation,
  } = useHomeData();

  // ── Modal state (UI-only, stays in page) ───────────────────────────────────
  const [selectedNews,        setSelectedNews]        = useState(null);
  const [showNewsModal,       setShowNewsModal]       = useState(false);
  const [showTrainingModal,   setShowTrainingModal]   = useState(false);
  const [selectedAssignment,  setSelectedAssignment]  = useState(null);
  const [showMyVoiceModal,    setShowMyVoiceModal]    = useState(false);
  const [showBoardLetterModal,setShowBoardLetterModal]= useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNewsClick = async (news) => {
    try {
      setSelectedNews(await newsService.getNewsById(news.id));
    } catch {
      setSelectedNews(news);
    }
    setShowNewsModal(true);
  };

  const handleTrainingClick = async (assignment) => {
    try {
      const data = await trainingService.assignments.getById(assignment.id);
      if (data.training) {
        const details  = await trainingService.trainings.getById(data.training);
        data.materials = details.materials ?? [];
      }
      setSelectedAssignment(data);
      setShowTrainingModal(true);
    } catch {
      toast.showError('Failed to load training details');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        <GreetingHeader account={account} />

        {/* Main 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Left */}
          <div className="lg:col-span-3 space-y-5">
            <ProfileCard account={account} userDetails={userDetails} />
            <VacationTrackerCard vacationData={vacationData} loading={loadingVacation} />
            <WhoIsOutToday />
          </div>

          {/* Center */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Daily Spotlight
                </h2>
                <Link
                  href="/communication/company-news"
                  className="text-almet-sapphire dark:text-almet-steel-blue text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  See all updates <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {latestNews.length > 0 && (
                <NewsCarousel news={latestNews} onClick={handleNewsClick} />
              )}
            </div>
            <MyTasksOverview />
          </div>

          {/* Right */}
          <div className="lg:col-span-3 space-y-5">
            <ActionCard
              icon={Laptop} title="IT Support"
              description="Technical issue? Submit your request directly to the IT team."
              buttonText="Submit Request"
              onClick={() => window.open('https://it.myalmet.com/#login', '_blank')}
              color="teal"
            />
            <ActionCard
              icon={Bell} title="My Voice"
              description="Your innovative ideas and feedback help us improve our global culture."
              buttonText="+ Create Suggestion"
              onClick={() => setShowMyVoiceModal(true)}
              color="sapphire"
            />
            <ActionCard
              icon={Mail} title="Letter to Board"
              description="A direct line of communication for confidential board-level inquiries."
              buttonText="Write to Board"
              onClick={() => setShowBoardLetterModal(true)}
              color="purple"
            />
          </div>
        </div>

        {/* Bottom sections — theme classes are now derived internally */}
        <PendingActionsBlock userRole={userRole} />
        <TeamVacationBalance userRole={userRole} />
        <TrainingProgressSection
          hasPendingTrainings={hasPendingTrainings}
          myTrainings={myTrainings}
          getPendingTrainings={getPendingTrainings}
          getTrainingStats={getTrainingStats}
          handleTrainingClick={handleTrainingClick}
        />
        <EnterpriseSystemsHub userRole={userRole} />
      </div>

      {/* Modals */}
      <MyVoiceModal
        show={showMyVoiceModal}
        onClose={() => setShowMyVoiceModal(false)}
        onSuccess={() => {
          toast.showSuccess('Suggestion submitted successfully!');
          setShowMyVoiceModal(false);
        }}
      />
      <BoardLetterModal
        show={showBoardLetterModal}
        onClose={() => setShowBoardLetterModal(false)}
        onSuccess={trackingNumber => {
          toast.showSuccess(`Letter sent! Tracking number: ${trackingNumber}`);
          setShowBoardLetterModal(false);
        }}
      />
      <NewsDetailModal
        isOpen={showNewsModal}
        onClose={() => { setShowNewsModal(false); setSelectedNews(null); }}
        news={selectedNews}
        darkMode={darkMode}
      />
      <AssignmentDetailModal
        show={showTrainingModal}
        assignment={selectedAssignment}
        onClose={() => { setShowTrainingModal(false); setSelectedAssignment(null); }}
        trainingService={trainingService}
        toast={toast}
        onUpdate={reloadTrainings}
        darkMode={darkMode}
      />

      <OnboardingTour />
    </DashboardLayout>
  );
}
