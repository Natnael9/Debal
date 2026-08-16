import { Routes, Route, Link } from "react-router-dom";
import QuestionnaireWizard from "../pages/QuestionnaireWizard";

function QuestionnaireRoutes() {
  return (
    <Routes>
      <Route path="/" element={<QuestionnaireWizard />} />
    </Routes>
  );
}

export default QuestionnaireRoutes;