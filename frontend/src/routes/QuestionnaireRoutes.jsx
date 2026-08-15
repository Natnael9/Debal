import { Routes, Route, Link } from "react-router-dom";

const QuestionnaireWizard = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Questionnaire Wizard</h1>
    <Link to="/app/dashboard" className="text-blue-600 underline">Submit & Go to Dashboard</Link>
  </div>
);

function QuestionnaireRoutes() {
  return (
    <Routes>
      <Route path="/" element={<QuestionnaireWizard />} />
    </Routes>
  );
}

export default QuestionnaireRoutes;