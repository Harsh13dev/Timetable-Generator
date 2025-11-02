import { useState, useEffect } from "react";
import DotGrid from "../../../styles/DotGrid/DotGrid";
import InputField from "./components/InputField";
import { useNavigate } from "react-router";
import { useSignIn } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Loader,Eye, EyeOff } from "lucide-react";
import "../../../styles/theme.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetStep, setResetStep] = useState(0);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { signIn, setActive } = useSignIn();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSignInWithEmail = async () => {
    try {
      setIsLoading(true);
      const result = await signIn.create({
        identifier: email,
        password: password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else {
        console.log("Some error");
      }
    } catch (error) {
      console.log("Error in sign in", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error) {
      console.log("Error in sign in with google", error);
      toast.error(error.message);
    }
  };

  const handleSendResetCode = async () => {
    if(!email.trim()){
      toast.error("Please enter your email id")
      return;
    }
    try {
      setIsLoading(true);
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      toast.success("Reset code sent to email");
      setResetStep(1);
    } catch (error) {
      toast.error(error.errors?.[0]?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if(newPassword!==newConfirmPassword){
      toast.error("password verification failed")
      return
    }
    try {
      setIsLoading(true);
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password reset successful");
        setResetStep(0);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.errors?.[0]?.message || "Reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container d-flex flex-column align-items-center justify-content-center min-vh-100 w-100 fs-3">
        <Loader className="loading-spinner" size={40} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="vh-100 dark-gradient-bg" style={{ width: "100%", position: "relative" }}>
      <DotGrid
        dotSize={10}
        gap={15}
        baseColor="#000000"
        activeColor="#3282b8"
        proximity={140}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      >
        <div className="d-flex vh-100 justify-content-center px-3 align-items-center">
          <div className="auth-container rounded-3 p-4" style={{ minWidth: "280px", width: "100%", maxWidth: "400px" }}>
            <h3 className="text-center pt-3 pb-2 auth-title">Log In</h3>
            <div className="d-flex flex-column p-2 w-100 gap-3 justify-content-center align-items-center ">
              {resetStep === 0 && (
                <>
                  <InputField
                    value={email}
                    type="text"
                    placeholder="Enter Email"
                    handleFunction={(e) => setEmail(e.target.value)}
                  />
                  <div className="w-100 position-relative">
                    <InputField
                      value={password}
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Enter Password"
                      handleFunction={(e) => setPassword(e.target.value)}
                    />
                    <div
                      className="position-absolute"
                      style={{ top: "50%", right: "10px", transform: "translateY(-50%)", cursor: "pointer" }}
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                  <button
                    className="auth-button d-flex justify-content-center align-items-center p-2 rounded w-100"
                    style={{ height: "38px", padding: "0 16px" }}
                    onClick={handleSignInWithEmail}
                  >
                    <p className="mb-0">Login</p>
                  </button>
                  <p
                    className="mb-0 hover-underline"
                    style={{ cursor: "pointer" }}
                    onClick={handleSendResetCode}
                  >
                    Forgot Password?
                  </p>
                </>
              )}

              {resetStep === 1 && (
                <>
                  <InputField
                    value={resetCode}
                    type="text"
                    placeholder="Enter Reset Code"
                    handleFunction={(e) => setResetCode(e.target.value)}
                  />
                  <div className="w-100 position-relative">
                    <InputField
                      value={newPassword}
                      type={isNewPasswordVisible ? "text" : "password"}
                      placeholder="Enter New Password"
                      handleFunction={(e) => setNewPassword(e.target.value)}
                    />
                    <div
                      className="position-absolute"
                      style={{ top: "50%", right: "10px", transform: "translateY(-50%)", cursor: "pointer" }}
                      onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                    >
                      {isNewPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                 <div className="w-100 position-relative">
                    <InputField
                      value={newConfirmPassword}
                      type={isConfirmNewPasswordVisible ? "text" : "password"}
                      placeholder="Enter Password"
                      handleFunction={(e) => setNewConfirmPassword(e.target.value)}
                    />
                    <div
                      className="position-absolute"
                      style={{ top: "50%", right: "10px", transform: "translateY(-50%)", cursor: "pointer" }}
                      onClick={() => setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)}
                    >
                      {isConfirmNewPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                  
                  <button
                    className="auth-button d-flex justify-content-center align-items-center p-2 rounded w-100"
                    style={{ height: "38px", padding: "0 16px" }}
                    onClick={handleResetPassword}
                  >
                    <p className="mb-0">Reset Password</p>
                  </button>
                </>
              )}

              <p className="mb-0">or</p>
              <div
                className="google-auth-button rounded-5 p-2 px-3 justify-content-center align-items-center d-flex gap-2"
                style={{ cursor: "pointer" }}
                onClick={handleSignInWithGoogle}
              >
                <p className="mb-0">Continue with Google</p>
                <img src="./google.png" className="rounded-pill" style={{ width: "30px", height: "30px" }} />
              </div>
              <div className="d-flex gap-2">
                <p className="mb-0">Don't have an account?</p>
                <p className="auth-link mb-0" onClick={() => navigate("/sign-up")}>Sign up</p>
              </div>
            </div>
          </div>
        </div>
      </DotGrid>
    </div>
  );
}

export default LoginPage;
