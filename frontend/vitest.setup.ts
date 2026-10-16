// матчеры toBeInTheDocument, toBeVisible, toHaveValue и т.д.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// размонтировать отрендеренные компоненты после каждого теста
afterEach(() => {
  cleanup();
});
