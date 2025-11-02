import { useState, useEffect } from "react";
import DotGrid from "../../../styles/DotGrid/DotGrid";
import InputField from "./components/InputField";
import { useNavigate } from "react-router";
import { useSignUp, useUser } from "@clerk/clerk-react";
import { useSignIn } from "@clerk/clerk-react";
import { Loader,Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import "../../../styles/theme.css"; // Import the theme CSS

function SignUpPage() {
  const { signUp, setActive } = useSignUp();
  const {signIn} = useSignIn()
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);


  const handleSignUpWithEmail = async () => {
  try {
    if(!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()){
      toast.error("Enter all details")
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password verification failed");
      return;
    }

    setIsLoading(true);

    const result = await signUp.create({
      emailAddress: email,
      password: password,
    });

    // Step 1: Send verification email
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

    // Now prompt the user to enter the verification code (custom input box)
    const userCode = prompt("Enter the verification code sent to your email");

    // Step 2: Verify the code
    const verificationResult = await signUp.attemptEmailAddressVerification({
      code: userCode,
    });

    // Step 3: If verified, complete signup
    if (verificationResult.status === "complete") {
      await setActive({ session: verificationResult.createdSessionId });

      navigate("/dashboard", {
        state: { name: name },
      });
    }
  } catch (error) {
    console.log("Error in sign up", error);
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
      console.log("Error in sign up with google", error);
    
      toast.error(error.message)
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container d-flex flex-column align-items-center justify-content-center min-vh-100 w-100 fs-3">
        <Loader className="loading-spinner" size={40} />
        <p>Authenticating</p>
      </div>
    );
  }

  return (
    <div
      className="vh-100 dark-gradient-bg"
      style={{ width: "100%", position: "relative" }}
    >
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
        <div className="d-flex vh-100 justify-content-center align-items-center">
          <div
            className="auth-container rounded-3 p-4"
            style={{ minWidth: "280px", width: "100%", maxWidth: "400px" }}
          >
            <h3 className="text-center pt-3 pb-2 auth-title">Sign Up</h3>
            <div className="d-flex flex-column p-2 w-100 gap-3 justify-content-center align-items-center ">
              <InputField
                value={name}
                type="text"
                placeholder="Enter Name"
                handleFunction={(e) => setName(e.target.value)}
              />
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
                <div className="w-100 position-relative">
                    <InputField
                      value={confirmPassword}
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      placeholder="Confirm Password"
                      handleFunction={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div
                      className="position-absolute"
                      style={{ top: "50%", right: "10px", transform: "translateY(-50%)", cursor: "pointer" }}
                      onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    >
                      {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
              
              <button
                className="auth-button d-flex justify-content-center align-items-center p-2 rounded w-100"
                style={{ height: "38px", padding: "0 16px" }}
                onClick={handleSignUpWithEmail}
              >
                <p className="mb-0">Sign Up</p>
              </button>
              <p className="mb-0">or</p>
              <div
                className="google-auth-button rounded-5 p-2 px-3 justify-content-center align-items-center d-flex gap-2"
                style={{ cursor: "pointer" }}
                onClick={handleSignInWithGoogle}
              >
                <p className="mb-0">Continue with Google</p>
                <img
                  src="/google.png"
                  className="rounded-pill"
                  style={{ width: "30px", height: "30px" }}
                />
              </div>
              <div className="d-flex gap-2">
                <p className="mb-0">Already have an account ?</p>
                <p
                  className="auth-link mb-0"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </p>
              </div>
            </div>
          </div>
        </div>
      </DotGrid>
    </div>
  );
}

export default SignUpPage;