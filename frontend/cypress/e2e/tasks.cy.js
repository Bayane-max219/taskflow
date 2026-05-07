describe("TaskFlow — E2E", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("affiche la page avec le titre TaskFlow", () => {
    cy.contains("h1", "TaskFlow").should("be.visible");
  });

  it("affiche l'état vide au démarrage", () => {
    cy.get("[data-cy=empty-state]").should("be.visible");
  });

  it("ajoute une tâche et la voit apparaître", () => {
    cy.get("[data-cy=task-input]").type("Ma première tâche Cypress");
    cy.get("[data-cy=add-btn]").click();
    cy.get("[data-cy=task-item]").should("have.length.at.least", 1);
    cy.contains("Ma première tâche Cypress").should("be.visible");
  });

  it("marque une tâche comme done", () => {
    cy.get("[data-cy=task-input]").type("Tâche à compléter");
    cy.get("[data-cy=add-btn]").click();
    cy.get("[data-cy=done-btn]").first().click();
    cy.get("[data-cy=task-item]").first().should("have.css", "background-color", "rgb(240, 253, 244)");
  });

  it("supprime une tâche", () => {
    cy.get("[data-cy=task-input]").type("Tâche à supprimer");
    cy.get("[data-cy=add-btn]").click();
    cy.get("[data-cy=task-item]").should("have.length.at.least", 1);
    cy.get("[data-cy=delete-btn]").last().click();
  });
});
