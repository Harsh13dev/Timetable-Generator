import { Routes, Route } from 'react-router-dom';
// import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"
import HomePage from './pages/home/HomePage';
import GeneratePage from './pages/generate/GeneratePage';
import NavBar from './pages/components/NavBar';
import DashbordPage from './pages/dashboard/DashbordPage';
// import SignUpPage from './pages/auth/SignUpPage';
// import LoginPage from './pages/auth/LoginPage';
import AddTeacher from './pages/generate/AddTeacher';
import { Toaster } from 'react-hot-toast';
import TimetableDisplay from './pages/generate/TimetableDisplay';
import GuidePage from './pages/home/GuidePage'; // ✅ added
import EditTimetable from './pages/generate/components/EditTimetable';

function App() {
  return (
    <>
      <Routes>
        <Route element={<NavBar />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/generate/add-teachers" element={<AddTeacher />} />
          <Route path="/dashboard" element={<DashbordPage />} />
          <Route path="/edit-timetable" element={<EditTimetable />} />
          <Route path="/display/:id" element={<TimetableDisplay />} />
          <Route path="/guide" element={<GuidePage />} /> {/* ✅ added */}
        </Route>
        {/* <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/dashboard"} />}/> */}
        {/* <Route path="/sign-up" element={<SignUpPage />} /> */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
      <Toaster/>
    </>
  );
}

export default App;