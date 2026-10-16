import { toLabelMap, USER_ROLE_OPTIONS } from "@/lib/options";

describe("toLabelMap", () => {
  it("превращает массив опций в словарь value -> label", () => {
    // Arrange
    const options = [
      { value: "A", label: "Первый" },
      { value: "B", label: "Второй" },
    ];

    // Act
    const result = toLabelMap(options);

    // Assert
    expect(result).toEqual({ A: "Первый", B: "Второй" });
  });

  it("возвращает пустой объект для пустого массива", () => {
    expect(toLabelMap([])).toEqual({});
  });

  it("при дублирующемся value побеждает последняя опция", () => {
    const options = [
      { value: "A", label: "Старое" },
      { value: "A", label: "Новое" },
    ];

    expect(toLabelMap(options)).toEqual({ A: "Новое" });
  });

  it("работает с реальными ролями приложения", () => {
    const roles = toLabelMap(USER_ROLE_OPTIONS);

    expect(roles.MANAGER).toBe("Менеджер");
    expect(roles.SUPER_ADMIN).toBe("Супер-админ");
    expect(roles.UNKNOWN).toBeUndefined();
  });
});
