import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeadCard from "./lead-card";

// Фабрика тестовых данных: валидный лид по умолчанию,
// в каждом тесте переопределяем только то, что важно для этого теста.
function makeLead(overrides = {}) {
  return {
    id: "lead-1",
    title: "Поставка оборудования",
    status: "NEW",
    createdAt: "2026-01-15T10:00:00.000Z",
    dateDue: null,
    description: "Нужно 20 ноутбуков",
    client: { name: "ООО Ромашка", phone: "+375 29 111-22-33" },
    assignedTo: null,
    Task: [],
    ...overrides,
  };
}

describe("LeadCard", () => {
  it("показывает заголовок, клиента, телефон и описание", () => {
    render(<LeadCard lead={makeLead()} />);

    expect(screen.getByText("Поставка оборудования")).toBeInTheDocument();
    expect(screen.getByText("ООО Ромашка")).toBeInTheDocument();
    expect(screen.getByText("+375 29 111-22-33")).toBeInTheDocument();
    expect(screen.getByText("Нужно 20 ноутбуков")).toBeInTheDocument();
  });

  it("не показывает блок клиента, если клиента нет", () => {
    render(<LeadCard lead={makeLead({ client: null })} />);

    // queryBy — когда проверяем, что элемента НЕТ (getBy бы упал с ошибкой)
    expect(screen.queryByText("ООО Ромашка")).not.toBeInTheDocument();
  });

  it("показывает 'Не назначен', если ответственного нет", () => {
    render(<LeadCard lead={makeLead({ assignedTo: null })} />);

    expect(screen.getByText("Не назначен")).toBeInTheDocument();
  });

  it("вызывает onOpen с лидом при клике на кнопку 'Открыть лид'", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const lead = makeLead();
    render(<LeadCard lead={lead} onOpen={onOpen} />);

    // имя кнопки берётся из атрибута title — так её "видит" скринридер
    await user.click(screen.getByRole("button", { name: "Открыть лид" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(lead);
  });

  it("не падает при клике, если onOpen не передан", async () => {
    const user = userEvent.setup();
    render(<LeadCard lead={makeLead()} />);

    await user.click(screen.getByRole("button", { name: "Открыть лид" }));
    // если дошли сюда без ошибки — `onOpen?.()` отработал корректно
  });
});
