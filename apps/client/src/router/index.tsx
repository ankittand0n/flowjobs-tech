import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router";

import { BackupOtpPage } from "../pages/auth/backup-otp/page";
import { ForgotPasswordPage } from "../pages/auth/forgot-password/page";
import { AuthLayout } from "../pages/auth/layout";
import { LoginPage } from "../pages/auth/login/page";
import { RegisterPage } from "../pages/auth/register/page";
import { ResetPasswordPage } from "../pages/auth/reset-password/page";
import { VerifyEmailPage } from "../pages/auth/verify-email/page";
import { VerifyOtpPage } from "../pages/auth/verify-otp/page";
import { BuilderLayout } from "../pages/builder/layout";
import { builderLoader, BuilderPage } from "../pages/builder/page";
import { DashboardLayout } from "../pages/dashboard/layout";
import { ResumesPage } from "../pages/dashboard/resumes/page";
import { JobTrackerPage } from "../pages/dashboard/job-tracker/page";
import { SettingsPage } from "../pages/dashboard/settings/page";
import { HomeLayout } from "../pages/home/layout";
import { HomePage } from "../pages/home/page";
import { publicLoader, PublicResumePage } from "../pages/public/page";
import { Providers } from "../providers";
import { AuthGuard } from "./guards/auth";
import { GuestGuard } from "./guards/guest";
import { authLoader } from "./loaders/auth";
import { DashboardPage } from "../pages/dashboard/dashboard/page";
import { InterviewPrepPage } from "../pages/dashboard/interview-prep/page";
import { JobsPage } from "../pages/dashboard/jobs/page";
import { MockTestsPage } from "../pages/dashboard/mock-tests/page";

export const routes = createRoutesFromElements(
  // eslint-disable-next-line lingui/no-unlocalized-strings
  <Route element={<Providers />} hydrateFallbackElement={<div>Loading...</div>}>
    <Route element={<HomeLayout />}>
      <Route path="/" element={<HomePage />} />
    </Route>

    <Route path="auth">
      <Route element={<AuthLayout />}>
        <Route element={<GuestGuard />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Password Recovery */}
        <Route element={<GuestGuard />}>
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Two-Factor Authentication */}
        <Route element={<GuestGuard />}>
          <Route path="verify-otp" element={<VerifyOtpPage />} />
          <Route path="backup-otp" element={<BackupOtpPage />} />
        </Route>

        {/* Email Verification */}
        <Route element={<AuthGuard />}>
          <Route path="verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* OAuth Callback */}
        <Route path="callback" loader={authLoader} />
      </Route>

      <Route index element={<Navigate replace to="/auth/login" />} />
    </Route>

    <Route path="dashboard">
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="resumes" element={<ResumesPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="job-tracker" element={<JobTrackerPage />} />
          <Route path="mock-tests" element={<MockTestsPage />} />
          <Route path="interview-prep" element={<InterviewPrepPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route index element={<Navigate replace to="/dashboard/resumes" />} />
        </Route>
      </Route>
    </Route>

    <Route path="builder">
      <Route element={<AuthGuard />}>
        <Route element={<BuilderLayout />}>
          <Route path=":id" loader={builderLoader} element={<BuilderPage />} />

          <Route index element={<Navigate replace to="/dashboard/resumes" />} />
        </Route>
      </Route>
    </Route>

    {/* Public Routes */}
    <Route path=":username">
      <Route path=":slug" loader={publicLoader} element={<PublicResumePage />} />
    </Route>
  </Route>,
);

export const router = createBrowserRouter(routes);
