// src/routes/QuestionnaireRoutes.jsx

import { Routes, Route } from "react-router-dom";

import QuestionnaireWizard from "../pages/QuestionnaireWizard";

function QuestionnaireRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<QuestionnaireWizard />}
      />
    </Routes>
  );
}

export default QuestionnaireRoutes;