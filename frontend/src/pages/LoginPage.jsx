import AuthCard from "../components/auth/AuthCard";
import LoginForm from "../components/auth/LoginForm";

function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Please enter your details to sign in."
    >
      <LoginForm />
    </AuthCard>
  );
}

export default LoginPage;