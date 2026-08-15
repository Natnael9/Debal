import AuthCard from "../components/auth/AuthCard";
import RegisterForm from "../components/auth/RegisterForm";

function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Join Debal and find your perfect roommate match."
    >
      <RegisterForm />
    </AuthCard>
  );
}

export default RegisterPage;