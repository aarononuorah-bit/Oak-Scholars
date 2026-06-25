import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import TutorApply from "./pages/TutorApply";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Account from "./pages/Account";
import StudyResources from "./pages/StudyResources";
import StudyResourcesBooking from "./pages/StudyResourcesBooking";
import SupportGuidance from "./pages/SupportGuidance";
import AcademicSupportForm from "./pages/AcademicSupportForm";
import WellbeingForm from "./pages/WellbeingForm";
import Philosophy from "./pages/Philosophy";
import AnnouncementBanner from "./components/AnnouncementBanner";
import CookieConsent from "./components/CookieConsent";
import { ChatbotWidget } from "./components/ChatbotWidget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/contact" component={Contact} />
      <Route path="/tutor-apply" component={TutorApply} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/account" component={Account} />
      <Route path="/account/:tab" component={Account} />
      <Route path="/study-resources" component={StudyResources} />
      <Route path="/study-resources/order" component={StudyResourcesBooking} />
      <Route path="/support-guidance" component={SupportGuidance} />
      <Route path="/academic-support" component={AcademicSupportForm} />
      <Route path="/wellbeing-support" component={WellbeingForm} />
      <Route path="/philosophy" component={Philosophy} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <AnnouncementBanner />
          <Router />
          <CookieConsent />
          <ChatbotWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
